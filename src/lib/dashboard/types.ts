export type AdminPeriodSummary = {
  total_revenue: string;
  total_expenses: string;
  net_profit: string;
};

export type ApartmentPerformanceRow = {
  apartment_id: string;
  apartment_name: string;
  unit_code: string | null;
  apartment_status: string;
  total_revenue: string;
  total_expenses: string;
  net_profit: string;
};

export type MonthlyPerformanceRow = {
  month_start: string;
  total_revenue: string;
  total_expenses: string;
  net_profit: string;
};

export type OperationDashboardSummary = {
  own_expenses_current_month: string;
  total_advances_received: string;
  expenses_deducted_from_advances: string;
  remaining_advance_balance: string;
};
