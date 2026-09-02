-- REVOX Operations — initial schema, views, and RLS
-- Apply through the Supabase SQL Editor or Supabase CLI.

BEGIN;

-- ---------------------------------------------------------------------------
-- Helper functions (no table dependencies)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'operation',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_full_name_not_blank CHECK (length(trim(full_name)) > 0),
  CONSTRAINT profiles_role_valid CHECK (role IN ('admin', 'operation'))
);

CREATE TABLE IF NOT EXISTS public.operation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NULL REFERENCES public.profiles (id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text NULL,
  email text NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT operation_members_full_name_not_blank CHECK (length(trim(full_name)) > 0),
  CONSTRAINT operation_members_status_valid CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE IF NOT EXISTS public.apartments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit_code text NULL,
  address text NULL,
  status text NOT NULL DEFAULT 'active',
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT apartments_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT apartments_status_valid CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE IF NOT EXISTS public.revenues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES public.apartments (id) ON DELETE RESTRICT,
  amount numeric(12, 2) NOT NULL,
  revenue_date date NOT NULL,
  source text NULL,
  description text NULL,
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT revenues_amount_positive CHECK (amount > 0)
);

CREATE TABLE IF NOT EXISTS public.cash_advances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_member_id uuid NOT NULL REFERENCES public.operation_members (id) ON DELETE RESTRICT,
  amount numeric(12, 2) NOT NULL,
  issued_date date NOT NULL,
  notes text NULL,
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cash_advances_amount_positive CHECK (amount > 0)
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES public.apartments (id) ON DELETE RESTRICT,
  paid_by_member_id uuid NULL REFERENCES public.operation_members (id) ON DELETE RESTRICT,
  cash_advance_id uuid NULL REFERENCES public.cash_advances (id) ON DELETE RESTRICT,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  expense_date date NOT NULL,
  receipt_path text NULL,
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT expenses_amount_positive CHECK (amount > 0),
  CONSTRAINT expenses_category_not_blank CHECK (length(trim(category)) > 0),
  CONSTRAINT expenses_description_not_blank CHECK (length(trim(description)) > 0),
  CONSTRAINT expenses_cash_advance_requires_member CHECK (
    cash_advance_id IS NULL OR paid_by_member_id IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS public.advance_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_advance_id uuid NOT NULL REFERENCES public.cash_advances (id) ON DELETE RESTRICT,
  amount numeric(12, 2) NOT NULL,
  return_date date NOT NULL,
  notes text NULL,
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT advance_returns_amount_positive CHECK (amount > 0)
);

-- ---------------------------------------------------------------------------
-- Role helper functions (require tables above)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_operation_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'operation'
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_operation_member_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.operation_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- Updated-at triggers
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_operation_members_updated_at ON public.operation_members;
CREATE TRIGGER set_operation_members_updated_at
  BEFORE UPDATE ON public.operation_members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_apartments_updated_at ON public.apartments;
CREATE TRIGGER set_apartments_updated_at
  BEFORE UPDATE ON public.apartments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth signup profile trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), NEW.email, 'Unknown'),
    'operation'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Expense cash-advance validation trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_expense_cash_advance()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.cash_advance_id IS NOT NULL THEN
    IF NEW.paid_by_member_id IS NULL THEN
      RAISE EXCEPTION 'paid_by_member_id is required when cash_advance_id is set';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.cash_advances ca
      WHERE ca.id = NEW.cash_advance_id
        AND ca.operation_member_id = NEW.paid_by_member_id
    ) THEN
      RAISE EXCEPTION 'cash advance does not belong to the selected operation member';
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
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_operation_members_user_id
  ON public.operation_members (user_id);

CREATE INDEX IF NOT EXISTS idx_revenues_apartment_id
  ON public.revenues (apartment_id);

CREATE INDEX IF NOT EXISTS idx_revenues_revenue_date
  ON public.revenues (revenue_date);

CREATE INDEX IF NOT EXISTS idx_expenses_apartment_id
  ON public.expenses (apartment_id);

CREATE INDEX IF NOT EXISTS idx_expenses_paid_by_member_id
  ON public.expenses (paid_by_member_id);

CREATE INDEX IF NOT EXISTS idx_expenses_cash_advance_id
  ON public.expenses (cash_advance_id);

CREATE INDEX IF NOT EXISTS idx_expenses_expense_date
  ON public.expenses (expense_date);

CREATE INDEX IF NOT EXISTS idx_cash_advances_operation_member_id
  ON public.cash_advances (operation_member_id);

CREATE INDEX IF NOT EXISTS idx_cash_advances_issued_date
  ON public.cash_advances (issued_date);

CREATE INDEX IF NOT EXISTS idx_advance_returns_cash_advance_id
  ON public.advance_returns (cash_advance_id);

CREATE INDEX IF NOT EXISTS idx_advance_returns_return_date
  ON public.advance_returns (return_date);

-- ---------------------------------------------------------------------------
-- Financial views (security invoker — RLS on base tables applies)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.apartment_financial_summary
WITH (security_invoker = true)
AS
SELECT
  a.id AS apartment_id,
  a.name AS apartment_name,
  COALESCE(rev.total_revenue, 0::numeric(12, 2)) AS total_revenue,
  COALESCE(exp.total_expenses, 0::numeric(12, 2)) AS total_expenses,
  COALESCE(rev.total_revenue, 0::numeric(12, 2)) - COALESCE(exp.total_expenses, 0::numeric(12, 2)) AS net_profit
FROM public.apartments a
LEFT JOIN (
  SELECT apartment_id, SUM(amount) AS total_revenue
  FROM public.revenues
  GROUP BY apartment_id
) rev ON rev.apartment_id = a.id
LEFT JOIN (
  SELECT apartment_id, SUM(amount) AS total_expenses
  FROM public.expenses
  GROUP BY apartment_id
) exp ON exp.apartment_id = a.id;

CREATE OR REPLACE VIEW public.cash_advance_balance_details
WITH (security_invoker = true)
AS
SELECT
  ca.id AS cash_advance_id,
  ca.operation_member_id,
  om.full_name AS operation_member_name,
  ca.issued_date,
  ca.amount AS issued_amount,
  COALESCE(exp.total_linked_expenses, 0::numeric(12, 2)) AS total_linked_expenses,
  COALESCE(ret.total_returned, 0::numeric(12, 2)) AS total_returned,
  ca.amount
    - COALESCE(exp.total_linked_expenses, 0::numeric(12, 2))
    - COALESCE(ret.total_returned, 0::numeric(12, 2)) AS remaining_balance
FROM public.cash_advances ca
INNER JOIN public.operation_members om ON om.id = ca.operation_member_id
LEFT JOIN (
  SELECT cash_advance_id, SUM(amount) AS total_linked_expenses
  FROM public.expenses
  WHERE cash_advance_id IS NOT NULL
  GROUP BY cash_advance_id
) exp ON exp.cash_advance_id = ca.id
LEFT JOIN (
  SELECT cash_advance_id, SUM(amount) AS total_returned
  FROM public.advance_returns
  GROUP BY cash_advance_id
) ret ON ret.cash_advance_id = ca.id;

CREATE OR REPLACE VIEW public.operation_member_advance_summary
WITH (security_invoker = true)
AS
SELECT
  om.id AS operation_member_id,
  om.full_name AS operation_member_name,
  COALESCE(adv.total_advances_issued, 0::numeric(12, 2)) AS total_advances_issued,
  COALESCE(exp.total_expenses_paid_from_advances, 0::numeric(12, 2)) AS total_expenses_paid_from_advances,
  COALESCE(ret.total_returned, 0::numeric(12, 2)) AS total_returned,
  COALESCE(adv.total_advances_issued, 0::numeric(12, 2))
    - COALESCE(exp.total_expenses_paid_from_advances, 0::numeric(12, 2))
    - COALESCE(ret.total_returned, 0::numeric(12, 2)) AS remaining_balance
FROM public.operation_members om
LEFT JOIN (
  SELECT operation_member_id, SUM(amount) AS total_advances_issued
  FROM public.cash_advances
  GROUP BY operation_member_id
) adv ON adv.operation_member_id = om.id
LEFT JOIN (
  SELECT ca.operation_member_id, SUM(e.amount) AS total_expenses_paid_from_advances
  FROM public.expenses e
  INNER JOIN public.cash_advances ca ON ca.id = e.cash_advance_id
  WHERE e.cash_advance_id IS NOT NULL
  GROUP BY ca.operation_member_id
) exp ON exp.operation_member_id = om.id
LEFT JOIN (
  SELECT ca.operation_member_id, SUM(ar.amount) AS total_returned
  FROM public.advance_returns ar
  INNER JOIN public.cash_advances ca ON ca.id = ar.cash_advance_id
  GROUP BY ca.operation_member_id
) ret ON ret.operation_member_id = om.id;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advance_returns ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS profiles_operation_select_own ON public.profiles;
CREATE POLICY profiles_operation_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() AND public.is_active_operation_user());

-- operation_members
DROP POLICY IF EXISTS operation_members_admin_all ON public.operation_members;
CREATE POLICY operation_members_admin_all
  ON public.operation_members
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS operation_members_operation_select_own ON public.operation_members;
CREATE POLICY operation_members_operation_select_own
  ON public.operation_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND public.is_active_operation_user());

-- apartments
DROP POLICY IF EXISTS apartments_admin_all ON public.apartments;
CREATE POLICY apartments_admin_all
  ON public.apartments
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS apartments_operation_select_active ON public.apartments;
CREATE POLICY apartments_operation_select_active
  ON public.apartments
  FOR SELECT
  TO authenticated
  USING (status = 'active' AND public.is_active_operation_user());

-- revenues (admin only)
DROP POLICY IF EXISTS revenues_admin_all ON public.revenues;
CREATE POLICY revenues_admin_all
  ON public.revenues
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- cash_advances
DROP POLICY IF EXISTS cash_advances_admin_all ON public.cash_advances;
CREATE POLICY cash_advances_admin_all
  ON public.cash_advances
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS cash_advances_operation_select_own ON public.cash_advances;
CREATE POLICY cash_advances_operation_select_own
  ON public.cash_advances
  FOR SELECT
  TO authenticated
  USING (
    operation_member_id = public.get_current_operation_member_id()
    AND public.is_active_operation_user()
  );

-- expenses
DROP POLICY IF EXISTS expenses_admin_all ON public.expenses;
CREATE POLICY expenses_admin_all
  ON public.expenses
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS expenses_operation_select_own ON public.expenses;
CREATE POLICY expenses_operation_select_own
  ON public.expenses
  FOR SELECT
  TO authenticated
  USING (
    paid_by_member_id = public.get_current_operation_member_id()
    AND public.is_active_operation_user()
  );

DROP POLICY IF EXISTS expenses_operation_insert_own ON public.expenses;
CREATE POLICY expenses_operation_insert_own
  ON public.expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND paid_by_member_id = public.get_current_operation_member_id()
    AND public.is_active_operation_user()
    AND (
      cash_advance_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.cash_advances ca
        WHERE ca.id = cash_advance_id
          AND ca.operation_member_id = paid_by_member_id
      )
    )
  );

-- advance_returns
DROP POLICY IF EXISTS advance_returns_admin_all ON public.advance_returns;
CREATE POLICY advance_returns_admin_all
  ON public.advance_returns
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS advance_returns_operation_select_own ON public.advance_returns;
CREATE POLICY advance_returns_operation_select_own
  ON public.advance_returns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.cash_advances ca
      WHERE ca.id = advance_returns.cash_advance_id
        AND ca.operation_member_id = public.get_current_operation_member_id()
    )
    AND public.is_active_operation_user()
  );

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------

REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.operation_members FROM anon;
REVOKE ALL ON public.apartments FROM anon;
REVOKE ALL ON public.revenues FROM anon;
REVOKE ALL ON public.cash_advances FROM anon;
REVOKE ALL ON public.expenses FROM anon;
REVOKE ALL ON public.advance_returns FROM anon;
REVOKE ALL ON public.apartment_financial_summary FROM anon;
REVOKE ALL ON public.cash_advance_balance_details FROM anon;
REVOKE ALL ON public.operation_member_advance_summary FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operation_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.apartments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.revenues TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_advances TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advance_returns TO authenticated;

GRANT SELECT ON public.apartment_financial_summary TO authenticated;
GRANT SELECT ON public.cash_advance_balance_details TO authenticated;
GRANT SELECT ON public.operation_member_advance_summary TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_operation_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_operation_member_id() TO authenticated;

COMMIT;
