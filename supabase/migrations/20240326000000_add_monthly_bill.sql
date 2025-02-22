-- Add monthly_bill and monthly_production columns to proposals table
ALTER TABLE public.proposals 
ADD COLUMN monthly_bill numeric,
ADD COLUMN monthly_production numeric;

-- Update existing rows to have default values
UPDATE public.proposals 
SET 
    monthly_bill = 0,
    monthly_production = 0 
WHERE monthly_bill IS NULL 
   OR monthly_production IS NULL; 