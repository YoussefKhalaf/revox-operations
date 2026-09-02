"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { advanceHasTransactions } from "@/lib/cash-advances/queries";
import {
  normalizeCashAdvanceInput,
  parseCashAdvanceForm,
  validateCashAdvanceForm,
} from "@/lib/cash-advances/validation";
import type { CashAdvanceFormValues } from "@/lib/cash-advances/types";
import { requireActiveAdmin } from "@/lib/auth/admin-page";
import { isOperationMemberAllowedForNewExpense } from "@/lib/expenses/queries";
import { mapCashAdvanceSaveError } from "@/lib/finance/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CashAdvanceActionState = {
  errors?: Partial<Record<keyof CashAdvanceFormValues, string>>;
  formError?: string;
  values?: CashAdvanceFormValues;
};

export async function createCashAdvanceAction(
  _prevState: CashAdvanceActionState,
  formData: FormData,
): Promise<CashAdvanceActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: mapCashAdvanceSaveError(null) };
  }

  const values = parseCashAdvanceForm(formData);
  const validated = validateCashAdvanceForm(values);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const memberAllowed = await isOperationMemberAllowedForNewExpense(
    validated.data.operation_member_id,
  );

  if (!memberAllowed) {
    return { formError: mapCashAdvanceSaveError(null), values: validated.data };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { formError: mapCashAdvanceSaveError(null), values: validated.data };
  }

  const payload = {
    ...normalizeCashAdvanceInput(validated.data),
    created_by: user.id,
  };

  const { error } = await supabase.from("cash_advances").insert(payload);

  if (error) {
    return { formError: mapCashAdvanceSaveError(error), values: validated.data };
  }

  revalidatePath("/cash-advances");
  revalidatePath("/my-cash-advances");
  redirect("/cash-advances");
}

export async function updateCashAdvanceAction(
  advanceId: string,
  _prevState: CashAdvanceActionState,
  formData: FormData,
): Promise<CashAdvanceActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: mapCashAdvanceSaveError(null) };
  }

  const values = parseCashAdvanceForm(formData);
  const validated = validateCashAdvanceForm(values);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const hasTransactions = await advanceHasTransactions(advanceId);

  if (hasTransactions) {
    const supabase = await createServerSupabaseClient();
    const { data: existing } = await supabase
      .from("cash_advances")
      .select("operation_member_id")
      .eq("id", advanceId)
      .maybeSingle();

    if (
      existing &&
      existing.operation_member_id !== validated.data.operation_member_id
    ) {
      return {
        formError: mapCashAdvanceSaveError({ message: "ADVANCE_MEMBER_LOCKED" }),
        values: validated.data,
      };
    }
  } else {
    const memberAllowed = await isOperationMemberAllowedForNewExpense(
      validated.data.operation_member_id,
    );

    if (!memberAllowed) {
      return { formError: mapCashAdvanceSaveError(null), values: validated.data };
    }
  }

  const supabase = await createServerSupabaseClient();
  const payload = normalizeCashAdvanceInput(validated.data);
  const { error } = await supabase.from("cash_advances").update(payload).eq("id", advanceId);

  if (error) {
    return { formError: mapCashAdvanceSaveError(error), values: validated.data };
  }

  revalidatePath("/cash-advances");
  revalidatePath(`/cash-advances/${advanceId}`);
  revalidatePath("/my-cash-advances");
  redirect(`/cash-advances/${advanceId}`);
}
