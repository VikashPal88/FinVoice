export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function normalizeMoneyValue(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return roundMoney(numericValue);
}

export function normalizeTransactionAmount(value: unknown) {
  return roundMoney(Math.abs(normalizeMoneyValue(value)));
}

export function getTransactionImpact(type: unknown, amount: unknown) {
  const normalizedAmount = normalizeTransactionAmount(amount);
  return String(type).toUpperCase() === "EXPENSE"
    ? roundMoney(-normalizedAmount)
    : normalizedAmount;
}
