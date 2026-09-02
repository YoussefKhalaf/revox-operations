import { validateAmount } from "@/lib/finance/amount";
import { validateDateField } from "@/lib/finance/validation";
import type { RevenueFormValues } from "@/lib/revenues/types";

export type RevenueValidationResult =
  | { success: true; data: RevenueFormValues }
  | {
      success: false;
      errors: Partial<Record<keyof RevenueFormValues, string>>;
      values: RevenueFormValues;
    };

export function parseRevenueForm(formData: FormData): RevenueFormValues {
  return {
    apartment_id:
      typeof formData.get("apartment_id") === "string"
        ? (formData.get("apartment_id") as string)
        : "",
    amount: typeof formData.get("amount") === "string" ? (formData.get("amount") as string) : "",
    revenue_date:
      typeof formData.get("revenue_date") === "string"
        ? (formData.get("revenue_date") as string)
        : "",
    source: typeof formData.get("source") === "string" ? (formData.get("source") as string) : "",
    description:
      typeof formData.get("description") === "string"
        ? (formData.get("description") as string)
        : "",
  };
}

export function validateRevenueForm(values: RevenueFormValues): RevenueValidationResult {
  const errors: Partial<Record<keyof RevenueFormValues, string>> = {};

  const apartmentId = values.apartment_id.trim();
  if (apartmentId.length === 0) {
    errors.apartment_id = "Select an apartment.";
  }

  const amountResult = validateAmount(values.amount);
  if (!amountResult.ok) {
    errors.amount = amountResult.error;
  }

  const dateResult = validateDateField(values.revenue_date);
  if (!dateResult.ok) {
    errors.revenue_date = dateResult.error;
  }

  const source = values.source.trim();
  if (source.length > 100) {
    errors.source = "Source must be 100 characters or fewer.";
  }

  const description = values.description.trim();
  if (description.length > 500) {
    errors.description = "Description must be 500 characters or fewer.";
  }

  const normalized: RevenueFormValues = {
    apartment_id: apartmentId,
    amount: amountResult.ok ? amountResult.amount : values.amount.trim(),
    revenue_date: dateResult.ok ? dateResult.date : values.revenue_date.trim(),
    source,
    description,
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values: normalized };
  }

  return { success: true, data: normalized };
}

export function normalizeRevenueInput(data: RevenueFormValues) {
  return {
    apartment_id: data.apartment_id,
    amount: data.amount,
    revenue_date: data.revenue_date,
    source: data.source.length > 0 ? data.source : null,
    description: data.description.length > 0 ? data.description : null,
  };
}
