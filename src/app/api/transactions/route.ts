import { auth } from "@/lib/auth";
import { getTransactionImpact, normalizeTransactionAmount, roundMoney } from "@/lib/money";
import { PrismaDb } from "@/lib/prismaDB";
import { NextResponse } from "next/server";

const serializeDecimal = (obj: any) => {
    const serialized: any = { ...obj };
    if (obj?.balance != null) serialized.balance = Number(obj.balance);
    if (obj?.amount != null) serialized.amount = Number(obj.amount);
    return serialized;
};


/**
 * GET /api/transactions
 * Returns all transactions for the current user (sorted newest first),
 * with money fields serialized to plain numbers. This typically serves dashboard transaction lists.
 */

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all user transactions without including account to avoid relation errors
        const transactions = await PrismaDb.transaction.findMany({
            where: { userId: session.user.id },
            orderBy: { date: "desc" },
        });

        // Fetch accounts separately
        const accounts = await PrismaDb.financialAccount.findMany({
            where: { userId: session.user.id },
            select: { id: true, name: true, icon: true }
        });

        const accountMap = new Map();
        accounts.forEach(acc => accountMap.set(acc.id, { name: acc.name, icon: acc.icon }));

        // Serialize and normalize for frontend consumption
        const serialized = transactions.map((t) => {
            const tObj = { ...t };
            return {
                ...serializeDecimal(tObj),
                type: tObj.type.toLowerCase(), // DB stores INCOME/EXPENSE, frontend expects income/expense
                account: accountMap.get(tObj.accountId) || { name: "Unknown Account", icon: "🏦" }
            };
        });

        return NextResponse.json(serialized);


    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


/**
 * Handles creation of transactions.
 * Expects a JSON body: { data: string[] }
 */
export async function POST(req: Request) {
    try {
        const session: any = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json(); // transaction data sent from client

        // Fetch User
        const user = await PrismaDb.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const transactionsInput = Array.isArray(body) ? body : body?.transactions;
        const isBulkCreate = Array.isArray(transactionsInput);

        if (isBulkCreate) {
            if (transactionsInput.length === 0) {
                return NextResponse.json({ error: "No transactions provided" }, { status: 400 });
            }

            const accountIds = Array.from(new Set(transactionsInput.map((tx: any) => tx?.accountId).filter(Boolean)));
            const accounts = await PrismaDb.financialAccount.findMany({
                where: { userId: user.id, id: { in: accountIds } },
                select: { id: true, balance: true }
            });

            if (accountIds.length !== accounts.length) {
                return NextResponse.json({ error: "One or more accounts were not found" }, { status: 404 });
            }

            const accountBalanceChanges: Record<string, number> = {};
            for (const tx of transactionsInput) {
                if (!tx?.accountId || tx?.amount == null || !tx?.description) {
                    return NextResponse.json({ error: "Invalid transaction payload" }, { status: 400 });
                }

                const impact = getTransactionImpact(tx.type, tx.amount);
                accountBalanceChanges[tx.accountId] = roundMoney((accountBalanceChanges[tx.accountId] ?? 0) + impact);
            }

            const createdTransactions = await PrismaDb.$transaction(async (tx) => {
                const created = [];

                for (const transactionInput of transactionsInput) {
                    const normalizedTransaction = {
                        ...transactionInput,
                        amount: normalizeTransactionAmount(transactionInput.amount),
                        type: String(transactionInput.type).toUpperCase() === "EXPENSE" ? "EXPENSE" : "INCOME",
                    };
                    const newTransaction = await tx.transaction.create({
                        data: {
                            ...normalizedTransaction,
                            userId: user.id
                        }
                    });
                    created.push(newTransaction);
                }

                for (const [accountId, change] of Object.entries(accountBalanceChanges)) {
                    await tx.financialAccount.update({
                        where: { id: accountId },
                        data: { balance: { increment: change } }
                    });
                }

                return created;
            });

            return NextResponse.json(
                {
                    success: true,
                    data: createdTransactions.map((transaction) => serializeDecimal(transaction)),
                    createdCount: createdTransactions.length,
                },
                { status: 201 }
            );
        }

        // Fetch Account
        const account = await PrismaDb.financialAccount.findUnique({
            where: { id: body.accountId, userId: user.id }
        })

        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        // Balance calculation
        const normalizedBody = {
            ...body,
            amount: normalizeTransactionAmount(body.amount),
            type: String(body.type).toUpperCase() === "EXPENSE" ? "EXPENSE" : "INCOME",
        };
        const balanceChange = getTransactionImpact(normalizedBody.type, normalizedBody.amount);
        const newBalance = roundMoney(Number(account.balance) + balanceChange);

        // Create transaction + update balance
        const transaction = await PrismaDb.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...normalizedBody,
                    userId: user.id
                }
            })

            await tx.financialAccount.update({
                where: { id: normalizedBody.accountId },
                data: { balance: newBalance }
            })

            return newTransaction;
        })

        // Trigger budget check email (non-blocking)
        try {
            const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
            fetch(`${baseUrl}/api/email/budget-check`, {
                method: "POST",
                headers: {
                    cookie: req.headers.get("cookie") || "",
                },
            }).catch(() => { /* silent - email is best-effort */ });
        } catch { /* silent */ }

        return NextResponse.json(
            { success: true, data: serializeDecimal(transaction) },
            { status: 201 }
        );
    } catch (error) {


        console.error("CREATE TRANSACTION ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });

    }
}



/**
 * PUT /api/transactions/:id
 * Updates a single transaction
 * Expects: { id, description, amount, category, type, date, accountId }
 */
export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
        }

        // Find the transaction to verify it belongs to the user
        const existingTransaction = await PrismaDb.transaction.findUnique({
            where: { id }
        });

        if (!existingTransaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        if (existingTransaction.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // If accountId changed, validate new account belongs to user
        if (updateData.accountId && updateData.accountId !== existingTransaction.accountId) {
            const newAccount = await PrismaDb.financialAccount.findUnique({
                where: { id: updateData.accountId, userId: session.user.id }
            });
            if (!newAccount) {
                return NextResponse.json({ error: "New account not found" }, { status: 404 });
            }
        }

        // Normalize the update data
        const normalizedUpdate = {
            ...updateData,
            amount: updateData.amount ? normalizeTransactionAmount(updateData.amount) : existingTransaction.amount,
            type: updateData.type ? String(updateData.type).toUpperCase() : existingTransaction.type,
        };

        // If amount or type changed, recalculate account balance
        let balanceUpdateRequired = false;
        let balanceChanges: Record<string, number> = {};

        if (normalizedUpdate.type !== existingTransaction.type || normalizedUpdate.amount !== existingTransaction.amount) {
            balanceUpdateRequired = true;

            // Reverse old transaction impact
            const oldImpact = getTransactionImpact(existingTransaction.type, Number(existingTransaction.amount));
            balanceChanges[existingTransaction.accountId] = -oldImpact;

            // Apply new transaction impact
            const newImpact = getTransactionImpact(normalizedUpdate.type, normalizedUpdate.amount);
            balanceChanges[updateData.accountId || existingTransaction.accountId] =
                (balanceChanges[updateData.accountId || existingTransaction.accountId] ?? 0) + newImpact;
        }

        // Update transaction and balance in a transaction
        const updated = await PrismaDb.$transaction(async (tx) => {
            const updatedTx = await tx.transaction.update({
                where: { id },
                data: normalizedUpdate
            });

            if (balanceUpdateRequired) {
                for (const [accountId, change] of Object.entries(balanceChanges)) {
                    await tx.financialAccount.update({
                        where: { id: accountId },
                        data: { balance: { increment: change } }
                    });
                }
            }

            return updatedTx;
        });

        return NextResponse.json(
            { success: true, data: serializeDecimal(updated) },
            { status: 200 }
        );
    } catch (error) {
        console.error("UPDATE TRANSACTION ERROR:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}


/**
 * Handles bulk deletion of transactions.
 * Expects a JSON body: { transactionIds: string[] }
 */
export async function DELETE(request: Request) {
    try {
        // 1. Authentication (Using NextAuth session)
        const session = await auth(); // Pass your authOptions here

        // We will use the user's ID from the NextAuth session, assuming it's linked to your db.user table
        const nextAuthUserId = session?.user?.id;

        if (!session || !nextAuthUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse Request Body
        const { transactionIds } = await request.json();
        console.log("Received transactionIds for deletion:", transactionIds);

        if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
            return NextResponse.json({ error: "Invalid or empty transactionIds array provided." }, { status: 400 });
        }

        // 3. Find User (using the ID provided by NextAuth session)

        const user = await PrismaDb.user.findUnique({ where: { id: nextAuthUserId } });
        if (!user) {
            // Alternatively, you might use the session email to find the user if IDs aren't directly linked:
            // const user = await db.user.findUnique({ where: { email: session.user.email } });
            return NextResponse.json({ error: "User not found in database" }, { status: 404 });
        }

        // 4. Fetch Transactions to Delete
        const transactions = await PrismaDb.transaction.findMany({
            where: { id: { in: transactionIds }, userId: user.id },
            select: { id: true, amount: true, type: true, accountId: true },
        });

        if (transactions.length === 0) {
            // Nothing to delete, return success.
            return NextResponse.json({ success: true, message: "No matching transactions found to delete." }, { status: 200 });
        }

        // 5. Calculate Balance Reversal
        const accountBalanceChanges: Record<string, number> = {};
        for (const t of transactions) {
            const raw = Number(t.amount);

            // Calculate the ORIGINAL impact: EXPENSE decreased balance (-raw), INCOME increased balance (+raw).
            const originalImpact = t.type === "EXPENSE" ? -raw : raw;

            // To REVERSE the transaction, we must apply the negative of the original impact.
            // e.g., if original impact was -100 (Expense), reversal must be +100.
            const reversalAmount = -originalImpact;

            accountBalanceChanges[t.accountId] =
                (accountBalanceChanges[t.accountId] ?? 0) + reversalAmount;
        }

        // 6. Execute Atomic Database Transaction (Delete & Update Balance)
        await PrismaDb.$transaction(async (tx) => {
            // A. Delete the transactions
            await tx.transaction.deleteMany({
                where: { id: { in: transactionIds }, userId: user.id },
            });

            // B. Update affected account balances (reversing the transaction's impact)
            for (const [accId, change] of Object.entries(accountBalanceChanges)) {
                await tx.financialAccount.update({
                    where: { id: accId },
                    data: { balance: { increment: change } },
                });
            }
        });

        // 7. Revalidate Cache Tags
        // revalidateTag("transactions");
        // const affectedAccountIds = Object.keys(accountBalanceChanges);
        // for (const accId of affectedAccountIds) {
        //     revalidateTag(`account:${accId}`);
        // }

        // 8. Success Response
        return NextResponse.json(
            {
                success: true,
                deletedCount: transactions.length,
                // affectedAccounts: affectedAccountIds
            },
            { status: 200 }
        );

    } catch (err) {
        console.error("Error in bulkDeleteTransactions API:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown server error occurred.";

        // Use 500 for general server/DB errors
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
