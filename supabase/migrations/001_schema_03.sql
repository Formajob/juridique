-- ============================================================
-- 001: Schéma de base Juridique (Xceed) - démo
-- Partie 3 : cases, case_events, appointments
-- ============================================================

-- ─── Table: cases ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       TEXT NOT NULL,
  agent_id        UUID, -- la personne qui a reçu le dossier
  affectation_fixe JSONB NOT NULL DEFAULT '{}', -- état figé au jour de la saisie
  etape           TEXT NOT NULL,
  statut          TEXT NOT NULL,
  reception       BOOLEAN NOT NULL DEFAULT FALSE,
  cree_par        TEXT NOT NULL,
  juriste_id      UUID, -- juriste qui pointe sur la dossier
  echeance        TIMESTAMPTZ,
  tenant_id       TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (agent_id) REFERENCES people(id) ON DELETE SET NULL,
  FOREIGN KEY (juriste_id) REFERENCES people(id) ON DELETE SET NULL
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY cases_tenant_isolation ON cases
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

CREATE UNIQUE INDEX IF NOT EXISTS cases_reference_key ON cases (reference, tenant_id);

-- ─── Table: case_events ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier     TEXT NOT NULL,
  etape       TEXT NOT NULL,
  action      TEXT NOT NULL,
  auteur      TEXT NOT NULL,
  date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed'
);

ALTER TABLE case_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY case_events_tenant_isolation ON case_events
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

-- ─── Table: appointments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier     TEXT NOT NULL,
  debut       TIMESTAMPTZ NOT NULL,
  fin         TIMESTAMPTZ NOT NULL,
  lieu        TEXT NOT NULL,
  statut      TEXT NOT NULL,
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY appointments_tenant_isolation ON appointments
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

-- ============================================================
-- NOTES DE SECURITE
-- ============================================================
-- RLS : les politiques 'tenant_isolation' restreignent l'acces au tenant courant.
-- La variable de session 'app.current_tenant' est definie par l'application.
