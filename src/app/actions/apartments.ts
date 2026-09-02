"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActiveAdmin } from "@/lib/auth/admin-page";
import {
  normalizeApartmentInput,
  parseApartmentForm,
  validateApartmentForm,
} from "@/lib/apartments/validation";
import type { ApartmentFormValues } from "@/lib/apartments/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const SAVE_ERROR =
  "Unable to save the apartment. Please review the information and try again.";

export type ApartmentActionState = {
  errors?: Partial<Record<keyof ApartmentFormValues, string>>;
  formError?: string;
  values?: ApartmentFormValues;
};

export async function createApartmentAction(
  _prevState: ApartmentActionState,
  formData: FormData,
): Promise<ApartmentActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: SAVE_ERROR };
  }

  const values = parseApartmentForm(formData, true);
  const validated = validateApartmentForm(values, true);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const supabase = await createServerSupabaseClient();
  const payload = normalizeApartmentInput(validated.data);

  const { error } = await supabase.from("apartments").insert(payload);

  if (error) {
    return { formError: SAVE_ERROR, values: validated.data };
  }

  revalidatePath("/apartments");
  redirect("/apartments");
}

export async function updateApartmentAction(
  apartmentId: string,
  _prevState: ApartmentActionState,
  formData: FormData,
): Promise<ApartmentActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: SAVE_ERROR };
  }

  const values = parseApartmentForm(formData, false);
  const validated = validateApartmentForm(values, false);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const supabase = await createServerSupabaseClient();
  const payload = normalizeApartmentInput(validated.data);

  const { error } = await supabase.from("apartments").update(payload).eq("id", apartmentId);

  if (error) {
    return { formError: SAVE_ERROR, values: validated.data };
  }

  revalidatePath("/apartments");
  redirect("/apartments");
}
