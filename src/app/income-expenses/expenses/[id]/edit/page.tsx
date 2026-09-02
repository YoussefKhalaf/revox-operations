import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { updateExpenseAction } from "@/app/actions/expenses";
import { fetchApartmentOptionsForEdit } from "@/lib/apartments/queries";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import { fetchCashAdvanceOptionsForMember } from "@/lib/cash-advances/queries";
import { fetchExpenseById, fetchOperationMemberOptionsForEdit } from "@/lib/expenses/queries";
import { isValidUuid } from "@/lib/finance/validation";

type EditExpensePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params;

  if (!isValidUuid(id)) {
    notFound();
  }

  const page = await getAdminPageContext(`/income-expenses/expenses/${id}/edit`);

  if (page.kind === "screen") {
    return page.element;
  }

  const expense = await fetchExpenseById(id);

  if (!expense) {
    notFound();
  }

  const [apartments, operationMembers, memberAdvances] = await Promise.all([
    fetchApartmentOptionsForEdit(expense.apartment_id),
    fetchOperationMemberOptionsForEdit(expense.paid_by_member_id),
    expense.paid_by_member_id
      ? fetchCashAdvanceOptionsForMember(expense.paid_by_member_id, expense.cash_advance_id)
      : Promise.resolve([]),
  ]);

  const advancesByMember = expense.paid_by_member_id
    ? { [expense.paid_by_member_id]: memberAdvances }
    : {};

  const updateAction = updateExpenseAction.bind(null, id);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Edit expense</h2>
          <p className="mt-1 text-sm text-muted">Update operating expense details.</p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <ExpenseForm
            action={updateAction}
            apartments={apartments}
            operationMembers={operationMembers}
            advancesByMember={advancesByMember}
            initialValues={{
              apartment_id: expense.apartment_id,
              paid_by: expense.paid_by_member_id ?? "revex-direct",
              cash_advance_id: expense.cash_advance_id ?? "",
              category: expense.category,
              description: expense.description,
              amount: expense.amount,
              expense_date: expense.expense_date,
            }}
          />
        </section>
      </div>
    </AppShell>
  );
}
