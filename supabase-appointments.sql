-- Create appointments table (idempotent)
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

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies (simple permissive defaults; refine as needed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_select_all_auth'
  ) THEN
    CREATE POLICY appointments_select_all_auth ON public.appointments
      FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_insert_auth'
  ) THEN
    CREATE POLICY appointments_insert_auth ON public.appointments
      FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_update_own_or_doctor'
  ) THEN
    CREATE POLICY appointments_update_own_or_doctor ON public.appointments
      FOR UPDATE TO authenticated USING (
        created_by = auth.uid() OR doctor_id = auth.uid()
      ) WITH CHECK (
        created_by = auth.uid() OR doctor_id = auth.uid()
      );
  END IF;
END $$;
