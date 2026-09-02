import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { RevenueTable } from "@/components/revenues/revenue-table";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import { fetchExpensesForAdmin } from "@/lib/expenses/queries";
import { fetchRevenuesForAdmin } from "@/lib/revenues/queries";

export default async function IncomeExpensesPage() {
  const page = await getAdminPageContext("/income-expenses");

  if (page.kind === "screen") {
    return page.element;
  }

  const [revenues, expenses] = await Promise.all([
    fetchRevenuesForAdmin(),
    fetchExpensesForAdmin(),
  ]);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Income &amp; Expenses</h2>
            <p className="mt-1 text-sm text-muted">
              Record and review apartment revenue and operating expenses.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/income-expenses/revenues/new"
              className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              Add revenue
            </Link>
            <Link
              href="/income-expenses/expenses/new"
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
            >
              Add expense
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Revenue</h3>
            <p className="mt-1 text-sm text-muted">Apartment income recorded by REVOX.</p>
          </div>

          {revenues.length === 0 ? (
            <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
              <h4 className="text-base font-semibold text-foreground">No revenue recorded yet</h4>
            </section>
          ) : (
            <RevenueTable revenues={revenues} />
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Expenses</h3>
            <p className="mt-1 text-sm text-muted">Operating expenses across REVOX apartments.</p>
          </div>

          {expenses.length === 0 ? (
            <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
              <h4 className="text-base font-semibold text-foreground">No expenses recorded yet</h4>
            </section>
          ) : (
            <ExpenseTable expenses={expenses} />
          )}
        </section>
      </div>
    </AppShell>
  );
}
