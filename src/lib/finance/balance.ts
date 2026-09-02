export type AdvanceStatus = "Open" | "Settled" | "Overspent";

export function toCents(amount: string): number {
  const trimmed = amount.trim();
  const negative = trimmed.startsWith("-");
  const normalized = negative ? trimmed.slice(1) : trimmed;
  const [wholePart, fractionPart = ""] = normalized.split(".");
  const whole = Number(wholePart);
  const fraction = Number((fractionPart + "00").slice(0, 2));

  if (!Number.isFinite(whole) || !Number.isFinite(fraction)) {
    return 0;
  }

  const cents = whole * 100 + fraction;
  return negative ? -cents : cents;
}

export function fromCents(cents: number): string {
  const negative = cents < 0;
  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

export function sumAmounts(amounts: string[]): string {
  const total = amounts.reduce((sum, amount) => sum + toCents(amount), 0);
  return fromCents(total);
}

export function subtractAmounts(left: string, right: string): string {
  return fromCents(toCents(left) - toCents(right));
}

export function deriveAdvanceStatus(remainingBalance: string): AdvanceStatus {
  const cents = toCents(remainingBalance);

  if (cents > 0) {
    return "Open";
  }

  if (cents === 0) {
    return "Settled";
  }

  return "Overspent";
}

export function isPositiveBalance(amount: string): boolean {
  return toCents(amount) > 0;
}
