import { ApartmentPerformanceTable } from "@/components/dashboard/apartment-performance-table";
import { DashboardPeriodFilter } from "@/components/dashboard/dashboard-period-filter";
import { MonthlyPerformanceTable } from "@/components/dashboard/monthly-performance-table";
import { SummaryCard } from "@/components/summary-card";
import {
  hasFinancialActivity,
  presentNetResult,
} from "@/lib/dashboard/presentation";
import type { DashboardPeriod } from "@/lib/dashboard/period";
import { getMonthlyPerformanceRange } from "@/lib/dashboard/period";
import {
  fetchAdminApartmentPerformance,
  fetchAdminMonthlyPerformance,
  fetchAdminPeriodSummary,
  fetchOutstandingAdvanceBalance,
} from "@/lib/dashboard/queries";
import { formatEgpAmount } from "@/lib/finance/amount";

type AdminDashboardContentProps = {
  period: DashboardPeriod;
  currentMonthParam: string;
};

export async function AdminDashboardContent({
  period,
  currentMonthParam,
}: AdminDashboardContentProps) {
  const monthlyRange = getMonthlyPerformanceRange();

  const [summary, apartments, monthly, outstanding] = await Promise.all([
    fetchAdminPeriodSummary(period.startDate, period.endDate),
    fetchAdminApartmentPerformance(period.startDate, period.endDate),
    fetchAdminMonthlyPerformance(monthlyRange.startMonth, monthlyRange.endDate),
    fetchOutstandingAdvanceBalance(),
  ]);

  if (!summary || !apartments || !monthly || outstanding === null) {
    return (
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          <p className="mt-3 text-sm text-muted">
            Unable to load the dashboard right now. Please try again.
          </p>
        </section>
      </div>
    );
  }

  const net = presentNetResult(summary.net_profit);
  const showEmptyNotice =
    period.mode === "month" && !hasFinancialActivity(summary);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading" className="text-lg font-semibold text-foreground">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-muted">
          Review REVOX revenue, expenses, profit, and outstanding cash advances.
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          Selected period: {period.label}
        </p>
      </section>

      <DashboardPeriodFilter
        currentMonthParam={currentMonthParam}
        selectedMonthParam={period.mode === "month" ? period.monthParam : undefined}
        isAllTime={period.mode === "all"}
      />

      <section
        aria-label="Financial summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard label="Total Revenue" value={formatEgpAmount(summary.total_revenue)} />
        <SummaryCard label="Total Expenses" value={formatEgpAmount(summary.total_expenses)} />
        <SummaryCard
          label={net.headingLabel}
          value={net.amountLabel}
          valueClassName={net.valueClassName}
        />
        <SummaryCard
          label="Outstanding Advances — Current"
          value={formatEgpAmount(outstanding)}
        />
      </section>

      {showEmptyNotice && (
        <section className="rounded-lg border border-border bg-card p-4 text-sm text-muted shadow-sm">
          No financial activity was recorded for this period.
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Apartment Performance</h3>
          <p className="mt-1 text-sm text-muted">
            Revenue, expenses, and operating result for each apartment in the selected period.
          </p>
        </div>
        <ApartmentPerformanceTable rows={apartments} />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Monthly Performance</h3>
          <p className="mt-1 text-sm text-muted">
            Revenue, expenses, and operating result for the most recent 12 calendar months.
          </p>
        </div>
        <MonthlyPerformanceTable rows={monthly} />
      </section>
    </div>
  );
}
