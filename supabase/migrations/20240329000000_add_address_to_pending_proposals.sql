-- Add all necessary columns to pending_proposals table to match proposals table
ALTER TABLE public.pending_proposals
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS system_size NUMERIC,
ADD COLUMN IF NOT EXISTS panel_count INTEGER,
ADD COLUMN IF NOT EXISTS monthly_production NUMERIC,
ADD COLUMN IF NOT EXISTS monthly_bill NUMERIC,
ADD COLUMN IF NOT EXISTS package_type TEXT CHECK (package_type IN ('standard', 'premium')),
ADD COLUMN IF NOT EXISTS payment_type TEXT CHECK (payment_type IN ('cash', 'finance')),
ADD COLUMN IF NOT EXISTS financing JSONB,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'saved')),
ADD COLUMN IF NOT EXISTS include_battery BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS battery_type TEXT,
ADD COLUMN IF NOT EXISTS battery_count INTEGER,
ADD COLUMN IF NOT EXISTS total_price NUMERIC;

-- Update any existing rows with values from proposal_data
UPDATE public.pending_proposals
SET 
  address = COALESCE((proposal_data->>'address')::TEXT, 'No address provided'),
  system_size = COALESCE((proposal_data->'systemInfo'->>'systemSize')::NUMERIC, 0),
  panel_count = COALESCE((proposal_data->'systemInfo'->>'numberOfPanels')::INTEGER, 0),
  monthly_production = COALESCE((proposal_data->'systemInfo'->>'monthlyProduction')::NUMERIC, 0),
  monthly_bill = COALESCE((proposal_data->>'monthlyBill')::NUMERIC, 0),
  package_type = COALESCE((proposal_data->>'packageType')::TEXT, 'standard'),
  payment_type = COALESCE((proposal_data->>'paymentType')::TEXT, 'cash'),
  financing = CASE 
    WHEN proposal_data->>'paymentType' = 'finance' 
    THEN json_build_object(
      'term', (proposal_data->'selectedTerm')::integer,
      'down_payment', (proposal_data->'downPayment')::numeric,
      'monthly_payment', (proposal_data->'monthlyPayment')::numeric
    )::jsonb
    ELSE NULL
  END,
  include_battery = COALESCE((proposal_data->>'includeBattery')::BOOLEAN, false),
  battery_type = (proposal_data->>'batteryType')::TEXT,
  battery_count = (proposal_data->>'batteryCount')::INTEGER,
  total_price = COALESCE((proposal_data->'systemInfo'->>'totalPrice')::NUMERIC, 0)
WHERE address IS NULL 
   OR system_size IS NULL 
   OR panel_count IS NULL 
   OR monthly_production IS NULL 
   OR monthly_bill IS NULL;

-- Make required columns NOT NULL
ALTER TABLE public.pending_proposals
ALTER COLUMN address SET NOT NULL,
ALTER COLUMN system_size SET NOT NULL,
ALTER COLUMN panel_count SET NOT NULL,
ALTER COLUMN monthly_production SET NOT NULL,
ALTER COLUMN monthly_bill SET NOT NULL,
ALTER COLUMN package_type SET NOT NULL,
ALTER COLUMN payment_type SET NOT NULL,
ALTER COLUMN status SET NOT NULL; 