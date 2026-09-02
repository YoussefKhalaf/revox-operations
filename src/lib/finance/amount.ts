const MAX_AMOUNT = 9999999999.99;
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function validateAmount(value: string): { ok: true; amount: string } | { ok: false; error: string } {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { ok: false, error: "Amount is required." };
  }

  if (!AMOUNT_PATTERN.test(trimmed)) {
    return { ok: false, error: "Enter a valid amount with up to two decimal places." };
  }

  const [wholePart] = trimmed.split(".");
  if (wholePart.length > 10) {
    return { ok: false, error: "Amount exceeds the maximum allowed." };
  }

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }

  if (numeric > MAX_AMOUNT) {
    return { ok: false, error: "Amount exceeds the maximum allowed." };
  }

  return { ok: true, amount: numeric.toFixed(2) };
}

export function formatEgpAmount(amount: string | number): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;

  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}
