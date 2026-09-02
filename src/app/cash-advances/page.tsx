import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CashAdvanceTable } from "@/components/cash-advances/cash-advance-table";
import { SummaryCard } from "@/components/summary-card";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import {
  buildCashAdvanceSummary,
  fetchCashAdvancesForAdmin,
} from "@/lib/cash-advances/queries";
import { formatEgpAmount } from "@/lib/finance/amount";

export default async function CashAdvancesPage() {
  const page = await getAdminPageContext("/cash-advances");

  if (page.kind === "screen") {
    return page.element;
  }

  const advances = await fetchCashAdvancesForAdmin();
  const summary = buildCashAdvanceSummary(advances);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Cash Advances</h2>
            <p className="mt-1 text-sm text-muted">
              Track money issued to the REVOX Operation team.
            </p>
          </div>
          <Link
            href="/cash-advances/new"
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Issue cash advance
          </Link>
        </section>

        <section
          aria-label="Cash advance summary"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          <SummaryCard label="Total Issued" value={formatEgpAmount(summary.totalIssued)} />
          <SummaryCard label="Spent From Advances" value={formatEgpAmount(summary.totalSpent)} />
          <SummaryCard label="Returned" value={formatEgpAmount(summary.totalReturned)} />
          <SummaryCard
            label="Outstanding Balance"
            value={formatEgpAmount(summary.outstandingBalance)}
          />
        </section>

        {advances.length === 0 ? (
          <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
            <h3 className="text-base font-semibold text-foreground">No cash advances yet</h3>
          </section>
        ) : (
          <CashAdvanceTable advances={advances} />
        )}
      </div>
    </AppShell>
  );
}
