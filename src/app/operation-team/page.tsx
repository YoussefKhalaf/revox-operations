import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { TeamMemberTable } from "@/components/operation-team/team-member-table";
import { SummaryCard } from "@/components/summary-card";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import { fetchOperationMembers } from "@/lib/operation-team/queries";
import { buildTeamMemberSummary } from "@/lib/operation-team/types";

export default async function OperationTeamPage() {
  const page = await getAdminPageContext("/operation-team");

  if (page.kind === "screen") {
    return page.element;
  }

  const members = await fetchOperationMembers();
  const summary = buildTeamMemberSummary(members);

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Operation Team</h2>
            <p className="mt-1 text-sm text-muted">
              Manage the people responsible for REVOX daily operations.
            </p>
          </div>
          <Link
            href="/operation-team/new"
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Add team member
          </Link>
        </section>

        <section
          aria-label="Team summary"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          <SummaryCard label="Total Members" value={String(summary.total)} />
          <SummaryCard label="Active" value={String(summary.active)} />
          <SummaryCard label="Inactive" value={String(summary.inactive)} />
          <SummaryCard label="Login Linked" value={String(summary.loginLinked)} />
        </section>

        {members.length === 0 ? (
          <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
            <h3 className="text-base font-semibold text-foreground">
              No Operation team members yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Add the first team member to start managing the REVOX Operation team.
            </p>
            <Link
              href="/operation-team/new"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              Add team member
            </Link>
          </section>
        ) : (
          <TeamMemberTable members={members} />
        )}
      </div>
    </AppShell>
  );
}
