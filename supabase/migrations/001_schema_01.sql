-- ============================================================
-- 001: Schéma de base Juridique (Xceed) - démo
-- Partie 1 : lobs, departments, people
-- ============================================================

-- ─── Table: lobs ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL,
  label       TEXT NOT NULL,
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE lobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY lobs_tenant_isolation ON lobs
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

CREATE UNIQUE INDEX IF NOT EXISTS lobs_code_key ON lobs (code, tenant_id);

-- ─── Table: departments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL,
  label       TEXT NOT NULL,
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY departments_tenant_isolation ON departments
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

CREATE UNIQUE INDEX IF NOT EXISTS departments_code_key ON departments (code, tenant_id);

-- ─── Table: people ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS people (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifiant TEXT NOT NULL,
  nom         TEXT NOT NULL,
  email       TEXT,
  role        TEXT NOT NULL,
  actif       BOOLEAN NOT NULL DEFAULT TRUE,
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE people ENABLE ROW LEVEL SECURITY;

CREATE POLICY people_tenant_isolation ON people
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

CREATE UNIQUE INDEX IF NOT EXISTS people_identifiant_key ON people (identifiant, tenant_id);

-- ============================================================
-- NOTES DE SECURITE
-- ============================================================
-- RLS : les politiques 'tenant_isolation' restreignent l'acces au tenant courant.
-- La variable de session 'app.current_tenant' est definie par l'application.
