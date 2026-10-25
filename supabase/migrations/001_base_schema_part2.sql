-- ============================================================
-- 001: Schéma de base Juridique (Xceed) - démo
-- Partie 2 : seed de démonstration
-- ============================================================

-- ─── Seed : departments ────────────────────────────────────────────────
INSERT INTO departments (code, label, tenant_id)
VALUES
  ('VL', 'VL', 'juridique-xceed'),
  ('SAC', 'SAC', 'juridique-xceed'),
  ('RET', 'RET', 'juridique-xceed'),
  ('STC', 'STC', 'juridique-xceed'),
  ('SAC_AFFAIRE', 'SAC Affaire', 'juridique-xceed'),
  ('STC_AFFAIRE', 'STC Affaire', 'juridique-xceed'),
  ('PAV', 'PAV', 'juridique-xceed')
ON CONFLICT (code, tenant_id) DO NOTHING;

-- ─── Seed : lobs ───────────────────────────────────────────────────────
INSERT INTO lobs (code, label, tenant_id)
VALUES
  ('GV', 'GV', 'juridique-xceed'),
  ('VL', 'VL', 'juridique-xceed')
ON CONFLICT (code, tenant_id) DO NOTHING;

-- ─── Seed : workflow_steps ─────────────────────────────────────────────
INSERT INTO workflow_steps (code, label, tenant_id)
VALUES
  ('constatation_recue', 'Constatation recue', 'juridique-xceed'),
  ('analyse_gravite', 'Analyse gravite', 'juridique-xceed'),
  ('sanction_faute_non_grave', 'Sanction faute non grave', 'juridique-xceed'),
  ('convocation_seance', 'Convocation seance', 'juridique-xceed'),
  ('seance_presente', 'Seance presente', 'juridique-xceed'),
  ('seance_absente', 'Seance absente', 'juridique-xceed'),
  ('depot_inspection_absence', 'Depot inspection absence', 'juridique-xceed'),
  ('investigations', 'Investigations', 'juridique-xceed'),
  ('decision_licenciement', 'Decision licenciement', 'juridique-xceed'),
  ('decision_mise_a_pied', 'Decision mise a pied', 'juridique-xceed'),
  ('decision_sanction', 'Decision sanction', 'juridique-xceed'),
  ('fin_procedure', 'Fin de procedure', 'juridique-xceed'),
  ('cloture', 'Cloture', 'juridique-xceed')
ON CONFLICT (code, tenant_id) DO NOTHING;

-- ─── Seed : workflow_transitions ───────────────────────────────────────
INSERT INTO workflow_transitions (from_step, to_step, label, tenant_id)
VALUES
  ('constatation_recue', 'analyse_gravite', 'Passer a l analyse de gravite', 'juridique-xceed'),

  ('analyse_gravite', 'sanction_faute_non_grave', 'Sanction pour faute non grave', 'juridique-xceed'),
  ('analyse_gravite', 'convocation_seance', 'Naviguer vers la convocation seance', 'juridique-xceed'),

  ('sanction_faute_non_grave', 'cloture', 'Clore la procedure', 'juridique-xceed'),

  ('convocation_seance', 'seance_presente', 'Revenir a la seance presente', 'juridique-xceed'),
  ('convocation_seance', 'seance_absente', 'Gouverner vers la seance absente', 'juridique-xceed'),

  ('seance_presente', 'pv_seance', 'Passer au pv de seance', 'juridique-xceed'),

  ('pv_seance', 'decision_licenciement', 'Licenciement', 'juridique-xceed'),
  ('pv_seance', 'decision_mise_a_pied', 'Mise a pied', 'juridique-xceed'),
  ('pv_seance', 'decision_sanction', 'Sanction', 'juridique-xceed'),
  ('pv_seance', 'fin_procedure', 'Fin de procedure', 'juridique-xceed'),

  ('seance_absente', 'depot_inspection_absence', 'Depot inspection absence', 'juridique-xceed'),

  ('depot_inspection_absence', 'investigations', 'Passer aux investigations', 'juridique-xceed'),

  ('investigations', 'decision_licenciement', 'Licenciement', 'juridique-xceed'),
  ('investigations', 'decision_mise_a_pied', 'Mise a pied', 'juridique-xceed'),
  ('investigations', 'decision_sanction', 'Sanction', 'juridique-xceed'),
  ('investigations', 'fin_procedure', 'Fin de procedure', 'juridique-xceed'),

  ('decision_licenciement', 'notification_48h', 'Notification 48h', 'juridique-xceed'),
  ('decision_mise_a_pied', 'notification_48h', 'Notification 48h', 'juridique-xceed'),

  ('notification_48h', 'depot_inspection_decision', 'Depot inspection decision', 'juridique-xceed'),

  ('depot_inspection_decision', 'cloture', 'Cloture apres depot', 'juridique-xceed'),

  ('decision_sanction', 'cloture', 'Cloture apres sanction', 'juridique-xceed'),

  ('fin_procedure', 'cloture', 'Cloture apres fin', 'juridique-xceed')
ON CONFLICT (from_step, to_step, tenant_id) DO NOTHING;

-- ============================================================
-- NOTES DE SECURITE
-- ============================================================
-- RLS : les politiques 'tenant_isolation' restreignent l'acces au tenant courant.
-- La variable de session 'app.current_tenant' est definie par l'application.
-- Aucun envoi de mail, aucun stockage de fichier dans cette passe.
