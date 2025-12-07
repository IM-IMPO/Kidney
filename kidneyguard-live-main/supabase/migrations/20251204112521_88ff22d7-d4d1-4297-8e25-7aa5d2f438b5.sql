-- Create profiles table for doctors
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view all profiles (doctors)
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', 'Doctor'), new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create patients table with audited_by field
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  height_cm DECIMAL,
  weight_kg DECIMAL,
  serum_creatinine DECIMAL,
  bun DECIMAL,
  gfr DECIMAL,
  acr DECIMAL,
  serum_electrolytes_calcium DECIMAL,
  protein_in_urine DECIMAL,
  blood_pressure_sys INTEGER,
  blood_pressure_dia INTEGER,
  family_history BOOLEAN DEFAULT false,
  smoking INTEGER DEFAULT 0,
  alcohol_consumption INTEGER DEFAULT 0,
  physical_activity INTEGER DEFAULT 3,
  diet_quality INTEGER DEFAULT 3,
  sleep_quality INTEGER DEFAULT 3,
  risk_level TEXT,
  risk_score DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view all patients
CREATE POLICY "Authenticated users can view all patients" 
ON public.patients FOR SELECT 
TO authenticated
USING (true);

-- All authenticated users can insert patients
CREATE POLICY "Authenticated users can insert patients" 
ON public.patients FOR INSERT 
TO authenticated
WITH CHECK (true);

-- All authenticated users can update patients
CREATE POLICY "Authenticated users can update patients" 
ON public.patients FOR UPDATE 
TO authenticated
USING (true);

-- All authenticated users can delete patients
CREATE POLICY "Authenticated users can delete patients" 
ON public.patients FOR DELETE 
TO authenticated
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();