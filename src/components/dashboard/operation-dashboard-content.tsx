import Link from "next/link";
import { SummaryCard } from "@/components/summary-card";
import { formatMonthLabel, getCurrentCairoMonthStart, getNextMonthStart } from "@/lib/dashboard/period";
import { fetchOperationDashboardSummary } from "@/lib/dashboard/queries";
import { formatEgpAmount } from "@/lib/finance/amount";

export async function OperationDashboardContent() {
  const monthStart = getCurrentCairoMonthStart();
  const nextMonthStart = getNextMonthStart(monthStart);
  const summary = await fetchOperationDashboardSummary(monthStart, nextMonthStart);

  if (!summary) {
    return (
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          <p className="mt-3 text-sm text-muted">
            Unable to load the dashboard right now. Please try again.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading" className="text-lg font-semibold text-foreground">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-muted">
          Review your recorded expenses and current cash-advance balance.
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          Current month: {formatMonthLabel(monthStart)}
        </p>
      </section>

      <section
        aria-label="Personal summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <SummaryCard
          label="My Expenses — Current Month"
          value={formatEgpAmount(summary.own_expenses_current_month)}
        />
        <SummaryCard
          label="Advances Received — All Time"
          value={formatEgpAmount(summary.total_advances_received)}
        />
        <SummaryCard
          label="Expenses Deducted — All Time"
          value={formatEgpAmount(summary.expenses_deducted_from_advances)}
        />
        <SummaryCard
          label="Remaining Advance Balance — Current"
          value={formatEgpAmount(summary.remaining_advance_balance)}
        />
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/my-expenses"
          className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          View my expenses
        </Link>
        <Link
          href="/my-cash-advances"
          className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
        >
          View my cash advances
        </Link>
      </section>
    </div>
  );
}
