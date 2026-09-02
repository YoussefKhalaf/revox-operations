import { AppShell } from "@/components/app-shell";
import { ApartmentForm } from "@/components/apartments/apartment-form";
import { createApartmentAction } from "@/app/actions/apartments";
import { getAdminPageContext } from "@/lib/auth/admin-page";

export default async function NewApartmentPage() {
  const page = await getAdminPageContext("/apartments/new");

  if (page.kind === "screen") {
    return page.element;
  }

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Add apartment</h2>
          <p className="mt-1 text-sm text-muted">
            Create a new apartment record for REVOX operations.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <ApartmentForm action={createApartmentAction} isNew />
        </section>
      </div>
    </AppShell>
  );
}
