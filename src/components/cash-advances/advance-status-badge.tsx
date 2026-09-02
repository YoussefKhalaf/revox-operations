import { deriveAdvanceStatus, type AdvanceStatus } from "@/lib/finance/balance";

type AdvanceStatusBadgeProps = {
  remainingBalance: string;
};

const STATUS_STYLES: Record<AdvanceStatus, string> = {
  Open: "bg-emerald-50 text-emerald-800",
  Settled: "bg-slate-100 text-slate-700",
  Overspent: "bg-red-50 text-red-700",
};

export function AdvanceStatusBadge({ remainingBalance }: AdvanceStatusBadgeProps) {
  const status = deriveAdvanceStatus(remainingBalance);

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
