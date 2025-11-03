-- Hardened RLS for appointments: different rules for doctors vs receptionists/admins
-- Assumptions: public.users table has columns (id UUID PK, user_role TEXT)

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_select_all_auth'
  ) THEN
    DROP POLICY appointments_select_all_auth ON public.appointments;
  END IF;
END $$;

-- SELECT policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_select_reception_all'
  ) THEN
    CREATE POLICY appointments_select_reception_all ON public.appointments
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin')
        )
        OR doctor_id = auth.uid() OR created_by = auth.uid()
      );
  END IF;
END $$;

-- INSERT policies (allow all authenticated; constrain in app layer or add checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_insert_authenticated'
  ) THEN
    CREATE POLICY appointments_insert_authenticated ON public.appointments
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- UPDATE policies: receptionists/admins can update any; doctors only own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_update_roles'
  ) THEN
    CREATE POLICY appointments_update_roles ON public.appointments
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin')
        )
        OR doctor_id = auth.uid() OR created_by = auth.uid()
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin')
        )
        OR doctor_id = auth.uid() OR created_by = auth.uid()
      );
  END IF;
END $$;

-- DELETE policy (optional): same as update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_delete_roles'
  ) THEN
    CREATE POLICY appointments_delete_roles ON public.appointments
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin')
        )
        OR doctor_id = auth.uid() OR created_by = auth.uid()
      );
  END IF;
END $$;
