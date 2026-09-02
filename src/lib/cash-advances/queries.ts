import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isPositiveBalance, sumAmounts } from "@/lib/finance/balance";
import type {
  AdvanceReturn,
  CashAdvance,
  CashAdvanceBalance,
  CashAdvanceListItem,
  CashAdvanceOption,
  CashAdvanceSummary,
  LinkedAdvanceExpense,
  OperationCashAdvanceListItem,
  OperationCashAdvanceSummary,
} from "@/lib/cash-advances/types";

function mapBalanceRow(row: Record<string, unknown>): CashAdvanceBalance {
  return {
    cash_advance_id: String(row.cash_advance_id),
    operation_member_id: String(row.operation_member_id),
    operation_member_name: String(row.operation_member_name),
    issued_date: String(row.issued_date),
    issued_amount: String(row.issued_amount),
    total_linked_expenses: String(row.total_linked_expenses),
    total_returned: String(row.total_returned),
    remaining_balance: String(row.remaining_balance),
  };
}

export async function fetchCashAdvancesForAdmin(): Promise<CashAdvanceListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data: balances, error: balanceError } = await supabase
    .from("cash_advance_balance_details")
    .select("*");

  if (balanceError || !balances) {
    return [];
  }

  const { data: advances, error: advanceError } = await supabase
    .from("cash_advances")
    .select("id, created_at, issued_date")
    .order("issued_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (advanceError || !advances) {
    return [];
  }

  const createdAtById = new Map(advances.map((advance) => [advance.id, advance.created_at]));
  const issuedDateById = new Map(advances.map((advance) => [advance.id, advance.issued_date]));

  return balances
    .map((row) => {
      const balance = mapBalanceRow(row);
      return {
        ...balance,
        created_at: createdAtById.get(balance.cash_advance_id) ?? "",
        issued_date: issuedDateById.get(balance.cash_advance_id) ?? balance.issued_date,
      };
    })
    .sort((left, right) => {
      if (left.issued_date !== right.issued_date) {
        return right.issued_date.localeCompare(left.issued_date);
      }

      return right.created_at.localeCompare(left.created_at);
    });
}

export function buildCashAdvanceSummary(items: CashAdvanceBalance[]): CashAdvanceSummary {
  return {
    totalIssued: sumAmounts(items.map((item) => item.issued_amount)),
    totalSpent: sumAmounts(items.map((item) => item.total_linked_expenses)),
    totalReturned: sumAmounts(items.map((item) => item.total_returned)),
    outstandingBalance: sumAmounts(items.map((item) => item.remaining_balance)),
  };
}

export async function fetchCashAdvanceById(id: string): Promise<CashAdvance | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("cash_advances")
    .select("id, operation_member_id, amount, issued_date, notes, created_by, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CashAdvance;
}

export async function fetchCashAdvanceBalanceById(
  id: string,
): Promise<CashAdvanceBalance | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("cash_advance_balance_details")
    .select("*")
    .eq("cash_advance_id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapBalanceRow(data);
}

export async function fetchLinkedExpensesForAdvance(
  advanceId: string,
): Promise<LinkedAdvanceExpense[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("expenses")
    .select(
      "id, expense_date, amount, category, description, apartment:apartments(name, unit_code)",
    )
    .eq("cash_advance_id", advanceId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => {
    const apartment = Array.isArray(row.apartment) ? row.apartment[0] : row.apartment;
    return {
      id: row.id,
      expense_date: row.expense_date,
      amount: row.amount,
      category: row.category,
      description: row.description,
      apartment: apartment ?? { name: "—", unit_code: null },
    };
  }) as LinkedAdvanceExpense[];
}

export async function fetchReturnsForAdvance(advanceId: string): Promise<AdvanceReturn[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("advance_returns")
    .select("id, cash_advance_id, amount, return_date, notes, created_by, created_at")
    .eq("cash_advance_id", advanceId)
    .order("return_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as AdvanceReturn[];
}

export async function fetchAdvanceReturnById(
  advanceId: string,
  returnId: string,
): Promise<AdvanceReturn | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("advance_returns")
    .select("id, cash_advance_id, amount, return_date, notes, created_by, created_at")
    .eq("id", returnId)
    .eq("cash_advance_id", advanceId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as AdvanceReturn;
}

export async function advanceHasTransactions(advanceId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const [{ count: expenseCount }, { count: returnCount }] = await Promise.all([
    supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("cash_advance_id", advanceId),
    supabase
      .from("advance_returns")
      .select("id", { count: "exact", head: true })
      .eq("cash_advance_id", advanceId),
  ]);

  return (expenseCount ?? 0) > 0 || (returnCount ?? 0) > 0;
}

export async function fetchCashAdvanceOptionsForMember(
  memberId: string,
  currentAdvanceId?: string | null,
): Promise<CashAdvanceOption[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("cash_advance_balance_details")
    .select("cash_advance_id, issued_date, remaining_balance")
    .eq("operation_member_id", memberId);

  if (error || !data) {
    return [];
  }

  const options = data
    .filter(
      (row) =>
        isPositiveBalance(String(row.remaining_balance)) ||
        row.cash_advance_id === currentAdvanceId,
    )
    .map((row) => ({
      id: String(row.cash_advance_id),
      issued_date: String(row.issued_date),
      remaining_balance: String(row.remaining_balance),
    }))
    .sort((left, right) => right.issued_date.localeCompare(left.issued_date));

  return options;
}

export async function fetchAllCashAdvanceOptionsForAdmin(): Promise<
  Record<string, CashAdvanceOption[]>
> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("cash_advance_balance_details")
    .select("cash_advance_id, operation_member_id, issued_date, remaining_balance");

  if (error || !data) {
    return {};
  }

  const grouped: Record<string, CashAdvanceOption[]> = {};

  for (const row of data) {
    const remaining = String(row.remaining_balance);
    if (!isPositiveBalance(remaining)) {
      continue;
    }

    const memberId = String(row.operation_member_id);
    const option: CashAdvanceOption = {
      id: String(row.cash_advance_id),
      issued_date: String(row.issued_date),
      remaining_balance: String(row.remaining_balance),
    };

    if (!grouped[memberId]) {
      grouped[memberId] = [];
    }

    grouped[memberId].push(option);
  }

  for (const memberId of Object.keys(grouped)) {
    grouped[memberId].sort((left, right) => right.issued_date.localeCompare(left.issued_date));
  }

  return grouped;
}

export async function fetchOwnCashAdvancesForOperation(
  operationMemberId: string,
): Promise<OperationCashAdvanceListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("cash_advance_balance_details")
    .select(
      "cash_advance_id, issued_date, issued_amount, total_linked_expenses, total_returned, remaining_balance",
    )
    .eq("operation_member_id", operationMemberId)
    .order("issued_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    cash_advance_id: String(row.cash_advance_id),
    issued_date: String(row.issued_date),
    issued_amount: String(row.issued_amount),
    total_linked_expenses: String(row.total_linked_expenses),
    total_returned: String(row.total_returned),
    remaining_balance: String(row.remaining_balance),
  }));
}

export async function fetchOperationCashAdvanceSummary(
  operationMemberId: string,
): Promise<OperationCashAdvanceSummary> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("operation_member_advance_summary")
    .select(
      "total_advances_issued, total_expenses_paid_from_advances, total_returned, remaining_balance",
    )
    .eq("operation_member_id", operationMemberId)
    .maybeSingle();

  if (error || !data) {
    return {
      totalIssued: "0.00",
      totalSpent: "0.00",
      totalReturned: "0.00",
      remainingBalance: "0.00",
    };
  }

  return {
    totalIssued: String(data.total_advances_issued),
    totalSpent: String(data.total_expenses_paid_from_advances),
    totalReturned: String(data.total_returned),
    remainingBalance: String(data.remaining_balance),
  };
}

export async function isCashAdvanceAllowedForExpense(params: {
  advanceId: string;
  memberId: string;
  expenseAmount: string;
  excludeExpenseId?: string;
}): Promise<{ ok: true } | { ok: false; reason: "not_found" | "member_mismatch" | "exceeds_balance" }> {
  const supabase = await createServerSupabaseClient();

  const { data: balance, error } = await supabase
    .from("cash_advance_balance_details")
    .select("*")
    .eq("cash_advance_id", params.advanceId)
    .maybeSingle();

  if (error || !balance) {
    return { ok: false, reason: "not_found" };
  }

  if (String(balance.operation_member_id) !== params.memberId) {
    return { ok: false, reason: "member_mismatch" };
  }

  let available = String(balance.remaining_balance);

  if (params.excludeExpenseId) {
    const { data: existingExpense } = await supabase
      .from("expenses")
      .select("amount, cash_advance_id")
      .eq("id", params.excludeExpenseId)
      .maybeSingle();

    if (
      existingExpense?.cash_advance_id === params.advanceId &&
      typeof existingExpense.amount === "string"
    ) {
      available = sumAmounts([available, existingExpense.amount]);
    }
  }

  if (toCentsSafe(params.expenseAmount) > toCentsSafe(available)) {
    return { ok: false, reason: "exceeds_balance" };
  }

  return { ok: true };
}

function toCentsSafe(amount: string): number {
  const [wholePart, fractionPart = ""] = amount.split(".");
  const whole = Number(wholePart);
  const fraction = Number((fractionPart + "00").slice(0, 2));
  return whole * 100 + fraction;
}
