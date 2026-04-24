import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isGeminiServiceUnavailable, parseVoiceInput } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 503 }
            );
        }

        const { transcript } = await req.json();

        if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
            return NextResponse.json(
                { error: "No transcript provided" },
                { status: 400 }
            );
        }

        const result = await parseVoiceInput(transcript.trim());

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("[VOICE_PARSE]", error);
        if (isGeminiServiceUnavailable(error)) {
            return NextResponse.json(
                { error: "AI service is temporarily busy. Please try again in a moment." },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: "Failed to parse voice input" },
            { status: 500 }
        );
    }
}
