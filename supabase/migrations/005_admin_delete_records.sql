BEGIN;

-- ---------------------------------------------------------------------------
-- Admin delete: revenue
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_delete_revenue(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  DELETE FROM public.revenues
  WHERE public.revenues.id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Admin delete: expense
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_delete_expense(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  DELETE FROM public.expenses
  WHERE public.expenses.id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Operation delete: own expense
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.operation_delete_own_expense(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id uuid;
BEGIN
  IF NOT public.is_active_operation_user() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  v_member_id := public.get_current_operation_member_id();

  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  DELETE FROM public.expenses
  WHERE public.expenses.id = p_id
    AND public.expenses.paid_by_member_id = v_member_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Admin delete: advance return
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_delete_advance_return(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  DELETE FROM public.advance_returns
  WHERE public.advance_returns.id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Admin delete: cash advance
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_delete_cash_advance(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.expenses
    WHERE public.expenses.cash_advance_id = p_id
  ) OR EXISTS (
    SELECT 1
    FROM public.advance_returns
    WHERE public.advance_returns.cash_advance_id = p_id
  ) THEN
    RAISE EXCEPTION 'DELETE_BLOCKED_REFERENCES';
  END IF;

  DELETE FROM public.cash_advances
  WHERE public.cash_advances.id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Admin delete: apartment
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_delete_apartment(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.revenues
    WHERE public.revenues.apartment_id = p_id
  ) OR EXISTS (
    SELECT 1
    FROM public.expenses
    WHERE public.expenses.apartment_id = p_id
  ) THEN
    RAISE EXCEPTION 'DELETE_BLOCKED_REFERENCES';
  END IF;

  DELETE FROM public.apartments
  WHERE public.apartments.id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Admin delete: operation member
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_delete_operation_member(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.cash_advances
    WHERE public.cash_advances.operation_member_id = p_id
  ) OR EXISTS (
    SELECT 1
    FROM public.expenses
    WHERE public.expenses.paid_by_member_id = p_id
  ) THEN
    RAISE EXCEPTION 'DELETE_BLOCKED_REFERENCES';
  END IF;

  DELETE FROM public.operation_members
  WHERE public.operation_members.id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Execution grants
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.admin_delete_revenue(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_expense(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.operation_delete_own_expense(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_advance_return(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_cash_advance(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_apartment(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_operation_member(uuid) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.admin_delete_revenue(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.admin_delete_expense(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.operation_delete_own_expense(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.admin_delete_advance_return(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.admin_delete_cash_advance(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.admin_delete_apartment(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.admin_delete_operation_member(uuid) FROM anon;

GRANT EXECUTE ON FUNCTION public.admin_delete_revenue(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_expense(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.operation_delete_own_expense(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_advance_return(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_cash_advance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_apartment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_operation_member(uuid) TO authenticated;

COMMIT;
