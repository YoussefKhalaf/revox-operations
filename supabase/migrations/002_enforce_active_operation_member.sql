BEGIN;

CREATE OR REPLACE FUNCTION public.is_active_operation_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    INNER JOIN public.operation_members om ON om.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role = 'operation'
      AND p.is_active = true
      AND om.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_operation_member_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT om.id
  FROM public.operation_members om
  INNER JOIN public.profiles p ON p.id = om.user_id
  WHERE om.user_id = auth.uid()
    AND p.role = 'operation'
    AND p.is_active = true
    AND om.status = 'active'
  LIMIT 1;
$$;

COMMIT;
