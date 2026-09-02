import { AppShell } from "@/components/app-shell";
import { OperationExpenseForm } from "@/components/expenses/operation-expense-form";
import { createOperationExpenseAction } from "@/app/actions/expenses";
import { fetchActiveApartmentOptions } from "@/lib/apartments/queries";
import { fetchCashAdvanceOptionsForMember } from "@/lib/cash-advances/queries";
import { getOperationPageContext } from "@/lib/auth/operation-page";

export default async function NewMyExpensePage() {
  const page = await getOperationPageContext("/my-expenses/new");

  if (page.kind === "screen") {
    return page.element;
  }

  const [apartments, cashAdvances] = await Promise.all([
    fetchActiveApartmentOptions(),
    fetchCashAdvanceOptionsForMember(page.operationMemberId),
  ]);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Add expense</h2>
          <p className="mt-1 text-sm text-muted">
            Record an expense you paid during REVOX operations.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <OperationExpenseForm
            action={createOperationExpenseAction}
            apartments={apartments}
            cashAdvances={cashAdvances}
          />
        </section>
      </div>
    </AppShell>
  );
}
