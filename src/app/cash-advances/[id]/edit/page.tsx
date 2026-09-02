import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CashAdvanceForm } from "@/components/cash-advances/cash-advance-form";
import { updateCashAdvanceAction } from "@/app/actions/cash-advances";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import {
  advanceHasTransactions,
  fetchCashAdvanceById,
} from "@/lib/cash-advances/queries";
import { fetchOperationMemberOptionsForEdit } from "@/lib/expenses/queries";
import { isValidUuid } from "@/lib/finance/validation";

type EditCashAdvancePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCashAdvancePage({ params }: EditCashAdvancePageProps) {
  const { id } = await params;

  if (!isValidUuid(id)) {
    notFound();
  }

  const page = await getAdminPageContext(`/cash-advances/${id}/edit`);

  if (page.kind === "screen") {
    return page.element;
  }

  const advance = await fetchCashAdvanceById(id);

  if (!advance) {
    notFound();
  }

  const [operationMembers, hasTransactions] = await Promise.all([
    fetchOperationMemberOptionsForEdit(advance.operation_member_id),
    advanceHasTransactions(id),
  ]);

  const updateAction = updateCashAdvanceAction.bind(null, id);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Edit cash advance</h2>
          <p className="mt-1 text-sm text-muted">Update advance details or notes.</p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <CashAdvanceForm
            action={updateAction}
            operationMembers={operationMembers}
            memberLocked={hasTransactions}
            initialValues={{
              operation_member_id: advance.operation_member_id,
              amount: advance.amount,
              issued_date: advance.issued_date,
              notes: advance.notes ?? "",
            }}
            cancelHref={`/cash-advances/${id}`}
          />
        </section>
      </div>
    </AppShell>
  );
}
