import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Expense,
  ExpenseListItem,
  OperationExpenseListItem,
  OperationMemberOption,
} from "@/lib/expenses/types";

type ExpenseRow = {
  id: string;
  amount: string;
  expense_date: string;
  category: string;
  description: string;
  created_at: string;
  paid_by_member_id: string | null;
  cash_advance_id: string | null;
  apartment: { name: string; unit_code: string | null } | { name: string; unit_code: string | null }[] | null;
  operation_members: { full_name: string } | { full_name: string }[] | null;
};

type OperationExpenseRow = {
  id: string;
  amount: string;
  expense_date: string;
  category: string;
  description: string;
  created_at: string;
  cash_advance_id: string | null;
  apartment: { name: string; unit_code: string | null } | { name: string; unit_code: string | null }[] | null;
};

function normalizeApartmentJoin(
  apartment: ExpenseRow["apartment"],
): ExpenseListItem["apartment"] {
  if (!apartment) {
    return { name: "—", unit_code: null };
  }

  if (Array.isArray(apartment)) {
    return apartment[0] ?? { name: "—", unit_code: null };
  }

  return apartment;
}

function normalizeMemberJoin(
  member: ExpenseRow["operation_members"],
): ExpenseListItem["operation_members"] {
  if (!member) {
    return null;
  }

  if (Array.isArray(member)) {
    return member[0] ?? null;
  }

  return member;
}

export async function fetchExpensesForAdmin(): Promise<ExpenseListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("expenses")
    .select(
      "id, amount, expense_date, category, description, created_at, paid_by_member_id, cash_advance_id, apartment:apartments(name, unit_code), operation_members(full_name)",
    )
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ExpenseRow[]).map((row) => ({
    id: row.id,
    amount: row.amount,
    expense_date: row.expense_date,
    category: row.category,
    description: row.description,
    created_at: row.created_at,
    paid_by_member_id: row.paid_by_member_id,
    cash_advance_id: row.cash_advance_id,
    apartment: normalizeApartmentJoin(row.apartment),
    operation_members: normalizeMemberJoin(row.operation_members),
  }));
}

export async function fetchExpenseById(id: string): Promise<Expense | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("expenses")
    .select(
      "id, apartment_id, paid_by_member_id, cash_advance_id, category, description, amount, expense_date, receipt_path, created_by, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Expense;
}

export async function fetchOwnExpensesForOperation(
  operationMemberId: string,
): Promise<OperationExpenseListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("expenses")
    .select(
      "id, amount, expense_date, category, description, created_at, cash_advance_id, apartment:apartments(name, unit_code)",
    )
    .eq("paid_by_member_id", operationMemberId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as OperationExpenseRow[]).map((row) => ({
    id: row.id,
    amount: row.amount,
    expense_date: row.expense_date,
    category: row.category,
    description: row.description,
    created_at: row.created_at,
    cash_advance_id: row.cash_advance_id,
    apartment: normalizeApartmentJoin(row.apartment),
  }));
}

export async function fetchActiveOperationMemberOptions(): Promise<OperationMemberOption[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("operation_members")
    .select("id, full_name")
    .eq("status", "active")
    .order("full_name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as OperationMemberOption[];
}

export async function fetchOperationMemberOptionsForEdit(
  currentMemberId: string | null,
): Promise<OperationMemberOption[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: activeMembers, error: activeError }, { data: currentMember, error: currentError }] =
    await Promise.all([
      supabase
        .from("operation_members")
        .select("id, full_name")
        .eq("status", "active")
        .order("full_name", { ascending: true }),
      currentMemberId
        ? supabase
            .from("operation_members")
            .select("id, full_name")
            .eq("id", currentMemberId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  if (activeError || currentError) {
    return [];
  }

  const options = (activeMembers ?? []) as OperationMemberOption[];

  if (
    currentMember &&
    !options.some((option) => option.id === currentMember.id)
  ) {
    options.push(currentMember as OperationMemberOption);
    options.sort((left, right) =>
      left.full_name.localeCompare(right.full_name, undefined, { sensitivity: "base" }),
    );
  }

  return options;
}

export async function isOperationMemberAllowedForNewExpense(
  memberId: string,
): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("operation_members")
    .select("id")
    .eq("id", memberId)
    .eq("status", "active")
    .maybeSingle();

  return !error && Boolean(data);
}

export async function isOperationMemberAllowedForAdminEdit(
  memberId: string,
  currentMemberId: string | null,
): Promise<boolean> {
  if (currentMemberId && memberId === currentMemberId) {
    return true;
  }

  return isOperationMemberAllowedForNewExpense(memberId);
}
