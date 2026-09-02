"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isApartmentAllowedForAdminEdit,
  isApartmentAllowedForNewEntry,
} from "@/lib/apartments/queries";
import { isCashAdvanceAllowedForExpense } from "@/lib/cash-advances/queries";
import { requireActiveAdmin } from "@/lib/auth/admin-page";
import { requireActiveOperationMember } from "@/lib/auth/operation-page";
import {
  isOperationMemberAllowedForAdminEdit,
  isOperationMemberAllowedForNewExpense,
} from "@/lib/expenses/queries";
import type { ExpenseFormValues, OperationExpenseFormValues } from "@/lib/expenses/types";
import {
  normalizeExpenseInput,
  normalizeOperationExpenseInput,
  parseExpenseForm,
  parseOperationExpenseForm,
  validateExpenseForm,
  validateOperationExpenseForm,
} from "@/lib/expenses/validation";
import { MEMBER_MISMATCH_ERROR, mapExpenseSaveError } from "@/lib/finance/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ExpenseActionState = {
  errors?: Partial<Record<keyof ExpenseFormValues, string>>;
  formError?: string;
  values?: ExpenseFormValues;
};

export type OperationExpenseActionState = {
  errors?: Partial<Record<keyof OperationExpenseFormValues, string>>;
  formError?: string;
  values?: OperationExpenseFormValues;
};

async function validateExpenseAdvanceLink(params: {
  cashAdvanceId: string | null;
  memberId: string | null;
  amount: string;
  excludeExpenseId?: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!params.cashAdvanceId) {
    return { ok: true };
  }

  if (!params.memberId) {
    return { ok: false, message: MEMBER_MISMATCH_ERROR };
  }

  const allowed = await isCashAdvanceAllowedForExpense({
    advanceId: params.cashAdvanceId,
    memberId: params.memberId,
    expenseAmount: params.amount,
    excludeExpenseId: params.excludeExpenseId,
  });

  if (!allowed.ok) {
    if (allowed.reason === "member_mismatch") {
      return { ok: false, message: MEMBER_MISMATCH_ERROR };
    }

    return { ok: false, message: mapExpenseSaveError({ message: "EXPENSE_EXCEEDS_BALANCE" }) };
  }

  return { ok: true };
}

export async function createExpenseAction(
  _prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: mapExpenseSaveError(null) };
  }

  const values = parseExpenseForm(formData);
  const validated = validateExpenseForm(values);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const apartmentAllowed = await isApartmentAllowedForNewEntry(validated.data.apartment_id);
  if (!apartmentAllowed) {
    return { formError: mapExpenseSaveError(null), values: validated.data };
  }

  const memberId =
    validated.data.paid_by === "revex-direct" ? null : validated.data.paid_by;

  if (memberId) {
    const memberAllowed = await isOperationMemberAllowedForNewExpense(memberId);
    if (!memberAllowed) {
      return { formError: mapExpenseSaveError(null), values: validated.data };
    }
  }

  const normalized = normalizeExpenseInput(validated.data);
  const advanceCheck = await validateExpenseAdvanceLink({
    cashAdvanceId: normalized.cash_advance_id,
    memberId: normalized.paid_by_member_id,
    amount: normalized.amount,
  });

  if (!advanceCheck.ok) {
    return { formError: advanceCheck.message, values: validated.data };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { formError: mapExpenseSaveError(null), values: validated.data };
  }

  const payload = {
    ...normalized,
    receipt_path: null,
    created_by: user.id,
  };

  const { error } = await supabase.from("expenses").insert(payload);

  if (error) {
    return { formError: mapExpenseSaveError(error), values: validated.data };
  }

  revalidatePath("/income-expenses");
  revalidatePath("/cash-advances");
  revalidatePath("/my-cash-advances");
  revalidatePath("/my-expenses");
  redirect("/income-expenses");
}

export async function updateExpenseAction(
  expenseId: string,
  _prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: mapExpenseSaveError(null) };
  }

  const values = parseExpenseForm(formData);
  const validated = validateExpenseForm(values);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const supabase = await createServerSupabaseClient();
  const { data: existing, error: existingError } = await supabase
    .from("expenses")
    .select("apartment_id, paid_by_member_id")
    .eq("id", expenseId)
    .maybeSingle();

  if (existingError || !existing) {
    return { formError: mapExpenseSaveError(null), values: validated.data };
  }

  const apartmentAllowed = await isApartmentAllowedForAdminEdit(
    validated.data.apartment_id,
    existing.apartment_id,
  );

  if (!apartmentAllowed) {
    return { formError: mapExpenseSaveError(null), values: validated.data };
  }

  const memberId =
    validated.data.paid_by === "revex-direct" ? null : validated.data.paid_by;

  if (memberId) {
    const memberAllowed = await isOperationMemberAllowedForAdminEdit(
      memberId,
      existing.paid_by_member_id,
    );

    if (!memberAllowed) {
      return { formError: mapExpenseSaveError(null), values: validated.data };
    }
  }

  const normalized = normalizeExpenseInput(validated.data);
  const advanceCheck = await validateExpenseAdvanceLink({
    cashAdvanceId: normalized.cash_advance_id,
    memberId: normalized.paid_by_member_id,
    amount: normalized.amount,
    excludeExpenseId: expenseId,
  });

  if (!advanceCheck.ok) {
    return { formError: advanceCheck.message, values: validated.data };
  }

  const { error } = await supabase.from("expenses").update(normalized).eq("id", expenseId);

  if (error) {
    return { formError: mapExpenseSaveError(error), values: validated.data };
  }

  revalidatePath("/income-expenses");
  revalidatePath("/cash-advances");
  revalidatePath("/my-cash-advances");
  revalidatePath("/my-expenses");
  redirect("/income-expenses");
}

export async function createOperationExpenseAction(
  _prevState: OperationExpenseActionState,
  formData: FormData,
): Promise<OperationExpenseActionState> {
  const operation = await requireActiveOperationMember();
  if (!operation.ok) {
    return { formError: mapExpenseSaveError(null) };
  }

  const values = parseOperationExpenseForm(formData);
  const validated = validateOperationExpenseForm(values);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const apartmentAllowed = await isApartmentAllowedForNewEntry(validated.data.apartment_id);
  if (!apartmentAllowed) {
    return { formError: mapExpenseSaveError(null), values: validated.data };
  }

  const normalized = normalizeOperationExpenseInput(validated.data);
  const advanceCheck = await validateExpenseAdvanceLink({
    cashAdvanceId: normalized.cash_advance_id,
    memberId: operation.operationMemberId,
    amount: normalized.amount,
  });

  if (!advanceCheck.ok) {
    return { formError: advanceCheck.message, values: validated.data };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { formError: mapExpenseSaveError(null), values: validated.data };
  }

  const payload = {
    ...normalized,
    paid_by_member_id: operation.operationMemberId,
    receipt_path: null,
    created_by: user.id,
  };

  const { error } = await supabase.from("expenses").insert(payload);

  if (error) {
    return { formError: mapExpenseSaveError(error), values: validated.data };
  }

  revalidatePath("/my-expenses");
  revalidatePath("/my-cash-advances");
  revalidatePath("/cash-advances");
  redirect("/my-expenses");
}
