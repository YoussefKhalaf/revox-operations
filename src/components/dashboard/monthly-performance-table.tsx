import { presentNetResult } from "@/lib/dashboard/presentation";
import { formatMonthHeading } from "@/lib/dashboard/period";
import type { MonthlyPerformanceRow } from "@/lib/dashboard/types";
import { formatEgpAmount } from "@/lib/finance/amount";

type MonthlyPerformanceTableProps = {
  rows: MonthlyPerformanceRow[];
};

export function MonthlyPerformanceTable({ rows }: MonthlyPerformanceTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Month
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Revenue
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Expenses
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Net Result
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Result
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const net = presentNetResult(row.net_profit);
              return (
                <tr key={row.month_start}>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {formatMonthHeading(row.month_start)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatEgpAmount(row.total_revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatEgpAmount(row.total_expenses)}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${net.valueClassName}`}>
                    {net.amountLabel}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{net.resultLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const net = presentNetResult(row.net_profit);
          return (
            <article
              key={row.month_start}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {formatMonthHeading(row.month_start)}
              </h3>
              <p className={`mt-2 text-sm font-semibold ${net.valueClassName}`}>
                {net.amountLabel} · {net.resultLabel}
              </p>
              <p className="mt-2 text-sm text-muted">
                Revenue: {formatEgpAmount(row.total_revenue)}
              </p>
              <p className="text-sm text-muted">
                Expenses: {formatEgpAmount(row.total_expenses)}
              </p>
            </article>
          );
        })}
      </div>
    </>
  );
}
