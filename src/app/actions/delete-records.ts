"use server";

import { revalidatePath } from "next/cache";
import { requireActiveAdmin } from "@/lib/auth/admin-page";
import { requireActiveOperationMember } from "@/lib/auth/operation-page";
import { mapDeleteError } from "@/lib/finance/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DeleteActionResult = { ok: true } | { ok: false; error: string };

const DELETE_ERROR = "Unable to delete this record. Please try again.";

async function runAdminDelete(
  rpcName:
    | "admin_delete_revenue"
    | "admin_delete_expense"
    | "admin_delete_advance_return"
    | "admin_delete_cash_advance"
    | "admin_delete_apartment"
    | "admin_delete_operation_member",
  recordId: string,
  paths: string[],
): Promise<DeleteActionResult> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { ok: false, error: DELETE_ERROR };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc(rpcName, { p_id: recordId });

  if (error) {
    return { ok: false, error: mapDeleteError(error) };
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return { ok: true };
}

export async function deleteRevenueAction(revenueId: string): Promise<DeleteActionResult> {
  return runAdminDelete("admin_delete_revenue", revenueId, ["/income-expenses", "/"]);
}

export async function deleteExpenseAction(expenseId: string): Promise<DeleteActionResult> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { ok: false, error: DELETE_ERROR };
  }

  const supabase = await createServerSupabaseClient();
  const { data: expense, error: lookupError } = await supabase
    .from("expenses")
    .select("cash_advance_id")
    .eq("id", expenseId)
    .maybeSingle();

  if (lookupError || !expense) {
    return { ok: false, error: DELETE_ERROR };
  }

  const paths = ["/income-expenses", "/cash-advances"];
  if (expense.cash_advance_id) {
    paths.push(`/cash-advances/${expense.cash_advance_id}`);
  }

  return runAdminDelete("admin_delete_expense", expenseId, paths);
}

export async function deleteAdvanceReturnAction(returnId: string): Promise<DeleteActionResult> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { ok: false, error: DELETE_ERROR };
  }

  const supabase = await createServerSupabaseClient();
  const { data: advanceReturn, error: lookupError } = await supabase
    .from("advance_returns")
    .select("cash_advance_id")
    .eq("id", returnId)
    .maybeSingle();

  if (lookupError || !advanceReturn) {
    return { ok: false, error: DELETE_ERROR };
  }

  const result = await runAdminDelete("admin_delete_advance_return", returnId, [
    "/cash-advances",
    `/cash-advances/${advanceReturn.cash_advance_id}`,
    "/",
  ]);

  return result;
}

export async function deleteCashAdvanceAction(advanceId: string): Promise<DeleteActionResult> {
  return runAdminDelete("admin_delete_cash_advance", advanceId, ["/cash-advances", "/"]);
}

export async function deleteApartmentAction(apartmentId: string): Promise<DeleteActionResult> {
  return runAdminDelete("admin_delete_apartment", apartmentId, ["/apartments", "/"]);
}

export async function deleteOperationMemberAction(memberId: string): Promise<DeleteActionResult> {
  return runAdminDelete("admin_delete_operation_member", memberId, ["/operation-team"]);
}

export async function deleteOperationExpenseAction(expenseId: string): Promise<DeleteActionResult> {
  const member = await requireActiveOperationMember();
  if (!member.ok) {
    return { ok: false, error: DELETE_ERROR };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("operation_delete_own_expense", { p_id: expenseId });

  if (error) {
    return { ok: false, error: mapDeleteError(error) };
  }

  revalidatePath("/my-expenses");
  revalidatePath("/");

  return { ok: true };
}
