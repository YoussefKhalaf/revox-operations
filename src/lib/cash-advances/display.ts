import { formatEgpAmount } from "@/lib/finance/amount";
import type { CashAdvanceOption } from "@/lib/cash-advances/types";

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function formatCashAdvanceLabel(advance: CashAdvanceOption): string {
  return `${formatDisplayDate(advance.issued_date)} — ${formatEgpAmount(advance.remaining_balance)} remaining`;
}
