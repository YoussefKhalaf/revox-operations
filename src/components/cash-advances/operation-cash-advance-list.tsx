import { AdvanceStatusBadge } from "@/components/cash-advances/advance-status-badge";
import { formatEgpAmount } from "@/lib/finance/amount";
import type { OperationCashAdvanceListItem } from "@/lib/cash-advances/types";

type OperationCashAdvanceListProps = {
  advances: OperationCashAdvanceListItem[];
};

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function OperationCashAdvanceList({ advances }: OperationCashAdvanceListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Issued Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Issued Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Expenses Deducted
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Returned
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Remaining
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {advances.map((advance) => (
              <tr key={advance.cash_advance_id}>
                <td className="px-4 py-3 text-sm text-foreground">
                  {formatDisplayDate(advance.issued_date)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {formatEgpAmount(advance.issued_amount)}
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {formatEgpAmount(advance.total_linked_expenses)}
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {formatEgpAmount(advance.total_returned)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {formatEgpAmount(advance.remaining_balance)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <AdvanceStatusBadge remainingBalance={advance.remaining_balance} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {advances.map((advance) => (
          <article
            key={advance.cash_advance_id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatDisplayDate(advance.issued_date)}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {formatEgpAmount(advance.remaining_balance)} remaining
                </p>
              </div>
              <AdvanceStatusBadge remainingBalance={advance.remaining_balance} />
            </div>
            <p className="mt-3 text-sm text-muted">
              Issued: {formatEgpAmount(advance.issued_amount)}
            </p>
            <p className="text-sm text-muted">
              Deducted: {formatEgpAmount(advance.total_linked_expenses)}
            </p>
            <p className="text-sm text-muted">
              Returned: {formatEgpAmount(advance.total_returned)}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
