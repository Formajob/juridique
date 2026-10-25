-- ============================================================
-- 001: Schéma de base Juridique (Xceed) - démo
-- Partie 4 : notification_templates, notifications, qr_tokens,
--           pointage_shifts, pointage_entries
-- ============================================================

-- ─── Table: notification_templates ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  content     TEXT NOT NULL,
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_templates_tenant_isolation ON notification_templates
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

CREATE UNIQUE INDEX IF NOT EXISTS notification_templates_name_key
  ON notification_templates (name, tenant_id);

-- ─── Table: notifications ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier     TEXT NOT NULL,
  template_id UUID,
  content     TEXT NOT NULL,
  etat        TEXT NOT NULL DEFAULT 'draft',
  cree        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed',
  FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_tenant_isolation ON notifications
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

-- ─── Table: qr_tokens ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qr_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier     TEXT NOT NULL,
  jeton       TEXT NOT NULL,
  expiration  TIMESTAMPTZ NOT NULL,
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY qr_tokens_tenant_isolation ON qr_tokens
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

CREATE UNIQUE INDEX IF NOT EXISTS qr_tokens_jeton_key ON qr_tokens (jeton, tenant_id);

-- ─── Table: pointage_shifts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pointage_shifts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id UUID NOT NULL,
  statut        TEXT NOT NULL,
  debut         TIMESTAMPTZ NOT NULL,
  fin           TIMESTAMPTZ,
  total         INTERVAL,
  tenant_id     TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (utilisateur_id) REFERENCES people(id) ON DELETE CASCADE
);

ALTER TABLE pointage_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY pointage_shifts_tenant_isolation ON pointage_shifts
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

-- ─── Table: pointage_entries ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pointage_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id    UUID NOT NULL,
  statut      TEXT NOT NULL,
  date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id   TEXT NOT NULL DEFAULT 'juridique-xceed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (shift_id) REFERENCES pointage_shifts(id) ON DELETE CASCADE
);

ALTER TABLE pointage_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY pointage_entries_tenant_isolation ON pointage_entries
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant', true));

-- ============================================================
-- NOTES DE SECURITE
-- ============================================================
-- RLS : les politiques 'tenant_isolation' restreignent l'acces au tenant courant.
-- La variable de session 'app.current_tenant' est definie par l'application.
-- Aucun envoi de mail, aucun stockage de fichier dans cette passe.
