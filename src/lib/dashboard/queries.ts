import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sumAmounts } from "@/lib/finance/balance";
import type {
  AdminPeriodSummary,
  ApartmentPerformanceRow,
  MonthlyPerformanceRow,
  OperationDashboardSummary,
} from "@/lib/dashboard/types";

function asAmount(value: unknown): string {
  if (value === null || value === undefined) {
    return "0.00";
  }

  return String(value);
}

export async function fetchAdminPeriodSummary(
  startDate: string | null,
  endDate: string | null,
): Promise<AdminPeriodSummary | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc("admin_period_summary", {
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  const row = data[0];

  return {
    total_revenue: asAmount(row.total_revenue),
    total_expenses: asAmount(row.total_expenses),
    net_profit: asAmount(row.net_profit),
  };
}

export async function fetchAdminApartmentPerformance(
  startDate: string | null,
  endDate: string | null,
): Promise<ApartmentPerformanceRow[] | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc("admin_apartment_profit_loss", {
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error || !data) {
    return null;
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    apartment_id: String(row.apartment_id),
    apartment_name: String(row.apartment_name),
    unit_code: row.unit_code ? String(row.unit_code) : null,
    apartment_status: String(row.apartment_status),
    total_revenue: asAmount(row.total_revenue),
    total_expenses: asAmount(row.total_expenses),
    net_profit: asAmount(row.net_profit),
  }));
}

export async function fetchAdminMonthlyPerformance(
  startMonth: string,
  endDate: string,
): Promise<MonthlyPerformanceRow[] | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc("admin_monthly_profit_loss", {
    p_start_month: startMonth,
    p_end_date: endDate,
  });

  if (error || !data) {
    return null;
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    month_start: String(row.month_start),
    total_revenue: asAmount(row.total_revenue),
    total_expenses: asAmount(row.total_expenses),
    net_profit: asAmount(row.net_profit),
  }));
}

export async function fetchOutstandingAdvanceBalance(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("cash_advance_balance_details")
    .select("remaining_balance");

  if (error || !data) {
    return null;
  }

  return sumAmounts(data.map((row) => asAmount(row.remaining_balance)));
}

export async function fetchOperationDashboardSummary(
  monthStart: string,
  nextMonthStart: string,
): Promise<OperationDashboardSummary | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc("operation_dashboard_summary", {
    p_month_start: monthStart,
    p_next_month_start: nextMonthStart,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  const row = data[0];

  return {
    own_expenses_current_month: asAmount(row.own_expenses_current_month),
    total_advances_received: asAmount(row.total_advances_received),
    expenses_deducted_from_advances: asAmount(row.expenses_deducted_from_advances),
    remaining_advance_balance: asAmount(row.remaining_advance_balance),
  };
}
