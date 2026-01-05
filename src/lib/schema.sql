-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'user')),
    secret_key_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    job_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Letters Table
CREATE TABLE IF NOT EXISTS letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_number TEXT NOT NULL,
    letter_date TIMESTAMP WITH TIME ZONE NOT NULL,
    subject TEXT NOT NULL,
    attachment TEXT NOT NULL,
    content TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'signed', 'invalid')) DEFAULT 'draft',
    content_hash TEXT,
    qr_code_url TEXT,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signatures Table
CREATE TABLE IF NOT EXISTS signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_id UUID REFERENCES letters(id) ON DELETE CASCADE,
    signer_id UUID REFERENCES users(id),
    signer_name TEXT NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    content_hash TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    claim_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    template_url TEXT,
    template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificate Claims Table
CREATE TABLE IF NOT EXISTS certificate_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- Optional
    recipient_name TEXT NOT NULL,
    call_sign TEXT,
    certificate_number TEXT NOT NULL,
    qr_code_url TEXT NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_letters_letter_number ON letters(letter_number);
CREATE INDEX idx_signatures_letter_id ON signatures(letter_id);
CREATE INDEX idx_certificate_claims_event_id ON certificate_claims(event_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- RPC Function to Sign Letter Transactionally
CREATE OR REPLACE FUNCTION sign_letter(
  p_letter_id UUID,
  p_signer_id UUID,
  p_signer_name TEXT,
  p_content_hash TEXT,
  p_qr_code_url TEXT,
  p_metadata JSONB
) RETURNS JSONB AS $$
DECLARE
  v_signature_id UUID;
  v_signed_at TIMESTAMP WITH TIME ZONE := NOW();
  v_signature_data JSONB;
BEGIN
  -- 1. Check if letter exists and is not signed
  IF NOT EXISTS (SELECT 1 FROM letters WHERE id = p_letter_id AND status = 'draft') THEN
    RAISE EXCEPTION 'Letter not found or already signed';
  END IF;

  -- 2. Update letter status
  UPDATE letters
  SET status = 'signed',
      content_hash = p_content_hash,
      qr_code_url = p_qr_code_url,
      updated_at = v_signed_at
  WHERE id = p_letter_id;

  -- 3. Create signature
  INSERT INTO signatures (letter_id, signer_id, signer_name, signed_at, content_hash, metadata)
  VALUES (p_letter_id, p_signer_id, p_signer_name, v_signed_at, p_content_hash, p_metadata)
  RETURNING id INTO v_signature_id;

  -- 4. Return the signature data
  SELECT jsonb_build_object(
    'id', v_signature_id,
    'letterId', p_letter_id,
    'signerId', p_signer_id,
    'signerName', p_signer_name,
    'signedAt', v_signed_at,
    'contentHash', p_content_hash,
    'metadata', p_metadata
  ) INTO v_signature_data;

  RETURN v_signature_data;
END;
$$ LANGUAGE plpgsql;
