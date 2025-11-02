-- =========================================
-- ADDITIONAL TABLES - MEDICINES, APPOINTMENTS, ETC
-- =========================================

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT,
  address TEXT,
  medical_history TEXT,
  allergies TEXT,
  blood_type TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  stock_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  patient_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  doctor_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES public.appointments(id),
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  diagnosis TEXT,
  medicines JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  doctor_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens table
CREATE TABLE IF NOT EXISTS public.tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_number INTEGER NOT NULL,
  patient_name TEXT NOT NULL,
  status TEXT DEFAULT 'waiting',
  appointment_id UUID REFERENCES public.appointments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  patient_phone TEXT,
  appointment_id UUID REFERENCES public.appointments(id),
  items JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  due_date DATE,
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON public.medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON public.medicines(category);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON public.tokens(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies (allow authenticated users to read/write)
CREATE POLICY "Authenticated users can manage patients" ON public.patients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read medicines" ON public.medicines
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert medicines" ON public.medicines
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update medicines" ON public.medicines
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete medicines" ON public.medicines
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage appointments" ON public.appointments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage prescriptions" ON public.prescriptions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage tokens" ON public.tokens
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage invoices" ON public.invoices
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage payments" ON public.payments
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample medicines
INSERT INTO public.medicines (name, category, dosage, frequency, duration, stock_quantity, unit_price) VALUES
  ('Paracetamol', 'Analgésico', '500mg', '8/8h', '5 dias', 100, 5.50),
  ('Amoxicilina', 'Antibiótico', '500mg', '8/8h', '7 dias', 50, 12.00),
  ('Omeprazol', 'Antiácido', '20mg', '12/12h', '14 dias', 75, 8.00),
  ('Dipirona', 'Analgésico', '500mg', '6/6h', '3 dias', 120, 4.50),
  ('Ibuprofeno', 'Anti-inflamatório', '600mg', '8/8h', '5 dias', 80, 7.00)
ON CONFLICT DO NOTHING;
