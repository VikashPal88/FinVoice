import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTransactionImpact, normalizeTransactionAmount, roundMoney } from "@/lib/money";
import { PrismaDb } from "@/lib/prismaDB";

const serializeDecimal = (obj: any) => {
    const serialized: any = { ...obj };
    if (obj?.balance != null) serialized.balance = Number(obj.balance);
    if (obj?.amount != null) serialized.amount = Number(obj.amount);
    return serialized;
};

/**
 * GET /api/transactions/[transactionId]
 * Get a single transaction by ID
 */
export async function GET(
    req: Request,
    context: { params: Promise<{ transactionId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { transactionId } = await context.params;

        const transaction = await PrismaDb.transaction.findUnique({
            where: {
                id: transactionId,
                userId: session.user.id,
            },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        return NextResponse.json(serializeDecimal(transaction));
    } catch (error) {
        console.error("[TRANSACTION_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

/**
 * PUT /api/transactions/[transactionId]
 * Update a single transaction
 */
export async function PUT(
    req: Request,
    context: { params: Promise<{ transactionId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { transactionId } = await context.params;
        const body = await req.json();

        // Find existing transaction
        const existing = await PrismaDb.transaction.findUnique({
            where: {
                id: transactionId,
                userId: session.user.id,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        const normalizedData = {
            ...body,
            amount: body.amount != null ? normalizeTransactionAmount(body.amount) : Number(existing.amount),
            type: body.type ? (String(body.type).toUpperCase() === "EXPENSE" ? "EXPENSE" : "INCOME") : existing.type,
            accountId: body.accountId || existing.accountId,
        };
        const oldImpact = getTransactionImpact(existing.type, existing.amount);
        const newImpact = getTransactionImpact(normalizedData.type, normalizedData.amount);
        const previousAccountId = existing.accountId;
        const nextAccountId = normalizedData.accountId;

        if (nextAccountId !== previousAccountId) {
            const targetAccount = await PrismaDb.financialAccount.findUnique({
                where: {
                    id: nextAccountId,
                    userId: session.user.id,
                },
                select: { id: true },
            });

            if (!targetAccount) {
                return NextResponse.json({ error: "Target account not found" }, { status: 404 });
            }
        }

        const updatedTransaction = await PrismaDb.$transaction(async (tx) => {
            const updated = await tx.transaction.update({
                where: { id: transactionId },
                data: normalizedData,
            });

            if (previousAccountId === nextAccountId) {
                const balanceChange = roundMoney(newImpact - oldImpact);
                if (balanceChange !== 0) {
                    await tx.financialAccount.update({
                        where: { id: nextAccountId },
                        data: { balance: { increment: balanceChange } },
                    });
                }
            } else {
                await tx.financialAccount.update({
                    where: { id: previousAccountId },
                    data: { balance: { increment: roundMoney(-oldImpact) } },
                });

                await tx.financialAccount.update({
                    where: { id: nextAccountId },
                    data: { balance: { increment: newImpact } },
                });
            }

            return updated;
        });

        return NextResponse.json(serializeDecimal(updatedTransaction));
    } catch (error) {
        console.error("[TRANSACTION_PUT]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

/**
 * DELETE /api/transactions/[transactionId]
 * Delete a single transaction and reverse its balance impact
 */
export async function DELETE(
    req: Request,
    context: { params: Promise<{ transactionId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { transactionId } = await context.params;

        const transaction = await PrismaDb.transaction.findUnique({
            where: {
                id: transactionId,
                userId: session.user.id,
            },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Reverse the balance impact
        const reversalAmount = roundMoney(-getTransactionImpact(transaction.type, transaction.amount));

        await PrismaDb.$transaction(async (tx) => {
            await tx.transaction.delete({
                where: { id: transactionId },
            });

            await tx.financialAccount.update({
                where: { id: transaction.accountId },
                data: { balance: { increment: reversalAmount } },
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[TRANSACTION_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
