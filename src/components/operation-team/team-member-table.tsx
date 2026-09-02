import Link from "next/link";
import { deleteOperationMemberAction } from "@/app/actions/delete-records";
import { DeleteRecordButton } from "@/components/delete-record-button";
import type { OperationMember } from "@/lib/operation-team/types";

type TeamMemberTableProps = {
  members: OperationMember[];
};

function formatOptional(value: string | null) {
  return value && value.trim().length > 0 ? value : "—";
}

export function TeamMemberTable({ members }: TeamMemberTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Full Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Contact Email
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Phone
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Login Access
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{member.full_name}</td>
                <td className="px-4 py-3 text-sm text-muted">{formatOptional(member.email)}</td>
                <td className="px-4 py-3 text-sm text-muted">{formatOptional(member.phone)}</td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {member.status === "active" ? "Active" : "Inactive"}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {member.user_id ? "Linked" : "Not linked"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/operation-team/${member.id}/edit`}
                      className="font-medium text-accent hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteRecordButton
                      recordId={member.id}
                      confirmMessage="Delete this team member? Related advances or expenses must be removed first."
                      deleteAction={deleteOperationMemberAction}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {members.map((member) => (
          <article
            key={member.id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{member.full_name}</h3>
                <p className="mt-1 text-sm text-muted">{formatOptional(member.email)}</p>
                <p className="text-sm text-muted">{formatOptional(member.phone)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Link
                  href={`/operation-team/${member.id}/edit`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Edit
                </Link>
                <DeleteRecordButton
                  recordId={member.id}
                  confirmMessage="Delete this team member? Related advances or expenses must be removed first."
                  deleteAction={deleteOperationMemberAction}
                />
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Status</dt>
                <dd className="font-medium text-foreground">
                  {member.status === "active" ? "Active" : "Inactive"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Login Access</dt>
                <dd className="font-medium text-foreground">
                  {member.user_id ? "Linked" : "Not linked"}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
