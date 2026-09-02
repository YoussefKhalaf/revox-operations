import { AppShell } from "@/components/app-shell";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { createExpenseAction } from "@/app/actions/expenses";
import { fetchActiveApartmentOptions } from "@/lib/apartments/queries";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import { fetchAllCashAdvanceOptionsForAdmin } from "@/lib/cash-advances/queries";
import { fetchActiveOperationMemberOptions } from "@/lib/expenses/queries";

export default async function NewExpensePage() {
  const page = await getAdminPageContext("/income-expenses/expenses/new");

  if (page.kind === "screen") {
    return page.element;
  }

  const [apartments, operationMembers, advancesByMember] = await Promise.all([
    fetchActiveApartmentOptions(),
    fetchActiveOperationMemberOptions(),
    fetchAllCashAdvanceOptionsForAdmin(),
  ]);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Add expense</h2>
          <p className="mt-1 text-sm text-muted">Record an operating expense for REVOX.</p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <ExpenseForm
            action={createExpenseAction}
            apartments={apartments}
            operationMembers={operationMembers}
            advancesByMember={advancesByMember}
            isNew
          />
        </section>
      </div>
    </AppShell>
  );
}
