import { validateAmount } from "@/lib/finance/amount";
import { validateDateField } from "@/lib/finance/validation";
import type {
  ExpenseFormValues,
  OperationExpenseFormValues,
} from "@/lib/expenses/types";

type ExpenseValidationResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      errors: Partial<Record<keyof T, string>>;
      values: T;
    };

export function parseExpenseForm(formData: FormData): ExpenseFormValues {
  return {
    apartment_id:
      typeof formData.get("apartment_id") === "string"
        ? (formData.get("apartment_id") as string)
        : "",
    paid_by:
      typeof formData.get("paid_by") === "string" ? (formData.get("paid_by") as string) : "",
    cash_advance_id:
      typeof formData.get("cash_advance_id") === "string"
        ? (formData.get("cash_advance_id") as string)
        : "",
    category:
      typeof formData.get("category") === "string" ? (formData.get("category") as string) : "",
    description:
      typeof formData.get("description") === "string"
        ? (formData.get("description") as string)
        : "",
    amount: typeof formData.get("amount") === "string" ? (formData.get("amount") as string) : "",
    expense_date:
      typeof formData.get("expense_date") === "string"
        ? (formData.get("expense_date") as string)
        : "",
  };
}

export function parseOperationExpenseForm(formData: FormData): OperationExpenseFormValues {
  return {
    apartment_id:
      typeof formData.get("apartment_id") === "string"
        ? (formData.get("apartment_id") as string)
        : "",
    cash_advance_id:
      typeof formData.get("cash_advance_id") === "string"
        ? (formData.get("cash_advance_id") as string)
        : "",
    category:
      typeof formData.get("category") === "string" ? (formData.get("category") as string) : "",
    description:
      typeof formData.get("description") === "string"
        ? (formData.get("description") as string)
        : "",
    amount: typeof formData.get("amount") === "string" ? (formData.get("amount") as string) : "",
    expense_date:
      typeof formData.get("expense_date") === "string"
        ? (formData.get("expense_date") as string)
        : "",
  };
}

function validateSharedExpenseFields(values: {
  apartment_id: string;
  category: string;
  description: string;
  amount: string;
  expense_date: string;
}) {
  const errors: Record<string, string> = {};

  const apartmentId = values.apartment_id.trim();
  if (apartmentId.length === 0) {
    errors.apartment_id = "Select an apartment.";
  }

  const category = values.category.trim();
  if (category.length < 2) {
    errors.category = "Category must be at least 2 characters.";
  } else if (category.length > 100) {
    errors.category = "Category must be 100 characters or fewer.";
  }

  const description = values.description.trim();
  if (description.length < 2) {
    errors.description = "Description must be at least 2 characters.";
  } else if (description.length > 500) {
    errors.description = "Description must be 500 characters or fewer.";
  }

  const amountResult = validateAmount(values.amount);
  if (!amountResult.ok) {
    errors.amount = amountResult.error;
  }

  const dateResult = validateDateField(values.expense_date);
  if (!dateResult.ok) {
    errors.expense_date = dateResult.error;
  }

  return {
    errors,
    normalized: {
      apartment_id: apartmentId,
      category,
      description,
      amount: amountResult.ok ? amountResult.amount : values.amount.trim(),
      expense_date: dateResult.ok ? dateResult.date : values.expense_date.trim(),
    },
  };
}

export function validateExpenseForm(values: ExpenseFormValues): ExpenseValidationResult<ExpenseFormValues> {
  const shared = validateSharedExpenseFields(values);
  const errors: Partial<Record<keyof ExpenseFormValues, string>> = { ...shared.errors };

  const paidBy = values.paid_by.trim();
  if (paidBy.length === 0) {
    errors.paid_by = "Select who paid for this expense.";
  }

  const normalized: ExpenseFormValues = {
    ...shared.normalized,
    paid_by: paidBy,
    cash_advance_id: values.cash_advance_id.trim(),
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values: normalized };
  }

  return { success: true, data: normalized };
}

export function validateOperationExpenseForm(
  values: OperationExpenseFormValues,
): ExpenseValidationResult<OperationExpenseFormValues> {
  const shared = validateSharedExpenseFields(values);
  const errors: Partial<Record<keyof OperationExpenseFormValues, string>> = { ...shared.errors };

  const normalized: OperationExpenseFormValues = {
    apartment_id: shared.normalized.apartment_id,
    cash_advance_id: values.cash_advance_id.trim(),
    category: shared.normalized.category,
    description: shared.normalized.description,
    amount: shared.normalized.amount,
    expense_date: shared.normalized.expense_date,
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values: normalized };
  }

  return { success: true, data: normalized };
}

export function normalizeExpenseInput(data: ExpenseFormValues) {
  const paidByMemberId = data.paid_by === "revex-direct" ? null : data.paid_by;
  const cashAdvanceId =
    paidByMemberId && data.cash_advance_id.length > 0 ? data.cash_advance_id : null;

  return {
    apartment_id: data.apartment_id,
    paid_by_member_id: paidByMemberId,
    cash_advance_id: cashAdvanceId,
    category: data.category,
    description: data.description,
    amount: data.amount,
    expense_date: data.expense_date,
  };
}

export function normalizeOperationExpenseInput(data: OperationExpenseFormValues) {
  return {
    apartment_id: data.apartment_id,
    cash_advance_id: data.cash_advance_id.length > 0 ? data.cash_advance_id : null,
    category: data.category,
    description: data.description,
    amount: data.amount,
    expense_date: data.expense_date,
  };
}
