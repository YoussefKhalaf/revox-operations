import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ApartmentTable } from "@/components/apartments/apartment-table";
import { OperationApartmentList } from "@/components/apartments/operation-apartment-list";
import { SummaryCard } from "@/components/summary-card";
import { getAppPageContext } from "@/lib/auth/app-page";
import {
  fetchActiveApartmentsForOperation,
  fetchApartmentsForAdmin,
} from "@/lib/apartments/queries";
import { buildApartmentSummary } from "@/lib/apartments/types";

export default async function ApartmentsPage() {
  const page = await getAppPageContext("/apartments");

  if (page.kind === "screen") {
    return page.element;
  }

  const { profile, user, navItems } = page;

  if (profile.role === "admin") {
    const apartments = await fetchApartmentsForAdmin();
    const summary = buildApartmentSummary(apartments);

    return (
      <AppShell user={user} navItems={navItems}>
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Apartments</h2>
              <p className="mt-1 text-sm text-muted">
                Manage the apartments operated by REVOX.
              </p>
            </div>
            <Link
              href="/apartments/new"
              className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              Add apartment
            </Link>
          </section>

          <section
            aria-label="Apartment summary"
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <SummaryCard label="Total Apartments" value={String(summary.total)} />
            <SummaryCard label="Active" value={String(summary.active)} />
            <SummaryCard label="Inactive" value={String(summary.inactive)} />
          </section>

          {apartments.length === 0 ? (
            <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
              <h3 className="text-base font-semibold text-foreground">No apartments yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Add the first apartment operated by REVOX.
              </p>
              <Link
                href="/apartments/new"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                Add apartment
              </Link>
            </section>
          ) : (
            <ApartmentTable apartments={apartments} />
          )}
        </div>
      </AppShell>
    );
  }

  const apartments = await fetchActiveApartmentsForOperation();

  return (
    <AppShell user={user} navItems={navItems}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Apartments</h2>
          <p className="mt-1 text-sm text-muted">
            Active apartments currently operated by REVOX.
          </p>
        </section>

        {apartments.length === 0 ? (
          <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
            <h3 className="text-base font-semibold text-foreground">No active apartments</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              There are currently no active apartments available.
            </p>
          </section>
        ) : (
          <OperationApartmentList apartments={apartments} />
        )}
      </div>
    </AppShell>
  );
}
