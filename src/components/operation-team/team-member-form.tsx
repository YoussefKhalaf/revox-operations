"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { TeamMemberActionState } from "@/app/actions/operation-team";
import type { LoginProfileOption, OperationMemberStatus } from "@/lib/operation-team/types";

type TeamMemberFormProps = {
  action: (
    prevState: TeamMemberActionState,
    formData: FormData,
  ) => Promise<TeamMemberActionState>;
  loginProfiles: LoginProfileOption[];
  initialValues?: {
    full_name: string;
    email: string;
    phone: string;
    user_id: string;
    status: OperationMemberStatus;
  };
  isNew?: boolean;
  cancelHref?: string;
};

const initialActionState: TeamMemberActionState = {};

export function TeamMemberForm({
  action,
  loginProfiles,
  initialValues,
  isNew = false,
  cancelHref = "/operation-team",
}: TeamMemberFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  const values = {
    full_name: state.values?.full_name ?? initialValues?.full_name ?? "",
    email: state.values?.email ?? initialValues?.email ?? "",
    phone: state.values?.phone ?? initialValues?.phone ?? "",
    user_id: state.values?.user_id ?? initialValues?.user_id ?? "",
    status: state.values?.status ?? initialValues?.status ?? "active",
  };

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-foreground">
          Full Name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={values.full_name}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.full_name && (
          <p className="mt-1 text-sm text-red-700">{state.errors.full_name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Contact Email
        </label>
        <p className="mt-1 text-xs text-muted">
          Optional contact email. This does not create a login account.
        </p>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={values.email}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.email && (
          <p className="mt-1 text-sm text-red-700">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          defaultValue={values.phone}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.phone && (
          <p className="mt-1 text-sm text-red-700">{state.errors.phone}</p>
        )}
      </div>

      <div>
        <label htmlFor="user_id" className="block text-sm font-medium text-foreground">
          Login Account
        </label>
        <p className="mt-1 text-xs text-muted">
          Optional link to an existing Operation login profile.
        </p>
        <select
          id="user_id"
          name="user_id"
          defaultValue={values.user_id}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        >
          <option value="">No login account</option>
          {loginProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.full_name}
            </option>
          ))}
        </select>
        {loginProfiles.length === 0 && values.user_id === "" && (
          <p className="mt-1 text-sm text-muted">
            No available Operation login accounts. Create the user in Supabase
            Authentication first.
          </p>
        )}
      </div>

      {!isNew && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-foreground">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={values.status}
            disabled={isPending}
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {state.errors?.status && (
            <p className="mt-1 text-sm text-red-700">{state.errors.status}</p>
          )}
        </div>
      )}

      {isNew && <input type="hidden" name="status" value="active" />}

      {state.formError && (
        <p role="alert" className="text-sm text-red-700">
          {state.formError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <Link
          href={cancelHref}
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
