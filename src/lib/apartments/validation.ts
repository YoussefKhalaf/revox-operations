import type { ApartmentFormValues, ApartmentStatus } from "@/lib/apartments/types";

export type ApartmentValidationResult =
  | { success: true; data: ApartmentFormValues }
  | {
      success: false;
      errors: Partial<Record<keyof ApartmentFormValues, string>>;
      values: ApartmentFormValues;
    };

function readStatus(value: FormDataEntryValue | null, isNew: boolean): ApartmentStatus {
  if (typeof value !== "string" || (value !== "active" && value !== "inactive")) {
    return "active";
  }

  return isNew ? "active" : value;
}

export function parseApartmentForm(formData: FormData, isNew: boolean): ApartmentFormValues {
  return {
    name: typeof formData.get("name") === "string" ? (formData.get("name") as string) : "",
    unit_code:
      typeof formData.get("unit_code") === "string" ? (formData.get("unit_code") as string) : "",
    address: typeof formData.get("address") === "string" ? (formData.get("address") as string) : "",
    notes: typeof formData.get("notes") === "string" ? (formData.get("notes") as string) : "",
    status: readStatus(formData.get("status"), isNew),
  };
}

export function validateApartmentForm(
  values: ApartmentFormValues,
  isNew: boolean,
): ApartmentValidationResult {
  const errors: Partial<Record<keyof ApartmentFormValues, string>> = {};
  const name = values.name.trim();

  if (name.length < 2) {
    errors.name = "Apartment name must be at least 2 characters.";
  } else if (name.length > 120) {
    errors.name = "Apartment name must be 120 characters or fewer.";
  }

  const unitCode = values.unit_code.trim();
  if (unitCode.length > 50) {
    errors.unit_code = "Unit code must be 50 characters or fewer.";
  }

  const address = values.address.trim();
  if (address.length > 300) {
    errors.address = "Address must be 300 characters or fewer.";
  }

  const notes = values.notes.trim();
  if (notes.length > 1000) {
    errors.notes = "Notes must be 1,000 characters or fewer.";
  }

  if (!isNew && values.status !== "active" && values.status !== "inactive") {
    errors.status = "Select a valid status.";
  }

  const normalized: ApartmentFormValues = {
    name,
    unit_code: unitCode,
    address,
    notes,
    status: isNew ? "active" : values.status,
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values: normalized };
  }

  return { success: true, data: normalized };
}

export function normalizeApartmentInput(data: ApartmentFormValues) {
  return {
    name: data.name,
    unit_code: data.unit_code.length > 0 ? data.unit_code : null,
    address: data.address.length > 0 ? data.address : null,
    notes: data.notes.length > 0 ? data.notes : null,
    status: data.status,
  };
}

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidApartmentId(value: string): boolean {
  return UUID_PATTERN.test(value);
}
