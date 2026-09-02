import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RevenueForm } from "@/components/revenues/revenue-form";
import { updateRevenueAction } from "@/app/actions/revenues";
import { fetchApartmentOptionsForEdit } from "@/lib/apartments/queries";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import { isValidUuid } from "@/lib/finance/validation";
import { fetchRevenueById } from "@/lib/revenues/queries";

type EditRevenuePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRevenuePage({ params }: EditRevenuePageProps) {
  const { id } = await params;

  if (!isValidUuid(id)) {
    notFound();
  }

  const page = await getAdminPageContext(`/income-expenses/revenues/${id}/edit`);

  if (page.kind === "screen") {
    return page.element;
  }

  const revenue = await fetchRevenueById(id);

  if (!revenue) {
    notFound();
  }

  const apartments = await fetchApartmentOptionsForEdit(revenue.apartment_id);
  const updateAction = updateRevenueAction.bind(null, id);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Edit revenue</h2>
          <p className="mt-1 text-sm text-muted">Update apartment revenue details.</p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <RevenueForm
            action={updateAction}
            apartments={apartments}
            initialValues={{
              apartment_id: revenue.apartment_id,
              amount: revenue.amount,
              revenue_date: revenue.revenue_date,
              source: revenue.source ?? "",
              description: revenue.description ?? "",
            }}
          />
        </section>
      </div>
    </AppShell>
  );
}
