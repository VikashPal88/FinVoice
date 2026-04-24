import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const RETRYABLE_GEMINI_STATUS_CODES = new Set([429, 500, 503, 504]);

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function getGeminiErrorStatus(error: unknown) {
  if (!error || typeof error !== "object") return undefined;

  const maybeStatus = (error as { status?: unknown }).status;
  return typeof maybeStatus === "number" ? maybeStatus : undefined;
}

function isRetryableGeminiError(error: unknown) {
  const status = getGeminiErrorStatus(error);
  return status != null && RETRYABLE_GEMINI_STATUS_CODES.has(status);
}

async function generateContentWithRetry(
  model: ReturnType<typeof getGeminiModel>,
  prompt: string | any[],
  label: string,
  maxAttempts = 3,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      lastError = error;

      if (!isRetryableGeminiError(error) || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = 400 * attempt;
      console.warn(`[${label}] Gemini temporary failure on attempt ${attempt}/${maxAttempts}. Retrying in ${delayMs}ms...`, error);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

export function isGeminiServiceUnavailable(error: unknown) {
  return isRetryableGeminiError(error);
}

/**
 * Get the Gemini model for text generation
 */
export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings,
  });
}

/**
 * Get the Gemini model for vision (image analysis)
 */
export function getGeminiVisionModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings,
  });
}

function cleanGeminiJson(rawText: string) {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/```json\n?/g, "")
    .replace(/```javascript\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/^[^{]*({[\s\S]*})[^}]*$/g, "$1")
    .trim();
}

function parseGeminiJson(rawText: string) {
  const cleaned = cleanGeminiJson(rawText);
  return JSON.parse(cleaned);
}

function normalizeTransaction(tx: any, defaultDate: string) {
  const amountRaw = tx?.amount;
  let amount = 0;

  if (typeof amountRaw === "string") {
    const digits = amountRaw.replace(/[^0-9.\-]/g, "");
    amount = parseFloat(digits || "0");
  } else if (typeof amountRaw === "number") {
    amount = amountRaw;
  }

  if (Number.isNaN(amount)) {
    amount = 0;
  }

  const type = tx?.type?.toString()?.toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE";

  return {
    amount: Math.abs(amount),
    description: tx?.description?.toString() || "Unknown",
    date: tx?.date?.toString() || defaultDate,
    category: tx?.category?.toString() || "Other",
    type,
  };
}

function normalizeStatementTransactions(transactions: any[], defaultDate: string) {
  if (!Array.isArray(transactions)) return [];
  return transactions.map((tx) => normalizeTransaction(tx, defaultDate));
}

function buildStatementSummary(transactions: ReturnType<typeof normalizeStatementTransactions>) {
  return {
    totalTransactions: transactions.length,
    totalIncome: transactions
      .filter((tx) => tx.type === "INCOME")
      .reduce((sum, tx) => sum + tx.amount, 0),
    totalExpense: transactions
      .filter((tx) => tx.type === "EXPENSE")
      .reduce((sum, tx) => sum + tx.amount, 0),
  };
}

/**
 * Parse receipt image using Gemini Vision
 */
export async function parseReceiptImage(base64Image: string, mimeType: string) {
  const model = getGeminiVisionModel();

  const prompt = `You are a financial receipt parser. Analyze this receipt image and extract transaction details.

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "transactions": [
    {
      "amount": <number - total amount paid>,
      "description": "<string - store name or merchant and brief description>",
      "date": "<string - date in YYYY-MM-DD format, use today if not visible>",
      "category": "<string - one of: Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Education, Utilities, Groceries, Travel, Other>",
      "type": "EXPENSE"
    }
  ],
  "confidence": <number 0-100 - how confident you are in the extraction>,
  "rawText": "<string - key text you can read from the receipt>"
}

If the image is not a receipt or you cannot extract data, return:
{"transactions": [], "confidence": 0, "rawText": "Could not parse receipt"}

Important:
- Amount should be numeric (no currency symbols)
- Date should be YYYY-MM-DD format
- Pick the most appropriate category from the list`;

  const result = await generateContentWithRetry(model, [
    prompt,
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
  ], "PARSE_RECEIPT");

  const text = result.response.text().trim();
  console.log("[PARSE_RECEIPT] Raw response:", text.substring(0, 500));
  const parsed = parseGeminiJson(text);

  return {
    transactions: Array.isArray(parsed.transactions)
      ? parsed.transactions.map((tx: any) => normalizeTransaction(tx, new Date().toISOString().split("T")[0]))
      : [],
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
    rawText: parsed.rawText?.toString() || "",
  };
}

/**
 * Parse voice/natural language input into transaction data
 */
export async function parseVoiceInput(transcript: string) {
  const model = getGeminiModel();
  const today = new Date().toISOString().split("T")[0];

  const prompt = `You are a financial transaction parser. Convert this spoken/natural language input into structured transaction data.

Input: "${transcript}"

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
  "amount": <number - the amount mentioned>,
  "description": "<string - what the transaction is for>",
  "date": "<string - date in YYYY-MM-DD format, default to ${today} if not specified>",
  "category": "<string - one of: Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Education, Utilities, Groceries, Salary, Freelance, Investment, Rental, Other>",
  "type": "<string - INCOME or EXPENSE based on context>",
  "confidence": <number 0-100>
}

Examples of parsing:
- "Spent 500 on groceries" → amount: 500, category: "Groceries", type: "EXPENSE"
- "Received salary 50000" → amount: 50000, category: "Salary", type: "INCOME"
- "Paid electricity bill 2000 yesterday" → amount: 2000, category: "Utilities", type: "EXPENSE", date: yesterday's date
- "Got 1500 from freelance work" → amount: 1500, category: "Freelance", type: "INCOME"

If you cannot parse the input, return:
{"amount": 0, "description": "", "date": "${today}", "category": "Other", "type": "EXPENSE", "confidence": 0}`;

  const result = await generateContentWithRetry(model, prompt, "VOICE_INPUT");
  const text = result.response.text().trim();
  console.log("[VOICE_INPUT] Raw response:", text.substring(0, 500));
  const parsed = parseGeminiJson(text);

  return {
    amount: typeof parsed.amount === "number" ? parsed.amount : parseFloat(parsed.amount?.toString().replace(/[^0-9.\-]/g, "") || "0"),
    description: parsed.description?.toString() || "",
    date: parsed.date?.toString() || today,
    category: parsed.category?.toString() || "Other",
    type: parsed.type?.toString().toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
  };
}

/**
 * Parse bank statement (CSV text or image) into multiple transactions
 */
export async function parseStatement(
  content: string,
  isBinaryDocument: boolean = false,
  base64?: string,
  mimeType?: string,
) {
  const model = isBinaryDocument ? getGeminiVisionModel() : getGeminiModel();
  const today = new Date().toISOString().split("T")[0];

  const prompt = `You are a professional bank statement parser. Extract ALL transactions from this ${isBinaryDocument ? "bank statement document" : "bank statement text/CSV"}.

${isBinaryDocument ? "" : `Statement Content:\n${content}`}

Return ONLY a valid JSON object (no markdown code blocks, JUST raw JSON) with this exact structure:
{
  "transactions": [
    {
      "amount": <number - absolute amount, positive values only>,
      "description": "<string - transaction narration/description>",
      "date": "<string - YYYY-MM-DD format>",
      "category": "<string - one of: Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Education, Utilities, Groceries, Salary, Freelance, Investment, Rental, EMI & Loans, Insurance, Other>",
      "type": "<string - INCOME or EXPENSE>"
    }
  ],
  "accountInfo": {
    "bankName": "<string or null>",
    "accountNumber": "<string - last 4 digits or null>",
    "statementPeriod": "<string or null>"
  },
  "summary": {
    "totalTransactions": <number>,
    "totalIncome": <number>,
    "totalExpense": <number>
  }
}

CRITICAL RULES:
1. Extract EVERY transaction from the statement - do NOT skip any
2. Credits/deposits/salary/refunds are INCOME (type: "INCOME")
3. Debits/withdrawals/purchases/fees/payments are EXPENSE (type: "EXPENSE")
4. Use ABSOLUTE amounts (positive numbers only, e.g., 100 not -100)
5. Categorize based on description or merchant name
6. If year is missing, assume ${today.split("-")[0]}
7. Summary totals MUST match the extracted transactions
8. If no transactions found, return empty array and zeros in summary
9. Return VALID JSON only - no explanations, no code blocks, no markdown`;

  try {
    const parts: any[] = [prompt];
    if (isBinaryDocument && base64 && mimeType) {
      parts.push({
        inlineData: { mimeType, data: base64 },
      });
    }

    console.log("[PARSE_STATEMENT] Calling Gemini API...");
    const result = await generateContentWithRetry(model, parts, "PARSE_STATEMENT");
    const text = result.response.text().trim();

    console.log("[PARSE_STATEMENT] Raw response:", text.substring(0, 500));

    // Clean up response
    let cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```javascript\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^[^{]*({[^]*})[^}]*$/g, "$1")
      .trim();

    console.log("[PARSE_STATEMENT] Cleaned response:", cleaned.substring(0, 500));

    const parsed = JSON.parse(cleaned);
    const normalizedTransactions = normalizeStatementTransactions(parsed.transactions, today);

    parsed.transactions = normalizedTransactions;
    parsed.summary = buildStatementSummary(normalizedTransactions);
    parsed.accountInfo = parsed.accountInfo ?? {};

    console.log("[PARSE_STATEMENT] Parsed successfully:", parsed.summary);
    return parsed;
  } catch (error) {
    console.error("[PARSE_STATEMENT] JSON Parse Error:", error);
    throw new Error(`Failed to parse statement response: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate AI-powered financial insights and optimization advice
 */
export async function generateFinancialInsights(financialData: {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
  accountBudgets: { name: string; budget: number; spent: number }[];
  topMerchants: { name: string; amount: number; count: number }[];
}) {
  const model = getGeminiModel();

  const prompt = `You are an expert financial advisor AI for a personal finance dashboard. Analyze this user's financial data and provide actionable insights.

Financial Data:
${JSON.stringify(financialData, null, 2)}

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
  "overallScore": <number 0-100 - financial health score>,
  "scoreLabel": "<string - Poor/Fair/Good/Excellent>",
  "summary": "<string - 2-3 sentence overall financial health summary>",
  "insights": [
    {
      "id": "<unique string id>",
      "type": "<string - saving_tip | spending_alert | income_opportunity | budget_advice | trend_warning>",
      "icon": "<string - emoji>",
      "title": "<string - short title>",
      "description": "<string - detailed explanation with specific numbers>",
      "impact": "<string - low | medium | high>",
      "actionable": "<string - specific action the user can take>"
    }
  ],
  "optimizations": [
    {
      "category": "<string - category name>",
      "currentSpend": <number>,
      "suggestedBudget": <number>,
      "savingPotential": <number>,
      "reason": "<string - why this optimization>"
    }
  ],
  "monthlyAdvice": "<string - specific advice based on monthly trends>"
}

Rules:
- Provide 4-6 specific insights based on actual data
- Reference real numbers and percentages
- Be specific and actionable, not generic
- Amounts are in Indian Rupees (₹)
- Focus on areas where spending seems high relative to income
- Suggest realistic budget allocations
- If savings rate is low, prioritize savings advice`;

  const result = await generateContentWithRetry(model, prompt, "FINANCIAL_INSIGHTS");
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}
