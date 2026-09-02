import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { OperationExpenseList } from "@/components/expenses/operation-expense-list";
import { getOperationPageContext } from "@/lib/auth/operation-page";
import { fetchOwnExpensesForOperation } from "@/lib/expenses/queries";

export default async function MyExpensesPage() {
  const page = await getOperationPageContext("/my-expenses");

  if (page.kind === "screen") {
    return page.element;
  }

  const expenses = await fetchOwnExpensesForOperation(page.operationMemberId);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">My Expenses</h2>
            <p className="mt-1 text-sm text-muted">
              Record and review expenses paid during REVOX operations.
            </p>
          </div>
          <Link
            href="/my-expenses/new"
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Add expense
          </Link>
        </section>

        {expenses.length === 0 ? (
          <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
            <h3 className="text-base font-semibold text-foreground">No expenses recorded yet</h3>
          </section>
        ) : (
          <OperationExpenseList expenses={expenses} />
        )}
      </div>
    </AppShell>
  );
}
