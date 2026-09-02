import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AdvanceReturnForm } from "@/components/cash-advances/advance-return-form";
import { createAdvanceReturnAction } from "@/app/actions/advance-returns";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import { fetchCashAdvanceBalanceById } from "@/lib/cash-advances/queries";
import { isPositiveBalance } from "@/lib/finance/balance";
import { isValidUuid } from "@/lib/finance/validation";

type NewAdvanceReturnPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewAdvanceReturnPage({ params }: NewAdvanceReturnPageProps) {
  const { id } = await params;

  if (!isValidUuid(id)) {
    notFound();
  }

  const page = await getAdminPageContext(`/cash-advances/${id}/returns/new`);

  if (page.kind === "screen") {
    return page.element;
  }

  const balance = await fetchCashAdvanceBalanceById(id);

  if (!balance || !isPositiveBalance(balance.remaining_balance)) {
    notFound();
  }

  const createAction = createAdvanceReturnAction.bind(null, id);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Record returned amount</h2>
          <p className="mt-1 text-sm text-muted">
            Record unused money returned for {balance.operation_member_name}.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <AdvanceReturnForm
            action={createAction}
            isNew
            cancelHref={`/cash-advances/${id}`}
          />
        </section>
      </div>
    </AppShell>
  );
}
