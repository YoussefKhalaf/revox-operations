import { AppShell } from "@/components/app-shell";
import { TeamMemberForm } from "@/components/operation-team/team-member-form";
import { createTeamMemberAction } from "@/app/actions/operation-team";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import { fetchEligibleLoginProfiles } from "@/lib/operation-team/queries";

export default async function NewOperationTeamMemberPage() {
  const page = await getAdminPageContext("/operation-team/new");

  if (page.kind === "screen") {
    return page.element;
  }

  const loginProfiles = await fetchEligibleLoginProfiles();

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Add team member</h2>
          <p className="mt-1 text-sm text-muted">
            Create a new Operation team record. Login accounts are linked separately.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <TeamMemberForm
            action={createTeamMemberAction}
            loginProfiles={loginProfiles}
            isNew
          />
        </section>
      </div>
    </AppShell>
  );
}
