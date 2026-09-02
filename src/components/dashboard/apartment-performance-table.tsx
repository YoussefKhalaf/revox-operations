import { presentNetResult } from "@/lib/dashboard/presentation";
import type { ApartmentPerformanceRow } from "@/lib/dashboard/types";
import { formatEgpAmount } from "@/lib/finance/amount";

type ApartmentPerformanceTableProps = {
  rows: ApartmentPerformanceRow[];
};

function formatOptional(value: string | null) {
  return value && value.trim().length > 0 ? value : "—";
}

export function ApartmentPerformanceTable({ rows }: ApartmentPerformanceTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Apartment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Unit Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Status
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
                <tr key={row.apartment_id}>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{row.apartment_name}</td>
                  <td className="px-4 py-3 text-sm text-muted">{formatOptional(row.unit_code)}</td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {row.apartment_status === "active" ? "Active" : "Inactive"}
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
              key={row.apartment_id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{row.apartment_name}</h3>
                  <p className="mt-1 text-sm text-muted">{formatOptional(row.unit_code)}</p>
                </div>
                <span className="text-xs font-medium text-muted">
                  {row.apartment_status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <p className={`mt-3 text-sm font-semibold ${net.valueClassName}`}>
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
