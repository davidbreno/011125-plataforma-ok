-- =========================================
-- SUPABASE QUICKSTART SETUP (Dentista)
-- Executar tudo no SQL Editor do Supabase. O script é idempotente.
-- =========================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================
-- USERS (perfil público sincronizado com auth.users)
-- =========================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  user_role TEXT CHECK (user_role IN ('doctor','receptionist','admin')),
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON public.users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger para inserir/atualizar perfil quando um usuário é criado em auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, user_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'full_name'), NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'user_role'), 'doctor')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- RLS em users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for public.users (CREATE POLICY doesn't support IF NOT EXISTS directly)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_select_authenticated'
  ) THEN
    CREATE POLICY users_select_authenticated
      ON public.users FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_insert_own'
  ) THEN
    CREATE POLICY users_insert_own
      ON public.users FOR INSERT TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_update_own'
  ) THEN
    CREATE POLICY users_update_own
      ON public.users FOR UPDATE TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- =========================================
-- PATIENTS (cadastro de pacientes)
-- =========================================

CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  birth_date DATE,
  gender TEXT,
  address TEXT,
  blood_type TEXT,
  medical_history TEXT,
  allergies TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(full_name);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Garante colunas que possam faltar em bancos já existentes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='cpf'
  ) THEN ALTER TABLE public.patients ADD COLUMN cpf TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='full_name'
  ) THEN ALTER TABLE public.patients ADD COLUMN full_name TEXT NOT NULL DEFAULT ''::text; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='email'
  ) THEN ALTER TABLE public.patients ADD COLUMN email TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='phone'
  ) THEN ALTER TABLE public.patients ADD COLUMN phone TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='birth_date'
  ) THEN ALTER TABLE public.patients ADD COLUMN birth_date DATE; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='gender'
  ) THEN ALTER TABLE public.patients ADD COLUMN gender TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='address'
  ) THEN ALTER TABLE public.patients ADD COLUMN address TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='blood_type'
  ) THEN ALTER TABLE public.patients ADD COLUMN blood_type TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='medical_history'
  ) THEN ALTER TABLE public.patients ADD COLUMN medical_history TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='allergies'
  ) THEN ALTER TABLE public.patients ADD COLUMN allergies TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='emergency_contact'
  ) THEN ALTER TABLE public.patients ADD COLUMN emergency_contact TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='emergency_phone'
  ) THEN ALTER TABLE public.patients ADD COLUMN emergency_phone TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='created_by'
  ) THEN ALTER TABLE public.patients ADD COLUMN created_by UUID; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='updated_by'
  ) THEN ALTER TABLE public.patients ADD COLUMN updated_by UUID; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='created_at'
  ) THEN ALTER TABLE public.patients ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(); END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='updated_at'
  ) THEN ALTER TABLE public.patients ADD COLUMN updated_at TIMESTAMPTZ; END IF;

  -- Cria índice único em cpf somente se a coluna existir e o índice ainda não existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='patients' AND column_name='cpf'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='patients' AND indexname='idx_patients_cpf_unique'
    ) THEN
      EXECUTE 'CREATE UNIQUE INDEX idx_patients_cpf_unique ON public.patients(cpf)';
    END IF;
  END IF;
END $$;

-- SELECT: recepção/admin vê tudo; médico vê os próprios (created_by/updated_by)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='patients_select_roles'
  ) THEN
    CREATE POLICY patients_select_roles ON public.patients
      FOR SELECT TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin'))
        OR created_by = auth.uid() OR updated_by = auth.uid()
      );
  END IF;
END $$;

-- INSERT: qualquer autenticado pode inserir (checagens no app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='patients_insert_authenticated'
  ) THEN
    CREATE POLICY patients_insert_authenticated ON public.patients
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- UPDATE/DELETE: recepção/admin qualquer; médico somente próprios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='patients_update_roles'
  ) THEN
    CREATE POLICY patients_update_roles ON public.patients
      FOR UPDATE TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin'))
        OR created_by = auth.uid() OR updated_by = auth.uid()
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin'))
        OR created_by = auth.uid() OR updated_by = auth.uid()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='patients_delete_roles'
  ) THEN
    CREATE POLICY patients_delete_roles ON public.patients
      FOR DELETE TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin'))
        OR created_by = auth.uid() OR updated_by = auth.uid()
      );
  END IF;
END $$;

-- =========================================
-- APPOINTMENTS (agendamentos)
-- =========================================

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT,
  patient_phone TEXT,
  patient_email TEXT,
  patient_age INT,
  patient_gender TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  appointment_type TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  symptoms TEXT,
  medical_history TEXT,
  medications TEXT,
  vital_signs JSONB DEFAULT '{}'::jsonb,
  doctor_id UUID,
  doctor_name TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Garante colunas que possam faltar em bancos já existentes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='appointment_type'
  ) THEN ALTER TABLE public.appointments ADD COLUMN appointment_type TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='patient_age'
  ) THEN ALTER TABLE public.appointments ADD COLUMN patient_age INT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='patient_gender'
  ) THEN ALTER TABLE public.appointments ADD COLUMN patient_gender TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='symptoms'
  ) THEN ALTER TABLE public.appointments ADD COLUMN symptoms TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='medical_history'
  ) THEN ALTER TABLE public.appointments ADD COLUMN medical_history TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='medications'
  ) THEN ALTER TABLE public.appointments ADD COLUMN medications TEXT; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='vital_signs'
  ) THEN ALTER TABLE public.appointments ADD COLUMN vital_signs JSONB DEFAULT '{}'::jsonb; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='created_at'
  ) THEN ALTER TABLE public.appointments ADD COLUMN created_at TIMESTAMPTZ DEFAULT now(); END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='updated_at'
  ) THEN ALTER TABLE public.appointments ADD COLUMN updated_at TIMESTAMPTZ; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='created_by'
  ) THEN ALTER TABLE public.appointments ADD COLUMN created_by UUID; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='doctor_name'
  ) THEN ALTER TABLE public.appointments ADD COLUMN doctor_name TEXT; END IF;
END $$;

-- RLS para appointments (papéis)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Remove política muito permissiva, se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_select_all_auth'
  ) THEN
    DROP POLICY appointments_select_all_auth ON public.appointments;
  END IF;
END $$;

-- SELECT: recepção/admin vê tudo; médico vê os próprios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_select_reception_all'
  ) THEN
    CREATE POLICY appointments_select_reception_all ON public.appointments
      FOR SELECT TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin'))
        OR doctor_id = auth.uid() OR created_by = auth.uid()
      );
  END IF;
END $$;

-- INSERT: qualquer autenticado pode inserir (checagens no app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_insert_authenticated'
  ) THEN
    CREATE POLICY appointments_insert_authenticated ON public.appointments
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- UPDATE/DELETE: recepção/admin qualquer; médico somente próprios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_update_roles'
  ) THEN
    CREATE POLICY appointments_update_roles ON public.appointments
      FOR UPDATE TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin'))
        OR doctor_id = auth.uid() OR created_by = auth.uid()
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin'))
        OR doctor_id = auth.uid() OR created_by = auth.uid()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_delete_roles'
  ) THEN
    CREATE POLICY appointments_delete_roles ON public.appointments
      FOR DELETE TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.user_role IN ('receptionist','admin'))
        OR doctor_id = auth.uid() OR created_by = auth.uid()
      );
  END IF;
END $$;

-- =========================================
-- ATTENDANCES e BUDGETS (para telas de Atendimentos/Orçamentos)
-- =========================================

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT NOT NULL,
  patient_name TEXT,
  description TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'Particular',
  responsible TEXT,
  date DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  installments INTEGER NOT NULL DEFAULT 1,
  due_day INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'em_orcamento',
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_budgets_patient ON public.budgets(patient_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON public.budgets(status);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='budgets' AND policyname='budgets_select_auth'
  ) THEN
    CREATE POLICY budgets_select_auth ON public.budgets FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='budgets' AND policyname='budgets_insert_auth'
  ) THEN
    CREATE POLICY budgets_insert_auth ON public.budgets FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='budgets' AND policyname='budgets_update_auth'
  ) THEN
    CREATE POLICY budgets_update_auth ON public.budgets FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='budgets' AND policyname='budgets_delete_auth'
  ) THEN
    CREATE POLICY budgets_delete_auth ON public.budgets FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- =========================================
-- ANAMNESES (fichas de anamnese por paciente)
-- =========================================

CREATE TABLE IF NOT EXISTS public.anamneses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  patient_name TEXT,
  model TEXT NOT NULL,
  date DATE NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anamneses_patient ON public.anamneses(patient_id);
CREATE INDEX IF NOT EXISTS idx_anamneses_date ON public.anamneses(date);

ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='anamneses' AND policyname='anamneses_select_auth'
  ) THEN
    CREATE POLICY anamneses_select_auth ON public.anamneses FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='anamneses' AND policyname='anamneses_insert_auth'
  ) THEN
    CREATE POLICY anamneses_insert_auth ON public.anamneses FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='anamneses' AND policyname='anamneses_update_auth'
  ) THEN
    CREATE POLICY anamneses_update_auth ON public.anamneses FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='anamneses' AND policyname='anamneses_delete_auth'
  ) THEN
    CREATE POLICY anamneses_delete_auth ON public.anamneses FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- Força recarregamento do cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';

CREATE TABLE IF NOT EXISTS public.attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type TEXT NOT NULL DEFAULT 'consulta',
  status TEXT NOT NULL DEFAULT 'agendado',
  symptoms TEXT,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  doctor_name TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_attendances_date ON public.attendances(date);
CREATE INDEX IF NOT EXISTS idx_attendances_status ON public.attendances(status);

ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='attendances' AND policyname='attendances_select_auth'
  ) THEN
    CREATE POLICY attendances_select_auth ON public.attendances FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='attendances' AND policyname='attendances_insert_auth'
  ) THEN
    CREATE POLICY attendances_insert_auth ON public.attendances FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='attendances' AND policyname='attendances_update_auth'
  ) THEN
    CREATE POLICY attendances_update_auth ON public.attendances FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='attendances' AND policyname='attendances_delete_auth'
  ) THEN
    CREATE POLICY attendances_delete_auth ON public.attendances FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- =========================================
-- (Opcional) Normalização: preencher doctor_id a partir de users.full_name quando só há doctor_name
-- =========================================
-- UPDATE public.appointments a
-- SET doctor_id = u.id
-- FROM public.users u
-- WHERE a.doctor_id IS NULL AND a.doctor_name IS NOT NULL AND u.full_name = a.doctor_name;
