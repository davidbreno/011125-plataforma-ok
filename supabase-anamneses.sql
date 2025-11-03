-- =========================================
-- ANAMNESES TABLE (Supabase)
-- =========================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table
CREATE TABLE IF NOT EXISTS public.anamneses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT NOT NULL,
  patient_name TEXT,
  model TEXT NOT NULL,
  date DATE NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_anamneses_patient ON public.anamneses(patient_id);
CREATE INDEX IF NOT EXISTS idx_anamneses_date ON public.anamneses(date);

-- RLS
ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;

-- Policies: allow authenticated users to manage anamneses
CREATE POLICY IF NOT EXISTS "Authenticated users can read anamneses" ON public.anamneses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can insert anamneses" ON public.anamneses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can update anamneses" ON public.anamneses
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can delete anamneses" ON public.anamneses
  FOR DELETE USING (auth.role() = 'authenticated');
