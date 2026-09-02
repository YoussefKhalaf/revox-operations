import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ApartmentForm } from "@/components/apartments/apartment-form";
import { updateApartmentAction } from "@/app/actions/apartments";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import { fetchApartmentById } from "@/lib/apartments/queries";
import { isValidApartmentId } from "@/lib/apartments/validation";

type EditApartmentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditApartmentPage({ params }: EditApartmentPageProps) {
  const { id } = await params;

  if (!isValidApartmentId(id)) {
    notFound();
  }

  const page = await getAdminPageContext(`/apartments/${id}/edit`);

  if (page.kind === "screen") {
    return page.element;
  }

  const apartment = await fetchApartmentById(id);

  if (!apartment) {
    notFound();
  }

  const updateAction = updateApartmentAction.bind(null, id);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Edit apartment</h2>
          <p className="mt-1 text-sm text-muted">
            Update apartment details, notes, or status.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <ApartmentForm
            action={updateAction}
            initialValues={{
              name: apartment.name,
              unit_code: apartment.unit_code ?? "",
              address: apartment.address ?? "",
              notes: apartment.notes ?? "",
              status: apartment.status,
            }}
          />
        </section>
      </div>
    </AppShell>
  );
}
