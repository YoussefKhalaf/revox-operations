"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { OperationExpenseActionState } from "@/app/actions/expenses";
import { formatCashAdvanceLabel } from "@/lib/cash-advances/display";
import type { CashAdvanceOption } from "@/lib/cash-advances/types";
import type { ApartmentOption } from "@/lib/finance/types";
import { formatApartmentLabel } from "@/lib/finance/types";
import { getTodayLocalDate } from "@/lib/finance/validation";
import type { OperationExpenseFormValues } from "@/lib/expenses/types";

type OperationExpenseFormProps = {
  action: (
    prevState: OperationExpenseActionState,
    formData: FormData,
  ) => Promise<OperationExpenseActionState>;
  apartments: ApartmentOption[];
  cashAdvances: CashAdvanceOption[];
  cancelHref?: string;
};

const initialActionState: OperationExpenseActionState = {};

export function OperationExpenseForm({
  action,
  apartments,
  cashAdvances,
  cancelHref = "/my-expenses",
}: OperationExpenseFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  const values: OperationExpenseFormValues = {
    apartment_id: state.values?.apartment_id ?? "",
    cash_advance_id: state.values?.cash_advance_id ?? "",
    category: state.values?.category ?? "",
    description: state.values?.description ?? "",
    amount: state.values?.amount ?? "",
    expense_date: state.values?.expense_date ?? getTodayLocalDate(),
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
        <label htmlFor="cash_advance_id" className="block text-sm font-medium text-foreground">
          Cash Advance
        </label>
        <select
          id="cash_advance_id"
          name="cash_advance_id"
          defaultValue={values.cash_advance_id}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        >
          <option value="">No cash advance</option>
          {cashAdvances.map((advance) => (
            <option key={advance.id} value={advance.id}>
              {formatCashAdvanceLabel(advance)}
            </option>
          ))}
        </select>
        {state.errors?.cash_advance_id && (
          <p className="mt-1 text-sm text-red-700">{state.errors.cash_advance_id}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-foreground">
          Category
        </label>
        <input
          id="category"
          name="category"
          type="text"
          required
          defaultValue={values.category}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.category && (
          <p className="mt-1 text-sm text-red-700">{state.errors.category}</p>
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
          required
          defaultValue={values.description}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.description && (
          <p className="mt-1 text-sm text-red-700">{state.errors.description}</p>
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
        <label htmlFor="expense_date" className="block text-sm font-medium text-foreground">
          Expense Date
        </label>
        <input
          id="expense_date"
          name="expense_date"
          type="date"
          required
          defaultValue={values.expense_date}
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        />
        {state.errors?.expense_date && (
          <p className="mt-1 text-sm text-red-700">{state.errors.expense_date}</p>
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
