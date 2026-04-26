-- Pricing + lifecycle columns for events
-- Source of truth: CLAUDE.md "Campos Pendientes de Implementar en DB" + modelo de cotización superadmin.
-- Apply manually in Supabase dashboard (repo policy: no CLI migrations).

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS custom_domain TEXT;

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS design_type TEXT NOT NULL DEFAULT 'template'
    CHECK (design_type IN ('template','custom'));

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS extension_key TEXT NOT NULL DEFAULT 'none'
    CHECK (extension_key IN ('none','1m','3m','6m','permanent'));

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS domain_option TEXT NOT NULL DEFAULT 'none'
    CHECK (domain_option IN ('none','subdomain','custom_purchase','custom_config'));

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS custom_design_fee_mxn INTEGER NOT NULL DEFAULT 0
    CHECK (custom_design_fee_mxn >= 0);
