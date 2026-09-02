import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AdvanceReturnForm } from "@/components/cash-advances/advance-return-form";
import { updateAdvanceReturnAction } from "@/app/actions/advance-returns";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import { fetchAdvanceReturnById } from "@/lib/cash-advances/queries";
import { isValidUuid } from "@/lib/finance/validation";

type EditAdvanceReturnPageProps = {
  params: Promise<{ id: string; returnId: string }>;
};

export default async function EditAdvanceReturnPage({ params }: EditAdvanceReturnPageProps) {
  const { id, returnId } = await params;

  if (!isValidUuid(id) || !isValidUuid(returnId)) {
    notFound();
  }

  const page = await getAdminPageContext(`/cash-advances/${id}/returns/${returnId}/edit`);

  if (page.kind === "screen") {
    return page.element;
  }

  const advanceReturn = await fetchAdvanceReturnById(id, returnId);

  if (!advanceReturn) {
    notFound();
  }

  const updateAction = updateAdvanceReturnAction.bind(null, id, returnId);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Edit returned amount</h2>
          <p className="mt-1 text-sm text-muted">Correct the returned amount details.</p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <AdvanceReturnForm
            action={updateAction}
            initialValues={{
              amount: advanceReturn.amount,
              return_date: advanceReturn.return_date,
              notes: advanceReturn.notes ?? "",
            }}
            cancelHref={`/cash-advances/${id}`}
          />
        </section>
      </div>
    </AppShell>
  );
}
