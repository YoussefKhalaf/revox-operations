import { AppShell } from "@/components/app-shell";
import { OperationCashAdvanceList } from "@/components/cash-advances/operation-cash-advance-list";
import { SummaryCard } from "@/components/summary-card";
import { getOperationPageContext } from "@/lib/auth/operation-page";
import {
  fetchOperationCashAdvanceSummary,
  fetchOwnCashAdvancesForOperation,
} from "@/lib/cash-advances/queries";
import { formatEgpAmount } from "@/lib/finance/amount";

export default async function MyCashAdvancesPage() {
  const page = await getOperationPageContext("/my-cash-advances");

  if (page.kind === "screen") {
    return page.element;
  }

  const [advances, summary] = await Promise.all([
    fetchOwnCashAdvancesForOperation(page.operationMemberId),
    fetchOperationCashAdvanceSummary(page.operationMemberId),
  ]);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">My Cash Advances</h2>
          <p className="mt-1 text-sm text-muted">
            Review money received, expenses deducted, and your remaining balance.
          </p>
        </section>

        <section
          aria-label="Personal cash advance summary"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          <SummaryCard label="Total Issued" value={formatEgpAmount(summary.totalIssued)} />
          <SummaryCard label="Expenses Deducted" value={formatEgpAmount(summary.totalSpent)} />
          <SummaryCard label="Returned" value={formatEgpAmount(summary.totalReturned)} />
          <SummaryCard
            label="Remaining Balance"
            value={formatEgpAmount(summary.remainingBalance)}
          />
        </section>

        {advances.length === 0 ? (
          <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
            <h3 className="text-base font-semibold text-foreground">No cash advances yet</h3>
          </section>
        ) : (
          <OperationCashAdvanceList advances={advances} />
        )}
      </div>
    </AppShell>
  );
}
