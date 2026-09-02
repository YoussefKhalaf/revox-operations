import { toCents, fromCents } from "@/lib/finance/balance";
import { formatEgpAmount } from "@/lib/finance/amount";

export type NetResultPresentation = {
  amountLabel: string;
  resultLabel: "Profit" | "Loss" | "Break-even";
  headingLabel: "Net Profit" | "Net Loss" | "Break-even";
  tone: "profit" | "loss" | "even";
  valueClassName: string;
};

export function presentNetResult(amount: string): NetResultPresentation {
  const cents = toCents(amount);

  if (cents > 0) {
    return {
      amountLabel: formatEgpAmount(amount),
      resultLabel: "Profit",
      headingLabel: "Net Profit",
      tone: "profit",
      valueClassName: "text-foreground",
    };
  }

  if (cents < 0) {
    const absolute = formatEgpAmount(fromCents(Math.abs(cents)));
    return {
      amountLabel: absolute,
      resultLabel: "Loss",
      headingLabel: "Net Loss",
      tone: "loss",
      valueClassName: "text-red-700",
    };
  }

  return {
    amountLabel: formatEgpAmount("0"),
    resultLabel: "Break-even",
    headingLabel: "Break-even",
    tone: "even",
    valueClassName: "text-foreground",
  };
}

export function hasFinancialActivity(summary: {
  total_revenue: string;
  total_expenses: string;
}): boolean {
  return toCents(summary.total_revenue) !== 0 || toCents(summary.total_expenses) !== 0;
}
