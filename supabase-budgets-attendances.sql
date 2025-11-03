-- =========================================
-- BUDGETS & ATTENDANCES (Supabase)
-- =========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Budgets
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
CREATE POLICY IF NOT EXISTS "Authenticated users can read budgets" ON public.budgets
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Authenticated users can insert budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Authenticated users can update budgets" ON public.budgets
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Authenticated users can delete budgets" ON public.budgets
  FOR DELETE USING (auth.role() = 'authenticated');

-- Attendances
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
CREATE POLICY IF NOT EXISTS "Authenticated users can read attendances" ON public.attendances
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Authenticated users can insert attendances" ON public.attendances
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Authenticated users can update attendances" ON public.attendances
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Authenticated users can delete attendances" ON public.attendances
  FOR DELETE USING (auth.role() = 'authenticated');
