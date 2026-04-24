import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", // Brevo SMTP server
  port: 587,                   // Recommended port
  secure: false,               // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

interface BudgetAlertData {
  userName: string;
  userEmail: string;
  accountName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  topCategories: { category: string; amount: number; percentage: number }[];
  recentTransactions: { description: string; amount: number; date: string; category: string }[];
}

/**
 * Send a budget alert email when spending exceeds 90% of the budget
 */
export async function sendBudgetAlertEmail(data: BudgetAlertData) {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASSWORD) {
    console.warn("[EMAIL] Email credentials not configured, skipping budget alert email");
    return { success: false, reason: "Email not configured" };
  }

  const remaining = data.budgetAmount - data.spentAmount;
  const isExceeded = data.percentage >= 100;

  const categoryRows = data.topCategories
    .slice(0, 5)
    .map(
      (c) => `
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #374151;">${c.category}</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #374151; text-align: right; font-weight: 600;">₹${c.amount.toLocaleString("en-IN")}</td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #6b7280; text-align: right;">${c.percentage.toFixed(1)}%</td>
      </tr>
    `
    )
    .join("");

  const recentTxRows = data.recentTransactions
    .slice(0, 5)
    .map(
      (tx) => `
      <tr>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #374151;">${tx.description}</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #ef4444; text-align: right; font-weight: 600;">-₹${tx.amount.toLocaleString("en-IN")}</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #6b7280; text-align: right;">${tx.category}</td>
      </tr>
    `
    )
    .join("");

  const progressColor = isExceeded ? "#ef4444" : data.percentage >= 95 ? "#f59e0b" : "#f97316";
  const progressWidth = Math.min(data.percentage, 100);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${isExceeded ? "#dc2626" : "#f97316"}, ${isExceeded ? "#991b1b" : "#ea580c"}); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 12px;">${isExceeded ? "🚨" : "⚠️"}</div>
      <h1 style="color: white; font-size: 22px; font-weight: 700; margin: 0 0 8px;">
        ${isExceeded ? "Budget Exceeded!" : "Budget Alert — 90% Reached"}
      </h1>
      <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">
        ${data.accountName} Account • ${new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
      </p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
      
      <!-- Greeting -->
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">
        Hi <strong>${data.userName}</strong>,<br><br>
        ${isExceeded
      ? `You've exceeded your monthly budget of <strong>₹${data.budgetAmount.toLocaleString("en-IN")}</strong> on your <strong>${data.accountName}</strong> account.`
      : `You've used <strong>${data.percentage.toFixed(1)}%</strong> of your monthly budget on your <strong>${data.accountName}</strong> account. Only <strong>₹${remaining.toLocaleString("en-IN")}</strong> remaining.`
    }
      </p>

      <!-- Budget Progress Card -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Monthly Budget Usage</span>
          <span style="font-size: 20px; font-weight: 800; color: ${progressColor};">${data.percentage.toFixed(1)}%</span>
        </div>
        <!-- Progress Bar -->
        <div style="background: #e5e7eb; border-radius: 8px; height: 12px; overflow: hidden; margin-bottom: 12px;">
          <div style="background: ${progressColor}; height: 100%; width: ${progressWidth}%; border-radius: 8px; transition: width 0.3s;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
          <span style="color: #6b7280;">Spent: <strong style="color: #374151;">₹${data.spentAmount.toLocaleString("en-IN")}</strong></span>
          <span style="color: #6b7280;">Budget: <strong style="color: #374151;">₹${data.budgetAmount.toLocaleString("en-IN")}</strong></span>
        </div>
      </div>

      <!-- Top Spending Categories -->
      <h3 style="font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        📊 Top Spending Categories
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Category</th>
            <th style="padding: 10px 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
            <th style="padding: 10px 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Share</th>
          </tr>
        </thead>
        <tbody>
          ${categoryRows}
        </tbody>
      </table>

      <!-- Recent Transactions -->
      <h3 style="font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        💸 Recent Expenses
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 8px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Description</th>
            <th style="padding: 8px 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Amount</th>
            <th style="padding: 8px 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Category</th>
          </tr>
        </thead>
        <tbody>
          ${recentTxRows}
        </tbody>
      </table>

      <!-- AI Tips Section -->
      <div style="background: linear-gradient(135deg, #eff6ff, #f0fdf4); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #bfdbfe;">
        <h3 style="font-size: 14px; font-weight: 700; color: #1e40af; margin: 0 0 12px;">
          💡 Smart Tips to Stay on Budget
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 13px; line-height: 1.8;">
          <li>Review your top spending category and find areas to cut back</li>
          <li>Set up category-level sub-budgets for better tracking</li>
          <li>Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
          <li>Consider meal prepping to reduce food spending</li>
          ${remaining > 0 ? `<li>You have <strong>₹${remaining.toLocaleString("en-IN")}</strong> left — make it last!</li>` : `<li>Try to avoid non-essential purchases for the rest of the month</li>`}
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.AUTH_URL || "http://localhost:3000"}/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(249,115,22,0.3);">
          📊 View Dashboard
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0 0 4px;">Finance Dashboard — Smart Budget Alerts</p>
      <p style="margin: 0;">This alert was sent because your spending crossed ${isExceeded ? "100%" : "90%"} of your budget.</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Finance Dashboard" <${process.env.EMAIL_FROM}>`,
      to: data.userEmail,
      subject: `${isExceeded ? "🚨 Budget Exceeded" : "⚠️ Budget Alert"} — ${data.accountName} Account (${data.percentage.toFixed(0)}%)`,
      html,
    });

    console.log(`[EMAIL] Budget alert sent to ${data.userEmail} for ${data.accountName} (${data.percentage.toFixed(1)}%)`);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL] Failed to send budget alert:", error);
    return { success: false, error };
  }
}
