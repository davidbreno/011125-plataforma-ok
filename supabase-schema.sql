-- =========================================
-- CLINIC MANAGEMENT SYSTEM - SUPABASE SCHEMA
-- =========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.tokens CASCADE;
DROP TABLE IF EXISTS public.medicines CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =========================================
-- USERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'doctor' CHECK (user_role IN ('doctor', 'receptionist', 'admin')),
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(user_role);

-- =========================================
-- APPOINTMENTS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  patient_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  doctor_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- =========================================
-- PRESCRIPTIONS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES public.appointments(id),
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  diagnosis TEXT,
  medicines JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  doctor_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON public.prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_name);

-- =========================================
-- MEDICINES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  stock_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_name ON public.medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON public.medicines(category);

-- =========================================
-- TOKENS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_number INTEGER NOT NULL,
  patient_name TEXT NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'completed', 'cancelled')),
  appointment_id UUID REFERENCES public.appointments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  called_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_tokens_status ON public.tokens(status);
CREATE INDEX IF NOT EXISTS idx_tokens_date ON public.tokens(created_at);

-- =========================================
-- INVOICES TABLE
-- =========================================
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
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'cancelled')),
  payment_method TEXT,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  due_date DATE,
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(created_at);

-- =========================================
-- PAYMENTS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

-- =========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Appointments policies (doctors and receptionists can see all)
CREATE POLICY "Everyone can read appointments" ON public.appointments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update appointments" ON public.appointments
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Prescriptions policies
CREATE POLICY "Everyone can read prescriptions" ON public.prescriptions
  FOR SELECT USING (true);

CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Doctors can update prescriptions" ON public.prescriptions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Medicines policies
CREATE POLICY "Everyone can read medicines" ON public.medicines
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage medicines" ON public.medicines
  FOR ALL USING (auth.role() = 'authenticated');

-- Tokens policies
CREATE POLICY "Everyone can read tokens" ON public.tokens
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage tokens" ON public.tokens
  FOR ALL USING (auth.role() = 'authenticated');

-- Invoices policies
CREATE POLICY "Everyone can read invoices" ON public.invoices
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage invoices" ON public.invoices
  FOR ALL USING (auth.role() = 'authenticated');

-- Payments policies
CREATE POLICY "Everyone can read payments" ON public.payments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create payments" ON public.payments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =========================================
-- FUNCTIONS & TRIGGERS
-- =========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- SEED DATA (Optional - for testing)
-- =========================================

-- Insert test doctor (use a valid auth.users id if available)
-- INSERT INTO public.users (id, email, user_role, full_name) VALUES
--   ('550e8400-e29b-41d4-a716-446655440000', 'doctor@clinic.com', 'doctor', 'Dr. João Silva'),
--   ('550e8400-e29b-41d4-a716-446655440001', 'receptionist@clinic.com', 'receptionist', 'Maria Santos');

-- Insert test medicines
INSERT INTO public.medicines (name, category, dosage, frequency, duration, stock_quantity, unit_price) VALUES
  ('Paracetamol', 'Analgésico', '500mg', '8/8h', '5 dias', 100, 5.50),
  ('Amoxicilina', 'Antibiótico', '500mg', '8/8h', '7 dias', 50, 12.00),
  ('Omeprazol', 'Antiácido', '20mg', '12/12h', '14 dias', 75, 8.00),
  ('Dipirona', 'Analgésico', '500mg', '6/6h', '3 dias', 120, 4.50)
ON CONFLICT DO NOTHING;
