import { AppShell } from "@/components/app-shell";
import { RevenueForm } from "@/components/revenues/revenue-form";
import { createRevenueAction } from "@/app/actions/revenues";
import { fetchActiveApartmentOptions } from "@/lib/apartments/queries";
import { getAdminPageContext } from "@/lib/auth/admin-page";

export default async function NewRevenuePage() {
  const page = await getAdminPageContext("/income-expenses/revenues/new");

  if (page.kind === "screen") {
    return page.element;
  }

  const apartments = await fetchActiveApartmentOptions();

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Add revenue</h2>
          <p className="mt-1 text-sm text-muted">Record apartment income for REVOX operations.</p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <RevenueForm action={createRevenueAction} apartments={apartments} isNew />
        </section>
      </div>
    </AppShell>
  );
}
