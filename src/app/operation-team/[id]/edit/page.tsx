import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TeamMemberForm } from "@/components/operation-team/team-member-form";
import { updateTeamMemberAction } from "@/app/actions/operation-team";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import {
  fetchEligibleLoginProfiles,
  fetchOperationMemberById,
} from "@/lib/operation-team/queries";

type EditOperationTeamMemberPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditOperationTeamMemberPage({
  params,
}: EditOperationTeamMemberPageProps) {
  const { id } = await params;
  const page = await getAdminPageContext(`/operation-team/${id}/edit`);

  if (page.kind === "screen") {
    return page.element;
  }

  const member = await fetchOperationMemberById(id);

  if (!member) {
    notFound();
  }

  const loginProfiles = await fetchEligibleLoginProfiles(id);
  const updateAction = updateTeamMemberAction.bind(null, id);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-2xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Edit team member</h2>
          <p className="mt-1 text-sm text-muted">
            Update team details, status, or the linked Operation login account.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <TeamMemberForm
            action={updateAction}
            loginProfiles={loginProfiles}
            initialValues={{
              full_name: member.full_name,
              email: member.email ?? "",
              phone: member.phone ?? "",
              user_id: member.user_id ?? "",
              status: member.status,
            }}
          />
        </section>
      </div>
    </AppShell>
  );
}
