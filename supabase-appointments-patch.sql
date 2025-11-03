-- Patch for appointments table to support richer fields from UI
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'appointment_type'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN appointment_type TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'patient_age'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN patient_age INT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'patient_gender'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN patient_gender TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'symptoms'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN symptoms TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'medical_history'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN medical_history TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'medications'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN medications TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'vital_signs'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN vital_signs JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Ensure timestamp columns exist for consistency
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN updated_at TIMESTAMPTZ;
  END IF;

  -- Ensure created_by/doctor_name columns exist (some schemas only had doctor_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN created_by UUID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'doctor_name'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN doctor_name TEXT;
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
