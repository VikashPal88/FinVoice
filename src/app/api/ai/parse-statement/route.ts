import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseStatement } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.error("[PARSE_STATEMENT] Unauthorized - no session");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("[PARSE_STATEMENT] Gemini API key not configured");
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 503 }
            );
        }

        const contentType = req.headers.get("content-type") || "";
        console.log("[PARSE_STATEMENT] Content-Type:", contentType);

        let result;

        if (contentType.includes("multipart/form-data")) {
            // Handle file upload (image, PDF, CSV, or text)
            const formData = await req.formData();
            const file = formData.get("statement") as File;

            if (!file) {
                console.error("[PARSE_STATEMENT] No file provided");
                return NextResponse.json(
                    { error: "No file provided" },
                    { status: 400 }
                );
            }

            console.log("[PARSE_STATEMENT] File received:", {
                name: file.name,
                size: file.size,
                type: file.type,
            });

            if (file.size > 15 * 1024 * 1024) {
                return NextResponse.json(
                    { error: "File too large. Maximum 15MB" },
                    { status: 400 }
                );
            }

            const isImage = file.type.startsWith("image/");
            const isPdf = file.type === "application/pdf";
            const buffer = Buffer.from(await file.arrayBuffer());

            if (isImage) {
                const base64 = buffer.toString("base64");
                console.log("[PARSE_STATEMENT] Parsing image statement, size:", base64.length);
                result = await parseStatement("", true, base64, file.type);
            } else if (isPdf) {
                const base64 = buffer.toString("base64");
                console.log("[PARSE_STATEMENT] Parsing PDF statement, size:", base64.length);
                result = await parseStatement("", true, base64, file.type);
            } else {
                // CSV or text file
                const text = buffer.toString("utf-8");
                console.log("[PARSE_STATEMENT] Parsing text statement, content length:", text.length);
                result = await parseStatement(text, false);
            }
        } else {
            // Handle raw text/CSV content
            const { content } = await req.json();
            if (!content) {
                console.error("[PARSE_STATEMENT] No content provided");
                return NextResponse.json(
                    { error: "No content provided" },
                    { status: 400 }
                );
            }
            console.log("[PARSE_STATEMENT] Parsing text content, length:", content.length);
            result = await parseStatement(content, false);
        }

        console.log("[PARSE_STATEMENT] Result:", JSON.stringify(result, null, 2));

        if (!result || !result.transactions) {
            console.warn("[PARSE_STATEMENT] Warning: Result missing transactions array", result);
            return NextResponse.json({
                success: true,
                data: result || { transactions: [], summary: { totalTransactions: 0, totalIncome: 0, totalExpense: 0 }, accountInfo: {} },
            });
        }

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("[PARSE_STATEMENT] Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to parse statement";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
