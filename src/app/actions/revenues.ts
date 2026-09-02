"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isApartmentAllowedForAdminEdit, isApartmentAllowedForNewEntry } from "@/lib/apartments/queries";
import { requireActiveAdmin } from "@/lib/auth/admin-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { RevenueFormValues } from "@/lib/revenues/types";
import {
  normalizeRevenueInput,
  parseRevenueForm,
  validateRevenueForm,
} from "@/lib/revenues/validation";

const SAVE_ERROR =
  "Unable to save the financial entry. Please review the information and try again.";

export type RevenueActionState = {
  errors?: Partial<Record<keyof RevenueFormValues, string>>;
  formError?: string;
  values?: RevenueFormValues;
};

export async function createRevenueAction(
  _prevState: RevenueActionState,
  formData: FormData,
): Promise<RevenueActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: SAVE_ERROR };
  }

  const values = parseRevenueForm(formData);
  const validated = validateRevenueForm(values);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const apartmentAllowed = await isApartmentAllowedForNewEntry(validated.data.apartment_id);
  if (!apartmentAllowed) {
    return {
      formError: SAVE_ERROR,
      values: validated.data,
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { formError: SAVE_ERROR, values: validated.data };
  }

  const payload = {
    ...normalizeRevenueInput(validated.data),
    created_by: user.id,
  };

  const { error } = await supabase.from("revenues").insert(payload);

  if (error) {
    return { formError: SAVE_ERROR, values: validated.data };
  }

  revalidatePath("/income-expenses");
  redirect("/income-expenses");
}

export async function updateRevenueAction(
  revenueId: string,
  _prevState: RevenueActionState,
  formData: FormData,
): Promise<RevenueActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: SAVE_ERROR };
  }

  const values = parseRevenueForm(formData);
  const validated = validateRevenueForm(values);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const supabase = await createServerSupabaseClient();
  const { data: existing, error: existingError } = await supabase
    .from("revenues")
    .select("apartment_id")
    .eq("id", revenueId)
    .maybeSingle();

  if (existingError || !existing) {
    return { formError: SAVE_ERROR, values: validated.data };
  }

  const apartmentAllowed = await isApartmentAllowedForAdminEdit(
    validated.data.apartment_id,
    existing.apartment_id,
  );

  if (!apartmentAllowed) {
    return { formError: SAVE_ERROR, values: validated.data };
  }

  const payload = normalizeRevenueInput(validated.data);
  const { error } = await supabase.from("revenues").update(payload).eq("id", revenueId);

  if (error) {
    return { formError: SAVE_ERROR, values: validated.data };
  }

  revalidatePath("/income-expenses");
  redirect("/income-expenses");
}
