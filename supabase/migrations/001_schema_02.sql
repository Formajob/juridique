-- ============================================================
-- 001: Schéma de base Juridique (Xceed) - démo
-- Partie 2 : assignments, workflow_steps, workflow_transitions
-- ============================================================

-- ─── Table: assignments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_id UUID NOT NULL,
  mois        TEXT NOT NULL, -- format AAAA-MM
  lob         TEXT NOT NULL,
  department  TEXT,
  tl          TEXT,
  sspv        TEXT,
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (personne_id) REFERENCES people(id) ON DELETE CASCADE
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY assignments_tenant_isolation ON assignments
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

-- Unique par personne et par mois (pas d'écraser un mois passé)
CREATE UNIQUE INDEX IF NOT EXISTS assignments_personne_mois_key
  ON assignments (personne_id, mois, tenant_id);

-- ─── Table: workflow_steps ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_steps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL,
  label       TEXT NOT NULL,
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY workflow_steps_tenant_isolation ON workflow_steps
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

CREATE UNIQUE INDEX IF NOT EXISTS workflow_steps_code_key ON workflow_steps (code, tenant_id);

-- ─── Table: workflow_transitions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_transitions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_step   TEXT NOT NULL,
  to_step     TEXT NOT NULL,
  label       TEXT NOT NULL,
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY workflow_transitions_tenant_isolation ON workflow_transitions
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

CREATE UNIQUE INDEX IF NOT EXISTS workflow_transitions_unique_key
  ON workflow_transitions (from_step, to_step, tenant_id);

-- ============================================================
-- NOTES DE SECURITE
-- ============================================================
-- RLS : les politiques 'tenant_isolation' restreignent l'acces au tenant courant.
-- La variable de session 'app.current_tenant' est definie par l'application.
