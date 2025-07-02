-- Create virtual_internship_waitlist table
CREATE TABLE virtual_internship_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_consent BOOLEAN NOT NULL DEFAULT false,
    signed_up_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE virtual_internship_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup)
CREATE POLICY "Anyone can sign up for waitlist" ON virtual_internship_waitlist
    FOR INSERT 
    WITH CHECK (true);

-- Only authenticated users can view (for admin purposes)
CREATE POLICY "Authenticated users can view waitlist" ON virtual_internship_waitlist
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_virtual_internship_waitlist_updated_at 
    BEFORE UPDATE ON virtual_internship_waitlist 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add index on email for fast lookups
CREATE INDEX idx_virtual_internship_waitlist_email ON virtual_internship_waitlist(email);

-- Add index on signed_up_at for ordering
CREATE INDEX idx_virtual_internship_waitlist_signed_up_at ON virtual_internship_waitlist(signed_up_at); 