"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { RevenueActionState } from "@/app/actions/revenues";
import type { ApartmentOption } from "@/lib/finance/types";
import { formatApartmentLabel } from "@/lib/finance/types";
import { getTodayLocalDate } from "@/lib/finance/validation";
import type { RevenueFormValues } from "@/lib/revenues/types";

type RevenueFormProps = {
  action: (
    prevState: RevenueActionState,
    formData: FormData,
  ) => Promise<RevenueActionState>;
  apartments: ApartmentOption[];
  initialValues?: RevenueFormValues;
  isNew?: boolean;
  cancelHref?: string;
};

const initialActionState: RevenueActionState = {};

export function RevenueForm({
  action,
  apartments,
  initialValues,
  isNew = false,
  cancelHref = "/income-expenses",
}: RevenueFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  const values: RevenueFormValues = {
    apartment_id: state.values?.apartment_id ?? initialValues?.apartment_id ?? "",
    amount: state.values?.amount ?? initialValues?.amount ?? "",
    revenue_date:
      state.values?.revenue_date ??
      initialValues?.revenue_date ??
      (isNew ? getTodayLocalDate() : ""),
    source: state.values?.source ?? initialValues?.source ?? "",
    description: state.values?.description ?? initialValues?.description ?? "",
  };

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="apartment_id" className="block text-sm font-medium text-foreground">
          Apartment
        </label>
        <select
          id="apartment_id"
          name="apartment_id"
          required
          defaultValue={values.apartment_id}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        >
          <option value="">Select an apartment</option>
          {apartments.map((apartment) => (
            <option key={apartment.id} value={apartment.id}>
              {formatApartmentLabel(apartment)}
            </option>
          ))}
        </select>
        {state.errors?.apartment_id && (
          <p className="mt-1 text-sm text-red-700">{state.errors.apartment_id}</p>
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
        <label htmlFor="revenue_date" className="block text-sm font-medium text-foreground">
          Revenue Date
        </label>
        <input
          id="revenue_date"
          name="revenue_date"
          type="date"
          required
          defaultValue={values.revenue_date}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.revenue_date && (
          <p className="mt-1 text-sm text-red-700">{state.errors.revenue_date}</p>
        )}
      </div>

      <div>
        <label htmlFor="source" className="block text-sm font-medium text-foreground">
          Source
        </label>
        <input
          id="source"
          name="source"
          type="text"
          defaultValue={values.source}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.source && (
          <p className="mt-1 text-sm text-red-700">{state.errors.source}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={values.description}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.description && (
          <p className="mt-1 text-sm text-red-700">{state.errors.description}</p>
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
