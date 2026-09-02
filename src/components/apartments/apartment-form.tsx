"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ApartmentActionState } from "@/app/actions/apartments";
import type { ApartmentStatus } from "@/lib/apartments/types";

type ApartmentFormProps = {
  action: (
    prevState: ApartmentActionState,
    formData: FormData,
  ) => Promise<ApartmentActionState>;
  initialValues?: {
    name: string;
    unit_code: string;
    address: string;
    notes: string;
    status: ApartmentStatus;
  };
  isNew?: boolean;
  cancelHref?: string;
};

const initialActionState: ApartmentActionState = {};

export function ApartmentForm({
  action,
  initialValues,
  isNew = false,
  cancelHref = "/apartments",
}: ApartmentFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  const values = {
    name: state.values?.name ?? initialValues?.name ?? "",
    unit_code: state.values?.unit_code ?? initialValues?.unit_code ?? "",
    address: state.values?.address ?? initialValues?.address ?? "",
    notes: state.values?.notes ?? initialValues?.notes ?? "",
    status: state.values?.status ?? initialValues?.status ?? "active",
  };

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Apartment Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={values.name}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.name && (
          <p className="mt-1 text-sm text-red-700">{state.errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="unit_code" className="block text-sm font-medium text-foreground">
          Unit Code
        </label>
        <input
          id="unit_code"
          name="unit_code"
          type="text"
          defaultValue={values.unit_code}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.unit_code && (
          <p className="mt-1 text-sm text-red-700">{state.errors.unit_code}</p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-foreground">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          defaultValue={values.address}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.address && (
          <p className="mt-1 text-sm text-red-700">{state.errors.address}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Notes
        </label>
        <p className="mt-1 text-xs text-muted">Admin-only internal notes.</p>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={values.notes}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.notes && (
          <p className="mt-1 text-sm text-red-700">{state.errors.notes}</p>
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
