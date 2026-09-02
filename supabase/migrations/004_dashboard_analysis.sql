BEGIN;

-- ---------------------------------------------------------------------------
-- Admin period summary
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_period_summary(
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE (
  total_revenue numeric(12, 2),
  total_expenses numeric(12, 2),
  net_profit numeric(12, 2)
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_revenue numeric(12, 2);
  v_expenses numeric(12, 2);
BEGIN
  IF NOT public.is_active_admin() THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(public.revenues.amount), 0::numeric(12, 2))
  INTO v_revenue
  FROM public.revenues
  WHERE (p_start_date IS NULL OR public.revenues.revenue_date >= p_start_date)
    AND (p_end_date IS NULL OR public.revenues.revenue_date < p_end_date);

  SELECT COALESCE(SUM(public.expenses.amount), 0::numeric(12, 2))
  INTO v_expenses
  FROM public.expenses
  WHERE (p_start_date IS NULL OR public.expenses.expense_date >= p_start_date)
    AND (p_end_date IS NULL OR public.expenses.expense_date < p_end_date);

  RETURN QUERY
  SELECT
    v_revenue,
    v_expenses,
    v_revenue - v_expenses;
END;
$$;

-- ---------------------------------------------------------------------------
-- Admin apartment profit/loss
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_apartment_profit_loss(
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE (
  apartment_id uuid,
  apartment_name text,
  unit_code text,
  apartment_status text,
  total_revenue numeric(12, 2),
  total_expenses numeric(12, 2),
  net_profit numeric(12, 2)
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    public.apartments.id,
    public.apartments.name,
    public.apartments.unit_code,
    public.apartments.status,
    COALESCE(rev.total_revenue, 0::numeric(12, 2)),
    COALESCE(exp.total_expenses, 0::numeric(12, 2)),
    COALESCE(rev.total_revenue, 0::numeric(12, 2)) - COALESCE(exp.total_expenses, 0::numeric(12, 2))
  FROM public.apartments
  LEFT JOIN (
    SELECT
      public.revenues.apartment_id,
      SUM(public.revenues.amount) AS total_revenue
    FROM public.revenues
    WHERE (p_start_date IS NULL OR public.revenues.revenue_date >= p_start_date)
      AND (p_end_date IS NULL OR public.revenues.revenue_date < p_end_date)
    GROUP BY public.revenues.apartment_id
  ) rev ON rev.apartment_id = public.apartments.id
  LEFT JOIN (
    SELECT
      public.expenses.apartment_id,
      SUM(public.expenses.amount) AS total_expenses
    FROM public.expenses
    WHERE (p_start_date IS NULL OR public.expenses.expense_date >= p_start_date)
      AND (p_end_date IS NULL OR public.expenses.expense_date < p_end_date)
    GROUP BY public.expenses.apartment_id
  ) exp ON exp.apartment_id = public.apartments.id
  ORDER BY
    COALESCE(rev.total_revenue, 0::numeric(12, 2)) - COALESCE(exp.total_expenses, 0::numeric(12, 2)) DESC,
    public.apartments.name ASC;
END;
$$;

-- ---------------------------------------------------------------------------
-- Admin monthly profit/loss
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_monthly_profit_loss(
  p_start_month date,
  p_end_date date
)
RETURNS TABLE (
  month_start date,
  total_revenue numeric(12, 2),
  total_expenses numeric(12, 2),
  net_profit numeric(12, 2)
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', p_start_month::timestamp)::date,
      date_trunc('month', (p_end_date - interval '1 day'))::date,
      interval '1 month'
    )::date AS month_start
  ),
  revenue_by_month AS (
    SELECT
      date_trunc('month', public.revenues.revenue_date::timestamp)::date AS month_start,
      SUM(public.revenues.amount) AS total_revenue
    FROM public.revenues
    WHERE public.revenues.revenue_date >= p_start_month
      AND public.revenues.revenue_date < p_end_date
    GROUP BY 1
  ),
  expenses_by_month AS (
    SELECT
      date_trunc('month', public.expenses.expense_date::timestamp)::date AS month_start,
      SUM(public.expenses.amount) AS total_expenses
    FROM public.expenses
    WHERE public.expenses.expense_date >= p_start_month
      AND public.expenses.expense_date < p_end_date
    GROUP BY 1
  )
  SELECT
    months.month_start,
    COALESCE(revenue_by_month.total_revenue, 0::numeric(12, 2)),
    COALESCE(expenses_by_month.total_expenses, 0::numeric(12, 2)),
    COALESCE(revenue_by_month.total_revenue, 0::numeric(12, 2))
      - COALESCE(expenses_by_month.total_expenses, 0::numeric(12, 2))
  FROM months
  LEFT JOIN revenue_by_month ON revenue_by_month.month_start = months.month_start
  LEFT JOIN expenses_by_month ON expenses_by_month.month_start = months.month_start
  ORDER BY months.month_start DESC;
END;
$$;

-- ---------------------------------------------------------------------------
-- Operation personal dashboard summary
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.operation_dashboard_summary(
  p_month_start date,
  p_next_month_start date
)
RETURNS TABLE (
  own_expenses_current_month numeric(12, 2),
  total_advances_received numeric(12, 2),
  expenses_deducted_from_advances numeric(12, 2),
  remaining_advance_balance numeric(12, 2)
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_member_id uuid;
BEGIN
  IF NOT public.is_active_operation_user() THEN
    RETURN;
  END IF;

  v_member_id := public.get_current_operation_member_id();

  IF v_member_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    COALESCE((
      SELECT SUM(public.expenses.amount)
      FROM public.expenses
      WHERE public.expenses.paid_by_member_id = v_member_id
        AND public.expenses.expense_date >= p_month_start
        AND public.expenses.expense_date < p_next_month_start
    ), 0::numeric(12, 2)),
    COALESCE((
      SELECT SUM(public.cash_advances.amount)
      FROM public.cash_advances
      WHERE public.cash_advances.operation_member_id = v_member_id
    ), 0::numeric(12, 2)),
    COALESCE((
      SELECT public.operation_member_advance_summary.total_expenses_paid_from_advances
      FROM public.operation_member_advance_summary
      WHERE public.operation_member_advance_summary.operation_member_id = v_member_id
    ), 0::numeric(12, 2)),
    COALESCE((
      SELECT public.operation_member_advance_summary.remaining_balance
      FROM public.operation_member_advance_summary
      WHERE public.operation_member_advance_summary.operation_member_id = v_member_id
    ), 0::numeric(12, 2));
END;
$$;

-- ---------------------------------------------------------------------------
-- Execution grants
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.admin_period_summary(date, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_apartment_profit_loss(date, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_monthly_profit_loss(date, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.operation_dashboard_summary(date, date) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.admin_period_summary(date, date) FROM anon;
REVOKE ALL ON FUNCTION public.admin_apartment_profit_loss(date, date) FROM anon;
REVOKE ALL ON FUNCTION public.admin_monthly_profit_loss(date, date) FROM anon;
REVOKE ALL ON FUNCTION public.operation_dashboard_summary(date, date) FROM anon;

GRANT EXECUTE ON FUNCTION public.admin_period_summary(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_apartment_profit_loss(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_monthly_profit_loss(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.operation_dashboard_summary(date, date) TO authenticated;

COMMIT;
