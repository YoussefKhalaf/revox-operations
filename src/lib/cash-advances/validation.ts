import { validateAmount } from "@/lib/finance/amount";
import { validateDateField } from "@/lib/finance/validation";
import type { CashAdvanceFormValues, AdvanceReturnFormValues } from "@/lib/cash-advances/types";

type ValidationResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      errors: Partial<Record<keyof T, string>>;
      values: T;
    };

export function parseCashAdvanceForm(formData: FormData): CashAdvanceFormValues {
  return {
    operation_member_id:
      typeof formData.get("operation_member_id") === "string"
        ? (formData.get("operation_member_id") as string)
        : "",
    amount: typeof formData.get("amount") === "string" ? (formData.get("amount") as string) : "",
    issued_date:
      typeof formData.get("issued_date") === "string"
        ? (formData.get("issued_date") as string)
        : "",
    notes: typeof formData.get("notes") === "string" ? (formData.get("notes") as string) : "",
  };
}

export function validateCashAdvanceForm(
  values: CashAdvanceFormValues,
): ValidationResult<CashAdvanceFormValues> {
  const errors: Partial<Record<keyof CashAdvanceFormValues, string>> = {};

  const operationMemberId = values.operation_member_id.trim();
  if (operationMemberId.length === 0) {
    errors.operation_member_id = "Select a team member.";
  }

  const amountResult = validateAmount(values.amount);
  if (!amountResult.ok) {
    errors.amount = amountResult.error;
  }

  const dateResult = validateDateField(values.issued_date);
  if (!dateResult.ok) {
    errors.issued_date = dateResult.error;
  }

  const notes = values.notes.trim();
  if (notes.length > 500) {
    errors.notes = "Notes must be 500 characters or fewer.";
  }

  const normalized: CashAdvanceFormValues = {
    operation_member_id: operationMemberId,
    amount: amountResult.ok ? amountResult.amount : values.amount.trim(),
    issued_date: dateResult.ok ? dateResult.date : values.issued_date.trim(),
    notes,
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values: normalized };
  }

  return { success: true, data: normalized };
}

export function normalizeCashAdvanceInput(data: CashAdvanceFormValues) {
  return {
    operation_member_id: data.operation_member_id,
    amount: data.amount,
    issued_date: data.issued_date,
    notes: data.notes.length > 0 ? data.notes : null,
  };
}

export function parseAdvanceReturnForm(formData: FormData): AdvanceReturnFormValues {
  return {
    amount: typeof formData.get("amount") === "string" ? (formData.get("amount") as string) : "",
    return_date:
      typeof formData.get("return_date") === "string"
        ? (formData.get("return_date") as string)
        : "",
    notes: typeof formData.get("notes") === "string" ? (formData.get("notes") as string) : "",
  };
}

export function validateAdvanceReturnForm(
  values: AdvanceReturnFormValues,
): ValidationResult<AdvanceReturnFormValues> {
  const errors: Partial<Record<keyof AdvanceReturnFormValues, string>> = {};

  const amountResult = validateAmount(values.amount);
  if (!amountResult.ok) {
    errors.amount = amountResult.error;
  }

  const dateResult = validateDateField(values.return_date);
  if (!dateResult.ok) {
    errors.return_date = dateResult.error;
  }

  const notes = values.notes.trim();
  if (notes.length > 500) {
    errors.notes = "Notes must be 500 characters or fewer.";
  }

  const normalized: AdvanceReturnFormValues = {
    amount: amountResult.ok ? amountResult.amount : values.amount.trim(),
    return_date: dateResult.ok ? dateResult.date : values.return_date.trim(),
    notes,
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values: normalized };
  }

  return { success: true, data: normalized };
}

export function normalizeAdvanceReturnInput(data: AdvanceReturnFormValues) {
  return {
    amount: data.amount,
    return_date: data.return_date,
    notes: data.notes.length > 0 ? data.notes : null,
  };
}
