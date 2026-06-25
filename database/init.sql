-- ═══════════════════════════════════════════════════════════
--  Government Citizen Services Portal — Database Schema
--  PostgreSQL 16
-- ═══════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUM TYPES ─────────────────────────────────────────────
CREATE TYPE complaint_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'RESOLVED');

CREATE TYPE application_type AS ENUM (
  'BIRTH_CERTIFICATE',
  'DOMICILE_CERTIFICATE',
  'CHARACTER_CERTIFICATE'
);

CREATE TYPE application_status AS ENUM (
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'COMPLETED'
);

CREATE TYPE user_role AS ENUM ('CITIZEN', 'ADMIN');

-- ─── USERS TABLE ────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(20),
  cnic          VARCHAR(20) UNIQUE,        -- National ID number
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'CITIZEN',
  address       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ─── COMPLAINTS TABLE ───────────────────────────────────────
CREATE TABLE complaints (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tracking_no  VARCHAR(20) UNIQUE NOT NULL,
  title        VARCHAR(200) NOT NULL,
  category     VARCHAR(100) NOT NULL,
  description  TEXT NOT NULL,
  status       complaint_status NOT NULL DEFAULT 'SUBMITTED',
  remarks      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);

-- Auto tracking number for complaints
CREATE SEQUENCE complaint_tracking_seq START 100001;

CREATE OR REPLACE FUNCTION generate_complaint_tracking_no()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_no := 'CMP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('complaint_tracking_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_complaint_tracking_no
  BEFORE INSERT ON complaints
  FOR EACH ROW EXECUTE FUNCTION generate_complaint_tracking_no();

-- ─── APPLICATIONS TABLE ─────────────────────────────────────
CREATE TABLE applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tracking_no     VARCHAR(20) UNIQUE NOT NULL,
  type            application_type NOT NULL,
  applicant_name  VARCHAR(150) NOT NULL,
  purpose         TEXT,
  status          application_status NOT NULL DEFAULT 'SUBMITTED',
  remarks         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_type ON applications(type);

-- Auto tracking number for applications
CREATE SEQUENCE application_tracking_seq START 100001;

CREATE OR REPLACE FUNCTION generate_application_tracking_no()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_no := 'APP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('application_tracking_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_application_tracking_no
  BEFORE INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION generate_application_tracking_no();

-- ─── AUTO-UPDATE updated_at TRIGGER (shared) ────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── SEED: DEFAULT ADMIN ACCOUNT ────────────────────────────
-- Email: admin@citizenportal.gov
-- Password: Admin@2026Secure
-- CHANGE THIS PASSWORD after first login in any real deployment.
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
  'Avenza Administrator',
  'admin@citizenportal.gov',
  '$2b$12$6SHCW9q7CaBfBg/mhbpULOSi5x29GqzzwZJSjp.azGD0KgMXuE6jG',
  'ADMIN'
);
