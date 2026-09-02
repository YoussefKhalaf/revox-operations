"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ExpenseActionState } from "@/app/actions/expenses";
import { formatCashAdvanceLabel } from "@/lib/cash-advances/display";
import type { CashAdvanceOption } from "@/lib/cash-advances/types";
import type { ApartmentOption } from "@/lib/finance/types";
import { formatApartmentLabel } from "@/lib/finance/types";
import { getTodayLocalDate } from "@/lib/finance/validation";
import type { ExpenseFormValues, OperationMemberOption } from "@/lib/expenses/types";

type ExpenseFormProps = {
  action: (
    prevState: ExpenseActionState,
    formData: FormData,
  ) => Promise<ExpenseActionState>;
  apartments: ApartmentOption[];
  operationMembers: OperationMemberOption[];
  advancesByMember: Record<string, CashAdvanceOption[]>;
  initialValues?: ExpenseFormValues;
  isNew?: boolean;
  cancelHref?: string;
};

const initialActionState: ExpenseActionState = {};

export function ExpenseForm({
  action,
  apartments,
  operationMembers,
  advancesByMember,
  initialValues,
  isNew = false,
  cancelHref = "/income-expenses",
}: ExpenseFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  const values: ExpenseFormValues = {
    apartment_id: state.values?.apartment_id ?? initialValues?.apartment_id ?? "",
    paid_by: state.values?.paid_by ?? initialValues?.paid_by ?? "",
    cash_advance_id: state.values?.cash_advance_id ?? initialValues?.cash_advance_id ?? "",
    category: state.values?.category ?? initialValues?.category ?? "",
    description: state.values?.description ?? initialValues?.description ?? "",
    amount: state.values?.amount ?? initialValues?.amount ?? "",
    expense_date:
      state.values?.expense_date ??
      initialValues?.expense_date ??
      (isNew ? getTodayLocalDate() : ""),
  };

  const [paidBy, setPaidBy] = useState(values.paid_by);
  const showCashAdvance = paidBy.length > 0 && paidBy !== "revex-direct";
  const cashAdvanceOptions = showCashAdvance ? (advancesByMember[paidBy] ?? []) : [];

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
        <label htmlFor="paid_by" className="block text-sm font-medium text-foreground">
          Paid By
        </label>
        <select
          id="paid_by"
          name="paid_by"
          required
          defaultValue={values.paid_by}
          disabled={isPending}
          onChange={(event) => setPaidBy(event.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
        >
          <option value="">Select payer</option>
          <option value="revex-direct">REVOX Direct</option>
          {operationMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.full_name}
            </option>
          ))}
        </select>
        {state.errors?.paid_by && (
          <p className="mt-1 text-sm text-red-700">{state.errors.paid_by}</p>
        )}
      </div>

      {showCashAdvance && (
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
            {cashAdvanceOptions.map((advance) => (
              <option key={advance.id} value={advance.id}>
                {formatCashAdvanceLabel(advance)}
              </option>
            ))}
          </select>
          {state.errors?.cash_advance_id && (
            <p className="mt-1 text-sm text-red-700">{state.errors.cash_advance_id}</p>
          )}
        </div>
      )}

      {!showCashAdvance && <input type="hidden" name="cash_advance_id" value="" />}

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
