-- Add application_sent field to track when applications are submitted

ALTER TABLE public.internship_company_applications 
ADD COLUMN IF NOT EXISTS application_sent BOOLEAN DEFAULT FALSE;

-- Add index for querying sent applications
CREATE INDEX IF NOT EXISTS idx_company_applications_sent 
ON public.internship_company_applications(application_sent) 
WHERE application_sent = TRUE;
