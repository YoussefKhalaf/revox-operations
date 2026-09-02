import Link from "next/link";
import { formatEgpAmount } from "@/lib/finance/amount";
import { formatApartmentLabel } from "@/lib/finance/types";
import type { RevenueListItem } from "@/lib/revenues/types";

type RevenueTableProps = {
  revenues: RevenueListItem[];
};

function formatOptional(value: string | null) {
  return value && value.trim().length > 0 ? value : "—";
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function RevenueTable({ revenues }: RevenueTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Apartment
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Source
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Description
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {revenues.map((revenue) => (
              <tr key={revenue.id}>
                <td className="px-4 py-3 text-sm text-foreground">{formatDisplayDate(revenue.revenue_date)}</td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {formatApartmentLabel(revenue.apartment)}
                </td>
                <td className="px-4 py-3 text-sm text-muted">{formatOptional(revenue.source)}</td>
                <td className="px-4 py-3 text-sm text-muted">{formatOptional(revenue.description)}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {formatEgpAmount(revenue.amount)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/income-expenses/revenues/${revenue.id}/edit`}
                    className="font-medium text-accent hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {revenues.map((revenue) => (
          <article
            key={revenue.id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatDisplayDate(revenue.revenue_date)}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {formatApartmentLabel(revenue.apartment)}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {formatEgpAmount(revenue.amount)}
                </p>
              </div>
              <Link
                href={`/income-expenses/revenues/${revenue.id}/edit`}
                className="text-sm font-medium text-accent hover:underline"
              >
                Edit
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted">
              <span className="text-foreground">Source: </span>
              {formatOptional(revenue.source)}
            </p>
            <p className="mt-1 text-sm text-muted">
              <span className="text-foreground">Description: </span>
              {formatOptional(revenue.description)}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
