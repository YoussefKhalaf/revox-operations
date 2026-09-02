import { AppShell } from "@/components/app-shell";
import { CashAdvanceForm } from "@/components/cash-advances/cash-advance-form";
import { createCashAdvanceAction } from "@/app/actions/cash-advances";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import { fetchActiveOperationMemberOptions } from "@/lib/expenses/queries";

export default async function NewCashAdvancePage() {
  const page = await getAdminPageContext("/cash-advances/new");

  if (page.kind === "screen") {
    return page.element;
  }

  const operationMembers = await fetchActiveOperationMemberOptions();

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Issue cash advance</h2>
          <p className="mt-1 text-sm text-muted">
            Record money issued to an Operation team member.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <CashAdvanceForm
            action={createCashAdvanceAction}
            operationMembers={operationMembers}
            isNew
          />
        </section>
      </div>
    </AppShell>
  );
}
