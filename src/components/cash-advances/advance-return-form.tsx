"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AdvanceReturnActionState } from "@/app/actions/advance-returns";
import type { AdvanceReturnFormValues } from "@/lib/cash-advances/types";
import { getTodayLocalDate } from "@/lib/finance/validation";

type AdvanceReturnFormProps = {
  action: (
    prevState: AdvanceReturnActionState,
    formData: FormData,
  ) => Promise<AdvanceReturnActionState>;
  initialValues?: AdvanceReturnFormValues;
  isNew?: boolean;
  cancelHref: string;
};

const initialActionState: AdvanceReturnActionState = {};

export function AdvanceReturnForm({
  action,
  initialValues,
  isNew = false,
  cancelHref,
}: AdvanceReturnFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  const values: AdvanceReturnFormValues = {
    amount: state.values?.amount ?? initialValues?.amount ?? "",
    return_date:
      state.values?.return_date ??
      initialValues?.return_date ??
      (isNew ? getTodayLocalDate() : ""),
    notes: state.values?.notes ?? initialValues?.notes ?? "",
  };

  return (
    <form action={formAction} className="space-y-5" noValidate>
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
        <label htmlFor="return_date" className="block text-sm font-medium text-foreground">
          Return Date
        </label>
        <input
          id="return_date"
          name="return_date"
          type="date"
          required
          defaultValue={values.return_date}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.return_date && (
          <p className="mt-1 text-sm text-red-700">{state.errors.return_date}</p>
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
