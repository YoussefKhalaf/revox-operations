"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { CashAdvanceActionState } from "@/app/actions/cash-advances";
import type { CashAdvanceFormValues } from "@/lib/cash-advances/types";
import type { OperationMemberOption } from "@/lib/expenses/types";
import { getTodayLocalDate } from "@/lib/finance/validation";

type CashAdvanceFormProps = {
  action: (
    prevState: CashAdvanceActionState,
    formData: FormData,
  ) => Promise<CashAdvanceActionState>;
  operationMembers: OperationMemberOption[];
  initialValues?: CashAdvanceFormValues;
  memberLocked?: boolean;
  isNew?: boolean;
  cancelHref?: string;
};

const initialActionState: CashAdvanceActionState = {};

export function CashAdvanceForm({
  action,
  operationMembers,
  initialValues,
  memberLocked = false,
  isNew = false,
  cancelHref = "/cash-advances",
}: CashAdvanceFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  const values: CashAdvanceFormValues = {
    operation_member_id:
      state.values?.operation_member_id ?? initialValues?.operation_member_id ?? "",
    amount: state.values?.amount ?? initialValues?.amount ?? "",
    issued_date:
      state.values?.issued_date ??
      initialValues?.issued_date ??
      (isNew ? getTodayLocalDate() : ""),
    notes: state.values?.notes ?? initialValues?.notes ?? "",
  };

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="operation_member_id" className="block text-sm font-medium text-foreground">
          Team Member
        </label>
        {memberLocked ? (
          <>
            <p className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
              {operationMembers.find((member) => member.id === values.operation_member_id)?.full_name ??
                "Selected team member"}
            </p>
            <input type="hidden" name="operation_member_id" value={values.operation_member_id} />
            <p className="mt-1 text-xs text-muted">
              The team member cannot change after transactions are recorded.
            </p>
          </>
        ) : (
          <select
            id="operation_member_id"
            name="operation_member_id"
            required
            defaultValue={values.operation_member_id}
            disabled={isPending}
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
          >
            <option value="">Select a team member</option>
            {operationMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name}
              </option>
            ))}
          </select>
        )}
        {state.errors?.operation_member_id && (
          <p className="mt-1 text-sm text-red-700">{state.errors.operation_member_id}</p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-foreground">
          Amount (EGP)
        </label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          required
          defaultValue={values.amount}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.amount && (
          <p className="mt-1 text-sm text-red-700">{state.errors.amount}</p>
        )}
      </div>

      <div>
        <label htmlFor="issued_date" className="block text-sm font-medium text-foreground">
          Issued Date
        </label>
        <input
          id="issued_date"
          name="issued_date"
          type="date"
          required
          defaultValue={values.issued_date}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.issued_date && (
          <p className="mt-1 text-sm text-red-700">{state.errors.issued_date}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={values.notes}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.notes && (
          <p className="mt-1 text-sm text-red-700">{state.errors.notes}</p>
        )}
      </div>

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
