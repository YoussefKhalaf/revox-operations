import type {
  OperationMemberStatus,
  TeamMemberFormValues,
} from "@/lib/operation-team/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d+\s\-()]*$/;

export type ValidationResult =
  | { success: true; data: TeamMemberFormValues }
  | { success: false; errors: Partial<Record<keyof TeamMemberFormValues, string>>; values: TeamMemberFormValues };

function readStatus(value: FormDataEntryValue | null, isNew: boolean): OperationMemberStatus {
  if (typeof value !== "string" || (value !== "active" && value !== "inactive")) {
    return isNew ? "active" : "active";
  }

  return value;
}

export function parseTeamMemberForm(formData: FormData, isNew: boolean): TeamMemberFormValues {
  return {
    full_name: typeof formData.get("full_name") === "string" ? formData.get("full_name") as string : "",
    email: typeof formData.get("email") === "string" ? formData.get("email") as string : "",
    phone: typeof formData.get("phone") === "string" ? formData.get("phone") as string : "",
    user_id: typeof formData.get("user_id") === "string" ? formData.get("user_id") as string : "",
    status: readStatus(formData.get("status"), isNew),
  };
}

export function validateTeamMemberForm(
  values: TeamMemberFormValues,
  isNew: boolean,
): ValidationResult {
  const errors: Partial<Record<keyof TeamMemberFormValues, string>> = {};
  const fullName = values.full_name.trim();

  if (fullName.length < 2) {
    errors.full_name = "Full name must be at least 2 characters.";
  } else if (fullName.length > 100) {
    errors.full_name = "Full name must be 100 characters or fewer.";
  }

  const email = values.email.trim().toLowerCase();
  if (email.length > 0) {
    if (email.length > 254) {
      errors.email = "Contact email must be 254 characters or fewer.";
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = "Enter a valid contact email address.";
    }
  }

  const phone = values.phone.trim();
  if (phone.length > 30) {
    errors.phone = "Phone must be 30 characters or fewer.";
  } else if (phone.length > 0 && !PHONE_PATTERN.test(phone)) {
    errors.phone = "Phone may contain only digits, +, spaces, hyphens, and parentheses.";
  }

  if (!isNew && values.status !== "active" && values.status !== "inactive") {
    errors.status = "Select a valid status.";
  }

  const normalized: TeamMemberFormValues = {
    full_name: fullName,
    email,
    phone,
    user_id: values.user_id.trim(),
    status: isNew ? "active" : values.status,
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values: normalized };
  }

  return { success: true, data: normalized };
}

export function normalizeTeamMemberInput(data: TeamMemberFormValues) {
  return {
    full_name: data.full_name,
    email: data.email.length > 0 ? data.email : null,
    phone: data.phone.length > 0 ? data.phone : null,
    user_id: data.user_id.length > 0 ? data.user_id : null,
    status: data.status,
  };
}
