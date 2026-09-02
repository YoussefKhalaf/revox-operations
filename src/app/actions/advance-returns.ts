"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fetchCashAdvanceBalanceById } from "@/lib/cash-advances/queries";
import {
  normalizeAdvanceReturnInput,
  parseAdvanceReturnForm,
  validateAdvanceReturnForm,
} from "@/lib/cash-advances/validation";
import type { AdvanceReturnFormValues } from "@/lib/cash-advances/types";
import { requireActiveAdmin } from "@/lib/auth/admin-page";
import { isPositiveBalance, toCents, fromCents } from "@/lib/finance/balance";
import { mapReturnSaveError } from "@/lib/finance/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdvanceReturnActionState = {
  errors?: Partial<Record<keyof AdvanceReturnFormValues, string>>;
  formError?: string;
  values?: AdvanceReturnFormValues;
};

async function validateReturnCapacity(
  advanceId: string,
  amount: string,
  excludeReturnId?: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const balance = await fetchCashAdvanceBalanceById(advanceId);

  if (!balance) {
    return { ok: false, message: mapReturnSaveError(null) };
  }

  let available = balance.remaining_balance;

  if (excludeReturnId) {
    const supabase = await createServerSupabaseClient();
    const { data: existingReturn } = await supabase
      .from("advance_returns")
      .select("amount")
      .eq("id", excludeReturnId)
      .eq("cash_advance_id", advanceId)
      .maybeSingle();

    if (existingReturn?.amount) {
      available = fromCents(toCents(available) + toCents(String(existingReturn.amount)));
    }
  }

  if (toCents(amount) > toCents(available)) {
    return {
      ok: false,
      message: mapReturnSaveError({ message: "RETURN_EXCEEDS_BALANCE" }),
    };
  }

  return { ok: true };
}

export async function createAdvanceReturnAction(
  advanceId: string,
  _prevState: AdvanceReturnActionState,
  formData: FormData,
): Promise<AdvanceReturnActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: mapReturnSaveError(null) };
  }

  const values = parseAdvanceReturnForm(formData);
  const validated = validateAdvanceReturnForm(values);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const balance = await fetchCashAdvanceBalanceById(advanceId);
  if (!balance || !isPositiveBalance(balance.remaining_balance)) {
    return { formError: mapReturnSaveError(null), values: validated.data };
  }

  const capacity = await validateReturnCapacity(advanceId, validated.data.amount);
  if (!capacity.ok) {
    return { formError: capacity.message, values: validated.data };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { formError: mapReturnSaveError(null), values: validated.data };
  }

  const payload = {
    ...normalizeAdvanceReturnInput(validated.data),
    cash_advance_id: advanceId,
    created_by: user.id,
  };

  const { error } = await supabase.from("advance_returns").insert(payload);

  if (error) {
    return { formError: mapReturnSaveError(error), values: validated.data };
  }

  revalidatePath("/cash-advances");
  revalidatePath(`/cash-advances/${advanceId}`);
  revalidatePath("/my-cash-advances");
  redirect(`/cash-advances/${advanceId}`);
}

export async function updateAdvanceReturnAction(
  advanceId: string,
  returnId: string,
  _prevState: AdvanceReturnActionState,
  formData: FormData,
): Promise<AdvanceReturnActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: mapReturnSaveError(null) };
  }

  const values = parseAdvanceReturnForm(formData);
  const validated = validateAdvanceReturnForm(values);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const capacity = await validateReturnCapacity(
    advanceId,
    validated.data.amount,
    returnId,
  );

  if (!capacity.ok) {
    return { formError: capacity.message, values: validated.data };
  }

  const supabase = await createServerSupabaseClient();
  const payload = normalizeAdvanceReturnInput(validated.data);
  const { error } = await supabase
    .from("advance_returns")
    .update(payload)
    .eq("id", returnId)
    .eq("cash_advance_id", advanceId);

  if (error) {
    return { formError: mapReturnSaveError(error), values: validated.data };
  }

  revalidatePath("/cash-advances");
  revalidatePath(`/cash-advances/${advanceId}`);
  revalidatePath("/my-cash-advances");
  redirect(`/cash-advances/${advanceId}`);
}
