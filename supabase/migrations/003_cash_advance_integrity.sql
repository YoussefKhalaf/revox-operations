BEGIN;

-- ---------------------------------------------------------------------------
-- Expense cash-advance capacity (replaces basic ownership check)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_expense_cash_advance()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_advance_amount numeric(12, 2);
  v_operation_member_id uuid;
  v_linked_expenses numeric(12, 2);
  v_returned numeric(12, 2);
  v_available numeric(12, 2);
BEGIN
  IF NEW.cash_advance_id IS NOT NULL THEN
    IF NEW.paid_by_member_id IS NULL THEN
      RAISE EXCEPTION 'EXPENSE_MEMBER_REQUIRED';
    END IF;

    SELECT ca.amount, ca.operation_member_id
    INTO v_advance_amount, v_operation_member_id
    FROM public.cash_advances ca
    WHERE ca.id = NEW.cash_advance_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'ADVANCE_NOT_FOUND';
    END IF;

    IF v_operation_member_id <> NEW.paid_by_member_id THEN
      RAISE EXCEPTION 'ADVANCE_MEMBER_MISMATCH';
    END IF;

    SELECT COALESCE(SUM(e.amount), 0::numeric(12, 2))
    INTO v_linked_expenses
    FROM public.expenses e
    WHERE e.cash_advance_id = NEW.cash_advance_id
      AND (TG_OP = 'INSERT' OR e.id <> NEW.id);

    SELECT COALESCE(SUM(ar.amount), 0::numeric(12, 2))
    INTO v_returned
    FROM public.advance_returns ar
    WHERE ar.cash_advance_id = NEW.cash_advance_id;

    v_available := v_advance_amount - v_linked_expenses - v_returned;

    IF NEW.amount > v_available THEN
      RAISE EXCEPTION 'EXPENSE_EXCEEDS_BALANCE';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_expense_cash_advance ON public.expenses;
CREATE TRIGGER validate_expense_cash_advance
  BEFORE INSERT OR UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_expense_cash_advance();

-- ---------------------------------------------------------------------------
-- Advance return capacity
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_advance_return_capacity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_advance_amount numeric(12, 2);
  v_linked_expenses numeric(12, 2);
  v_other_returns numeric(12, 2);
  v_available numeric(12, 2);
BEGIN
  SELECT ca.amount
  INTO v_advance_amount
  FROM public.cash_advances ca
  WHERE ca.id = NEW.cash_advance_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ADVANCE_NOT_FOUND';
  END IF;

  SELECT COALESCE(SUM(e.amount), 0::numeric(12, 2))
  INTO v_linked_expenses
  FROM public.expenses e
  WHERE e.cash_advance_id = NEW.cash_advance_id;

  SELECT COALESCE(SUM(ar.amount), 0::numeric(12, 2))
  INTO v_other_returns
  FROM public.advance_returns ar
  WHERE ar.cash_advance_id = NEW.cash_advance_id
    AND (TG_OP = 'INSERT' OR ar.id <> NEW.id);

  v_available := v_advance_amount - v_linked_expenses - v_other_returns;

  IF NEW.amount > v_available THEN
    RAISE EXCEPTION 'RETURN_EXCEEDS_BALANCE';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_advance_return_capacity ON public.advance_returns;
CREATE TRIGGER validate_advance_return_capacity
  BEFORE INSERT OR UPDATE ON public.advance_returns
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_advance_return_capacity();

-- ---------------------------------------------------------------------------
-- Cash advance update constraints
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_cash_advance_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_linked_expenses numeric(12, 2);
  v_returned numeric(12, 2);
  v_min_amount numeric(12, 2);
BEGIN
  SELECT COALESCE(SUM(e.amount), 0::numeric(12, 2))
  INTO v_linked_expenses
  FROM public.expenses e
  WHERE e.cash_advance_id = OLD.id;

  SELECT COALESCE(SUM(ar.amount), 0::numeric(12, 2))
  INTO v_returned
  FROM public.advance_returns ar
  WHERE ar.cash_advance_id = OLD.id;

  v_min_amount := v_linked_expenses + v_returned;

  IF NEW.amount < v_min_amount THEN
    RAISE EXCEPTION 'ADVANCE_AMOUNT_TOO_LOW';
  END IF;

  IF (v_linked_expenses > 0 OR v_returned > 0) AND NEW.operation_member_id <> OLD.operation_member_id THEN
    RAISE EXCEPTION 'ADVANCE_MEMBER_LOCKED';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_cash_advance_update ON public.cash_advances;
CREATE TRIGGER validate_cash_advance_update
  BEFORE UPDATE ON public.cash_advances
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_cash_advance_update();

-- ---------------------------------------------------------------------------
-- Replace FOR ALL admin policies with SELECT/INSERT/UPDATE only
-- ---------------------------------------------------------------------------

-- operation_members
DROP POLICY IF EXISTS operation_members_admin_all ON public.operation_members;
DROP POLICY IF EXISTS operation_members_admin_select ON public.operation_members;
DROP POLICY IF EXISTS operation_members_admin_insert ON public.operation_members;
DROP POLICY IF EXISTS operation_members_admin_update ON public.operation_members;
CREATE POLICY operation_members_admin_select ON public.operation_members
  FOR SELECT TO authenticated
  USING (public.is_active_admin());
CREATE POLICY operation_members_admin_insert ON public.operation_members
  FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());
CREATE POLICY operation_members_admin_update ON public.operation_members
  FOR UPDATE TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- apartments
DROP POLICY IF EXISTS apartments_admin_all ON public.apartments;
DROP POLICY IF EXISTS apartments_admin_select ON public.apartments;
DROP POLICY IF EXISTS apartments_admin_insert ON public.apartments;
DROP POLICY IF EXISTS apartments_admin_update ON public.apartments;
CREATE POLICY apartments_admin_select ON public.apartments
  FOR SELECT TO authenticated
  USING (public.is_active_admin());
CREATE POLICY apartments_admin_insert ON public.apartments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());
CREATE POLICY apartments_admin_update ON public.apartments
  FOR UPDATE TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- revenues
DROP POLICY IF EXISTS revenues_admin_all ON public.revenues;
DROP POLICY IF EXISTS revenues_admin_select ON public.revenues;
DROP POLICY IF EXISTS revenues_admin_insert ON public.revenues;
DROP POLICY IF EXISTS revenues_admin_update ON public.revenues;
CREATE POLICY revenues_admin_select ON public.revenues
  FOR SELECT TO authenticated
  USING (public.is_active_admin());
CREATE POLICY revenues_admin_insert ON public.revenues
  FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());
CREATE POLICY revenues_admin_update ON public.revenues
  FOR UPDATE TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- expenses
DROP POLICY IF EXISTS expenses_admin_all ON public.expenses;
DROP POLICY IF EXISTS expenses_admin_select ON public.expenses;
DROP POLICY IF EXISTS expenses_admin_insert ON public.expenses;
DROP POLICY IF EXISTS expenses_admin_update ON public.expenses;
CREATE POLICY expenses_admin_select ON public.expenses
  FOR SELECT TO authenticated
  USING (public.is_active_admin());
CREATE POLICY expenses_admin_insert ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());
CREATE POLICY expenses_admin_update ON public.expenses
  FOR UPDATE TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- cash_advances
DROP POLICY IF EXISTS cash_advances_admin_all ON public.cash_advances;
DROP POLICY IF EXISTS cash_advances_admin_select ON public.cash_advances;
DROP POLICY IF EXISTS cash_advances_admin_insert ON public.cash_advances;
DROP POLICY IF EXISTS cash_advances_admin_update ON public.cash_advances;
CREATE POLICY cash_advances_admin_select ON public.cash_advances
  FOR SELECT TO authenticated
  USING (public.is_active_admin());
CREATE POLICY cash_advances_admin_insert ON public.cash_advances
  FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());
CREATE POLICY cash_advances_admin_update ON public.cash_advances
  FOR UPDATE TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- advance_returns
DROP POLICY IF EXISTS advance_returns_admin_all ON public.advance_returns;
DROP POLICY IF EXISTS advance_returns_admin_select ON public.advance_returns;
DROP POLICY IF EXISTS advance_returns_admin_insert ON public.advance_returns;
DROP POLICY IF EXISTS advance_returns_admin_update ON public.advance_returns;
CREATE POLICY advance_returns_admin_select ON public.advance_returns
  FOR SELECT TO authenticated
  USING (public.is_active_admin());
CREATE POLICY advance_returns_admin_insert ON public.advance_returns
  FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());
CREATE POLICY advance_returns_admin_update ON public.advance_returns
  FOR UPDATE TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- ---------------------------------------------------------------------------
-- Revoke authenticated DELETE on business records
-- ---------------------------------------------------------------------------

REVOKE DELETE ON public.operation_members FROM authenticated;
REVOKE DELETE ON public.apartments FROM authenticated;
REVOKE DELETE ON public.revenues FROM authenticated;
REVOKE DELETE ON public.expenses FROM authenticated;
REVOKE DELETE ON public.cash_advances FROM authenticated;
REVOKE DELETE ON public.advance_returns FROM authenticated;

COMMIT;
