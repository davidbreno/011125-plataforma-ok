-- Patch patients table to add cpf and created_by/updated_by columns if missing
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Ensure RLS is enabled
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Policies for insert/update if not already present (idempotent in practice when named)
DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert patients" ON public.patients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can update patients" ON public.patients
    FOR UPDATE USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
