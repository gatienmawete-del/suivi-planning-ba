-- =====================================================
-- BA Tracker — Seed des données initiales
-- Généré automatiquement depuis Planning_BA_projet_et_activite.xlsx
-- =====================================================
-- IMPORTANT: lance ce script via le SQL Editor de Supabase APRÈS
-- la migration 001_initial_schema.sql, et APRÈS avoir créé les
-- utilisateurs via le script Node (scripts/seed-users.mjs).

-- 1. Projets

insert into projects (code, name, color) values ('AKIENI', 'Akieni', '#f59e0b') on conflict (code) do nothing;
insert into projects (code, name, color) values ('AUTRESUPPORTPROJET', 'Autre Support Projet', '#4f46e5') on conflict (code) do nothing;
insert into projects (code, name, color) values ('CARTRACKING', 'CarTracking', '#f59e0b') on conflict (code) do nothing;
insert into projects (code, name, color) values ('CNSS', 'CNSS', '#2dd4bf') on conflict (code) do nothing;
insert into projects (code, name, color) values ('CNSSGED', 'CNSS GED', '#7c3aed') on conflict (code) do nothing;
insert into projects (code, name, color) values ('EGOUV', 'eGouv', '#dc2626') on conflict (code) do nothing;
insert into projects (code, name, color) values ('EGOV', 'eGov', '#6366f1') on conflict (code) do nothing;
insert into projects (code, name, color) values ('FHN', 'FHN', '#4f46e5') on conflict (code) do nothing;
insert into projects (code, name, color) values ('GED', 'GED', '#db2777') on conflict (code) do nothing;
insert into projects (code, name, color) values ('KAMOA', 'KAMOA', '#0284c7') on conflict (code) do nothing;
insert into projects (code, name, color) values ('MAXIAINITIATIVES', 'Maxia initiatives', '#4f46e5') on conflict (code) do nothing;
insert into projects (code, name, color) values ('MINJUSTICE', 'MinJustice', '#7c3aed') on conflict (code) do nothing;
insert into projects (code, name, color) values ('NSIA', 'NSIA', '#f59e0b') on conflict (code) do nothing;
insert into projects (code, name, color) values ('ODOOINTERNE', 'Odoo interne', '#0284c7') on conflict (code) do nothing;
insert into projects (code, name, color) values ('PNLIR', 'PNLIR', '#ec4899') on conflict (code) do nothing;
insert into projects (code, name, color) values ('PRODUITGEDWF', 'Produit GED-WF', '#059669') on conflict (code) do nothing;
insert into projects (code, name, color) values ('RAGEC', 'Ragec', '#9333ea') on conflict (code) do nothing;
insert into projects (code, name, color) values ('SANGVIE', 'SangVie', '#2dd4bf') on conflict (code) do nothing;
insert into projects (code, name, color) values ('SFEC', 'SFEC', '#4f46e5') on conflict (code) do nothing;
insert into projects (code, name, color) values ('SMSCONGO', 'SMS Congo', '#ec4899') on conflict (code) do nothing;
insert into projects (code, name, color) values ('TOUSLESPROJETSENTANT', 'Tous les projets en tant que PMO.', '#4f46e5') on conflict (code) do nothing;

-- 2. Plannings hebdomadaires et affectations
--    Les utilisateurs doivent avoir été créés AVANT via le script Node.
--    Ce bloc utilise l'email pour retrouver chaque user.

-- Semaine du 2026-06-15
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Definition des prints Homologation', 'Definition des prints Homologation
Travail sur le manuel d''utilisation d''homologation', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-18'::date, '2026-12-23'::date, 4, 'Audrey, Nissi', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-18'::date);
with u as (select id from profiles where email = 'destino.alain.dello@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'GED' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Design de la plateforme web', 'Design de la plateforme web
 SFEC.GOUV.CG 
Design de l''application Efacture', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Tests et rédation de tickets sur le projet NSIA', '- Tests et rédation de tickets sur le projet NSIA
- Tests sur le projet existant du ministère de la justice
- Démo du projet existant du ministère de la justice au DEP
- Mapping du processus AS-is et TO-BE des flow principaux pour le projet MinJust
- Réalisation du powerpoint de présentation du projet Minjust incluant la nouvelle demande sur les amendes pénales', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.1, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'Ragec' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'Maxia initiatives' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'NSIA', 'NSIA 
- Daily stand up,
- Design review and Design update. 
SFEC 
- App mobile design review and update 
- Datamega terminals new version testing 
Min Justice 
- Project Discovery 
- Design the as is and the to be flow Maxi Initiatives 
- Analyse the initiative and provide feedback to the project team

Ragec :
- Proposition tecthinque review', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-28'::date, '2027-01-08'::date, 10, 'Audrey, Ibalico, Abed', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-28'::date);
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.0, 'Workflow de validation et suivi des validations ( En cours)
Suivi de courrier UBA ( En cours)
Suivi et formation de Daniel (stagiaire en cours)
Suivi des formation et integration avec les contribuables sur SFEC ( Support)
Suivi des activités post-déploiement : accompagnement des utilisateurs, validation des processus métier, traitement des anomalies et ajustements fonctionnels de la solution GED à la CNSS.
Opportunité de partenariat archivage ( Green archive )', 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'CNSS GED' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'Produit GED-WF' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Envoie des email pour l''offre UBA', 'Envoie des email pour l''offre UBA 

Produit (GED Akieni):
Armoires documentaires, dossiers, versionnement et recherche (Terminé)
Import manuel, Drag et Drop et capture e-mail (Terminé)
OCR et extraction automatique des métadonnées (Terminé)
Audit, journalisation et conformité documentaire (Terminé)
Gestion des utilisateurs, rôles, permissions et sécurité (Terminé)
Workflow de validation et suivi des validations ( En cours)
Suivi de courrier UBA ( En cours)
Suivi et formation de Daniel (stagiaire en cours)
Suivi des formation et integration avec les contribuables sur SFEC ( En cours)', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '"- Formations des agents économiques', '"- Formations des agents économiques 
- Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques 
-  tests efacture PGSFEC, Homologation, distributeur agrée
 - tests Homologation et distributeur agrée avec la DGID
- Creation des tickets pour amelioration efacture/Pgsfec', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.1, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 70 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'Odoo interne' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Planiffier et suivre des formations avec des agents économiques', '- Planiffier et suivre des formations avec des agents économiques 
- Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Répondre aux mails des agents économiques
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques 
- Répondre au téléphone projet', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'esther.mban@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'esther.mban@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'esther.mban@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Suivie des stagiaires', 'Suivie des stagiaires 
Definition du UX design SFEC Web
Mise à jour du fichier de reporting des contribuables entrant
création de ticket pour resoudre un problème de SIAT concernant le scannage de la facture', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.7, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'CarTracking' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'PNLIR' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-08-03'::date, '2026-08-14'::date, 5, 'Daniel Katoro', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-08-03'::date);
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 90 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Revue de l''offre technique Ragec', '- Revue de l''offre technique Ragec 
- Staffer les BA dans les projets en cours 
- Assurer les retours des activites et les livrables', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'mawete.gatien@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Suivi des Travaux avec Data Mega', '- Suivi des Travaux avec Data Mega
- Documentation des cas de tests TCC/API (Homologation) (50%) - En attente
- UAT Terminaux Internes (80%) - En attente
- GAP Terminaux Data Mega vs Terminaux Interne (60%) - En attente
- UAT Sim MTN (90%) - En attente
- Suivi des bugs avec l''équipe dev
- Stratégie de mise à disposition des terminaux (30%) - En cours
- Specs taxes sectorielles (50%) - En cours', 'in_progress', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'typhaine.mutombo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.2, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'typhaine.mutombo@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-05-11'::date, '2026-06-02'::date, 15, 'Destino, Eden et Nissi', 'approved' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-05-11'::date);
with u as (select id from profiles where email = 'orphee.dita.ntsiona@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'Tous les projets en tant que PMO.' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 70 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'CNSS' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Contacter Serge pour les besoins urgents.', 'Contacter Serge pour les besoins urgents.', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'orphee.dita.ntsiona@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-05-18'::date, '2026-06-05'::date, 14, 'Jude & Loyic', 'approved' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-05-18'::date);
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.8, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'prince.bouende@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'FHN' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-11-25'::date, '2026-12-31'::date, 26, 'Jacques Dani, Pasteur', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-11-25'::date);
with u as (select id from profiles where email = 'nedith.louzolo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-15'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-06-15'
  limit 1
),
proj as (select id from projects where name = 'Autre Support Projet' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;

-- Semaine du 2026-06-22
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'CarTracking' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'eGov' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- sessions de tests avec la DGID sur la plateforme d''homologation', '- sessions de tests avec la DGID sur la plateforme d''homologation 
- Participation au sessions de cadrage et d''alignements avec le MPTEN , AGORA , L''ANSSI et L''ADEN dans le cadre 
du projet E-gouv', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-18'::date, '2026-12-23'::date, 4, 'Audrey, Nissi', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-18'::date);
with u as (select id from profiles where email = 'destino.alain.dello@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'destino.alain.dello@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'KAMOA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'destino.alain.dello@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'Akieni' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'GED' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Application des corrections sur Design de l''application Efacture, Analyse UX % Design du site web SFEC', 'Application des corrections sur Design de l''application Efacture, Analyse UX % Design du site web SFEC', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Prototypage du projet ragec et demo en interne', '- Prototypage du projet ragec et demo en interne
- Tests et suivie et folow up des avancements sur le projet NSI
-  Présentation powerpoint de la solution du Ministère de la justice au DEP
- Participation au kick-off du projet egouv', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.1, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'Ragec' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'Maxia initiatives' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '## Projet NSIA', '## Projet NSIA

### 1. Participation aux réunions Daily Stand-up

Participation aux réunions quotidiennes de suivi du projet afin de :

* Présenter l''avancement des activités en cours ;
* Identifier et suivre les points bloquants ;
* Coordonner les actions avec les équipes métier, design et développement ;
* Assurer l''alignement sur les priorités du sprint et les échéances du projet.

### 2. Revue fonctionnelle des maquettes et accompagnement du designer

Analyse des maquettes proposées par l''équipe Design afin de :

* Vérifier leur conformité avec les besoins métiers et les exigences fonctionnelles ;
* Valider la prise en compte des règles de gestion et des différents cas d''utilisation ;
* Identifier les écarts, incohérences ou optimisations possibles dans les parcours utilisateurs ;
* Fournir des retours détaillés au designer pour améliorer l''expérience utilisateur et la couverture fonctionnelle ;
* Accompagner le designer dans la compréhension des processus métiers, des scénarios utilisateurs et des parcours cibles afin de garantir une traduction fidèle des besoins dans les interfaces proposées.

---

## Projet SFEC

### 1. Revue fonctionnelle des maquettes de l''application mobile

Analyse des écrans et parcours de l''application mobile afin de :

* Vérifier l''adéquation des maquettes avec les besoins métiers identifiés ;
* S''assurer de la cohérence des parcours utilisateurs et des flux fonctionnels ;
* Fournir des recommandations d''amélioration sur l''expérience utilisateur et la couverture des cas d''usage ;
* Collaborer avec le designer pour clarifier les processus métiers et les parcours utilisateurs prioritaires.

### 2. Tests fonctionnels de la nouvelle version des terminaux Datamega

Réalisation des tests fonctionnels sur la nouvelle version des terminaux Datamega afin de :

* Vérifier le comportement des fonctionnalités implémentées ;
* Valider la conformité des développements avec les exigences définies ;
* Identifier les anomalies ou régressions éventuelles ;
* Documenter les résultats des tests et communiquer les observations à l''équipe projet.

---

## Projet Ministère de la Justice

### 1. Activités de découverte et de cadrage du projet

Conduite des activités de compréhension du contexte métier afin de :

* Recueillir les besoins auprès des parties prenantes ;
* Comprendre les processus actuels et les problématiques rencontrées ;
* Identifier les objectifs de transformation attendus ;
* Définir les premiers éléments du périmètre fonctionnel.

### 2. Analyse et modélisation des processus métier (As-Is / To-Be)

Documentation et analyse des processus existants et cibles afin de :

* Cartographier le fonctionnement actuel des activités ;
* Identifier les points de friction, risques et opportunités d''amélioration ;
* Concevoir les processus cibles répondant aux objectifs métier ;
* Préparer les ateliers de validation et les futures spécifications fonctionnelles.

---

## Projet Maxi Initiatives

### Analyse des initiatives et recommandations fonctionnelles

Étude des initiatives proposées dans le cadre du projet afin de :

* Comprendre les objectifs métier visés ;
* Évaluer les impacts fonctionnels et opérationnels ;
* Identifier les contraintes, dépendances et risques potentiels ;
* Fournir des recommandations et retours structurés à l''équipe projet afin d''orienter les décisions et la priorisation des travaux.', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-28'::date, '2026-12-28'::date, 10, 'Audrey, Ibalico, Abed', 'approved' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-28'::date);
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'CNSS GED' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'Produit GED-WF' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Assistance post-déploiement à la CNSS : accompagnement des équipes métier dans la finalisation et la formalisation de la procédure d''enregistrement des assurés, depuis la saisie des informations jusqu''à la production et la remise des cartes. Analyse du processus existant, collecte des besoins utilis', 'Assistance post-déploiement à la CNSS : accompagnement des équipes métier dans la finalisation et la formalisation de la procédure d''enregistrement des assurés, depuis la saisie des informations jusqu''à la production et la remise des cartes. Analyse du processus existant, collecte des besoins utilisateurs et appui à la documentation des procédures opérationnelles. (GED CNSS)
Étude et analyse des modalités d''intégration des courriers de la DRC au sein de la GED CNSS. 
(Identification des besoins métiers, analyse des flux documentaires existants et proposition d''un mécanisme de liaison et de gestion des courriers dans le système.) (En cours )
Workflow de validation et suivi des validations ( En cours GED Akieni)
Suivi de courrier UBA ( En cours)
Suivi et formation de Daniel (stagiaire en cours)
Suivi des formation et integration avec les contribuables sur SFEC ( En cours)', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '"- Formations des agents économiques', '"- Formations des agents économiques 
- Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques 
-  tests efacture PGSFEC, Homologation, distributeur agrée
 - tests Homologation et distributeur agrée avec la DGID
- Creation des tickets pour amelioration efacture/Pgsfec', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-23'::date, '2027-01-08'::date, null, 'Jacque Dani', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-23'::date);
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Planiffier et suivre des formations avec des agents économiques', '- Planiffier et suivre des formations avec des agents économiques 
- Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Répondre aux mails des agents économiques
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques 
- Répondre au téléphone projet', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'esther.mban@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'esther.mban@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'esther.mban@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Formation des agents econmique', 'Formation des agents econmique
Mise à jour du fichier
Participer à la presentation d''efacture et faire une demo auprès de l''archer
Suivi de la refonte du design
création de ticket 
Test efacture dans le nouvel environnement', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-08-03'::date, '2026-08-14'::date, 5, 'Daniel Katoro', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-08-03'::date);
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 90 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Suivie avec l''équipe MPTN', 'Suivie avec l''équipe MPTN 
Suivie deu prototype Ragec 
Préparation des atelier avec AGORA
Prepartion des tests UAT post Cut over  SFEC
Suivie du prototype RAGEC', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-07-18'::date, '2026-07-28'::date, null, 'Jacques Dani , MarceL IB', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-07-18'::date);
with u as (select id from profiles where email = 'mawete.gatien@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Suivi des Travaux avec Data Mega - En cours', '- Suivi des Travaux avec Data Mega - En cours
- Documentation des cas de tests TCC/API (Homologation) (90%) - En cours
- UAT Terminaux Internes (80%) - En attente
- GAP Terminaux Data Mega vs Terminaux Interne (60%) - En cours
- UAT Sim MTN (90%) - En attente
- Suivi des bugs avec l''équipe dev
- Stratégie de mise à disposition des terminaux (30%) - En cours
- Specs taxes sectorielles (70%) - En cours
- Document zéro rating (90%) - En attente de retour', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'typhaine.mutombo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'typhaine.mutombo@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'LCDE', 'LCDE 
Rédaction de l''offre financière 
Définition de la cartographie / organigramme
Définition du planning discovery 
Rédaction des questionnaires par départements ciblés

AKIENI PAY - GIMAC
Etat des lieux du dossier déjà initié en 2025 
Rédaction de la note exéctuive pour la direction
Préparation de la documentation à mettre à jour : actualisation des documents, 
relance du contact GIMAC pour obtention, demande auprès équipe financière et technique

CNSS - E-paiement 
Etude pour la convetion tripartite CNSS/AKIENI/BGFI

CAR TRACKING
Organisation installation matériel de suivi de carburant
Réflexion stratégie de prospection 
Etude des prospects pote de la liste  d''UNICONGO', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'orphee.dita.ntsiona@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'Tous les projets en tant que PMO.' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 70 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'CNSS' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'prince.bouende@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'eGov' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'prince.bouende@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'SangVie' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 40 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'prince.bouende@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'SANGVIE', 'SANGVIE
Mener l''étude de cas SANGVIE auprès des parties prenantes
Formalisation des témoignages dans un carroussel type LinkedIn
Rédaction de l''étude de cas au format .pptx
Préparation des posts LinkedIn sur le projet
PNLIR
Préparation de l''offre financière PNLIR
Préparation du prototype PNLIR (Avec Alfa)

eGOV
Ateliers d''identification des parties prenantes', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-11-25'::date, '2026-12-31'::date, 26, 'Jacques Dani, Pasteur', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-11-25'::date);
with u as (select id from profiles where email = 'nedith.louzolo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-22'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-06-22'
  limit 1
),
proj as (select id from projects where name = 'Autre Support Projet' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;

-- Semaine du 2026-06-29
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'CarTracking' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'eGov' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Session de cadrage avec le ministere de l''enseignment superieur , commerce et jeunesse ( eGov)', 'Session de cadrage avec le ministere de l''enseignment superieur , commerce et jeunesse ( eGov)
Session de cadrage AGORA TECH, ADEN MPTEN
Presentation de la plateforme d''homologation a l''equipe support
Session des test avec la DGID sur la plateforme d''homologation', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-18'::date, '2026-12-23'::date, 4, 'Audrey, Nissi', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-18'::date);
with u as (select id from profiles where email = 'destino.alain.dello@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'destino.alain.dello@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'KAMOA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'destino.alain.dello@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'Akieni' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'GED' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Présentation powerpoint de la solution du ministère de la justice dévant le Dircab et le Dep', '- Présentation powerpoint de la solution du ministère de la justice dévant le Dircab et le Dep
- Ajustement du prototype Ragec et elaboration de la storylane
- Participation aux different réunion e-gouv avec les differents ministère
- Tests et suivie des avencement sur le projet NSIA
-', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.1, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'Ragec' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'Maxia initiatives' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '## Projet NSIA', '## Projet NSIA

1. Participation aux réunions Daily Stand-up
2. Revue fonctionnelle des maquettes et accompagnement du designer


## Projet SFEC

1. Revue fonctionnelle des maquettes de l''application mobile
2. Tests fonctionnels de la nouvelle version des terminaux Datamega


## Projet Ministère de la Justice

1. Activités de découverte et de cadrage du projet
2. Analyse et modélisation des processus métier (As-Is / To-Be)


## Projet Maxi Initiatives
1. Analyse des initiatives et recommandations fonctionnelles', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-28'::date, '2027-01-08'::date, 10, 'Audrey, Ibalico, Abed', 'approved' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-28'::date);
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.0, '"Assistance post-déploiement à la CNSS : accompagnement des équipes métier dans la finalisation et la formalisation de la procédure d''enregistrement des assurés, depuis la saisie des informations jusqu''à la production et la remise des cartes. Analyse du processus existant, collecte des besoins utilisateurs et appui à la documentation des procédures opérationnelles. (GED CNSS)
Suivi de courrier UBA ( En cours)
Réunion de travail avec Green Archive : échanges sur les modalités de partenariat.
Séance de travail avec les équipes d''eGOUV : démonstration de la solution GED(Akieni), collecte des retours utilisateurs, analyse des besoins et identification des améliorations fonctionnelles à intégrer.
Suivi des formation et integration avec les contribuables sur SFEC ( En cours)"', 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'CNSS GED' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'Produit GED-WF' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '"Assistance post-déploiement à la CNSS : accompagnement des équipes métier dans la finalisation et la formalisation de la procédure d''enregistrement des assurés, depuis la saisie des informations jusqu''à la production et la remise des cartes. Analyse du processus existant, collecte des besoins utili', '"Assistance post-déploiement à la CNSS : accompagnement des équipes métier dans la finalisation et la formalisation de la procédure d''enregistrement des assurés, depuis la saisie des informations jusqu''à la production et la remise des cartes. Analyse du processus existant, collecte des besoins utilisateurs et appui à la documentation des procédures opérationnelles. (GED CNSS)
Étude et analyse des modalités d''intégration des courriers de la DRC au sein de la GED CNSS. 
(Identification des besoins métiers, analyse des flux documentaires existants et proposition d''un mécanisme de liaison et de gestion des courriers dans le système.) (En cours )
Workflow de validation et suivi des validations ( Terniné GED Akieni)
Suivi de courrier UBA ( En cours)
Support( SFEC )', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '"- Formations des agents économiques', '"- Formations des agents économiques 
- Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques 
-  tests efacture PGSFEC, Homologation, distributeur agrée
 - tests Homologation et distributeur agrée avec la DGID
- Creation des tickets pour amelioration efacture/Pgsfec', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.1, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 70 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'Odoo interne' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Planiffier et suivre des formations avec des agents économiques', '- Planiffier et suivre des formations avec des agents économiques 
- Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Répondre aux mails des agents économiques
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'esther.mban@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'esther.mban@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'esther.mban@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'ABSENT', 'ABSENT', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-08-03'::date, '2026-08-14'::date, 5, 'Daniel Katoro', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-08-03'::date);
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 90 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Planning de déscente sur terrain', 'Planning de déscente sur terrain 
Organisation de sensibilisation SFEC 
Organisation de l''équipe BA 
Contact avec le centre de formation et suivie 
Suivie des fonctionalité restante V2 SFEC par Gatien et JD 
Mise en place dash board suivie des descentes', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'mawete.gatien@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Suivi des Travaux avec Data Mega - En cours', '- Suivi des Travaux avec Data Mega - En cours
- Documentation des cas de tests TCC/API (Homologation) (90%) - En cours
- UAT Terminaux Internes (80%) - En attente
- GAP Terminaux Data Mega vs Terminaux Interne (60%) - En cours
- UAT Sim MTN (90%) - En attente
- Suivi des bugs avec l''équipe dev
- Stratégie de mise à disposition des terminaux (30%) - En cours
- Specs taxes sectorielles (70%) - En cours
- Document zéro rating (90%) - En attente de retour', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'typhaine.mutombo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.2, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'orphee.dita.ntsiona@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'Tous les projets en tant que PMO.' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 70 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'CNSS' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'prince.bouende@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'FHN' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 40 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-11-25'::date, '2026-12-31'::date, 26, 'Jacques Dani, Pasteur', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-11-25'::date);
with u as (select id from profiles where email = 'nedith.louzolo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-06-29'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-06-29'
  limit 1
),
proj as (select id from projects where name = 'Autre Support Projet' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;

-- Semaine du 2026-07-06
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'CarTracking' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 40 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'eGov' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 40 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Support Homologation : Reunions de support avec MTI, Alpha  digital services', 'Support Homologation : Reunions de support avec MTI, Alpha  digital services

Revue des modèles ministériels — Fiche de cadrage & Questionnaire ( eGov)
Atelier avec le Ministère de la santé ( eGov)
SFEC - ANSSI _ Revue du référentiel et présentation de la plateform', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-18'::date, '2026-12-23'::date, 4, 'Audrey, Nissi', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-18'::date);
with u as (select id from profiles where email = 'destino.alain.dello@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'destino.alain.dello@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'KAMOA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'destino.alain.dello@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'Akieni' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'GED' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Présentation du prototype Ragec au directeur commerciale de ragec', '- Présentation du prototype Ragec au directeur commerciale de ragec
- Atélier d''identification du ROI avec  RAGEC 
- Séance de travaille avec Agora sur le questionnaire du ministaire de la justice
- Tests et suivie des avencement sur le projet NSIA', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.1, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'Ragec' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'Maxia initiatives' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '## Projet NSIA', '## Projet NSIA

1. Participation aux réunions Daily Stand-up
2. Revue fonctionnelle des maquettes et accompagnement du designer


## Projet SFEC

1. Revue fonctionnelle des maquettes de l''application mobile
2. Tests fonctionnels de la nouvelle version des terminaux Datamega


## Projet Ministère de la Justice

1. Activités de découverte et de cadrage du projet
2. Analyse et modélisation des processus métier (As-Is / To-Be)


## Projet Maxi Initiatives
1. Analyse des initiatives et recommandations fonctionnelles

### Ragec :
- Proposition tecthinque review', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-28'::date, '2027-01-08'::date, 10, 'Audrey, Ibalico, Abed', 'approved' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-28'::date);
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.0, '"Assistance post-déploiement à la CNSS : accompagnement des équipes métier dans la finalisation et la formalisation de la procédure d''enregistrement des assurés, depuis la saisie des informations jusqu''à la production et la remise des cartes. Analyse du processus existant, collecte des besoins utilisateurs et appui à la documentation des procédures opérationnelles. (GED CNSS)
Suivi de courrier UBA ( En cours)
Réunion de travail avec Green Archive : échanges sur les modalités de partenariat.
Séance de travail avec les équipes d''eGOUV : démonstration de la solution GED(Akieni), collecte des retours utilisateurs, analyse des besoins et identification des améliorations fonctionnelles à intégrer.
Suivi des formation et integration avec les contribuables sur SFEC ( En cours)"', 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'CNSS GED' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'Produit GED-WF' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '"Assistance post-déploiement à la CNSS : accompagnement des équipes métier dans la finalisation et la formalisation de la procédure d''enregistrement des assurés, depuis la saisie des informations jusqu''à la production et la remise des cartes. Analyse du processus existant, collecte des besoins utili', '"Assistance post-déploiement à la CNSS : accompagnement des équipes métier dans la finalisation et la formalisation de la procédure d''enregistrement des assurés, depuis la saisie des informations jusqu''à la production et la remise des cartes. Analyse du processus existant, collecte des besoins utilisateurs et appui à la documentation des procédures opérationnelles. (GED CNSS)
Étude et analyse des modalités d''intégration des courriers de la DRC au sein de la GED CNSS. 
(Identification des besoins métiers, analyse des flux documentaires existants et proposition d''un mécanisme de liaison et de gestion des courriers dans le système.) (En cours )
Workflow de validation et suivi des validations ( Terniné GED Akieni)
Suivi de courrier UBA ( En cours)
Support( SFEC )', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.0, 'certaines activités sont continu, notamment le support, tests', 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '"- Formations des agents économiques', '"- Formations des agents économiques 
- Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques 
-  tests efacture PGSFEC, Homologation, distributeur agrée
 - tests Homologation et distributeur agrée avec la DGID
- Creation des tickets pour amelioration efacture/Pgsfec
- Suivie des debours
- Suivie des factures d''avoir', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.1, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 70 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'Odoo interne' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Planiffier et suivre des formations avec des agents économiques', '- Planiffier et suivre des formations avec des agents économiques 
- Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Répondre aux mails des agents économiques
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques 
- Descente auprès des agents économique pour la sensibilisation', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'esther.mban@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'esther.mban@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-08-03'::date, '2026-08-14'::date, 5, 'Daniel Katoro', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-08-03'::date);
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 90 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'mawete.gatien@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.0, 'Fichier cahier de test API terminé', 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Suivi des Travaux avec Data Mega - En cours', '- Suivi des Travaux avec Data Mega - En cours
- Documentation des cas de tests TCC/API (Homologation) (90%) - En cours
- UAT Terminaux Internes (80%) - En attente
- GAP Terminaux Data Mega vs Terminaux Interne (60%) - En cours
- UAT Sim MTN (90%) - En attente
- Suivi des bugs avec l''équipe dev
- Stratégie de mise à disposition des terminaux (30%) - En cours
- Specs taxes sectorielles (80%) - En cours
- Document zéro rating (90%) - En attente de retour
- Document v2 sfec (40%) - en cours
- Assistance équipe support', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'typhaine.mutombo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.2, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'typhaine.mutombo@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'E-PAIEMENT CNSS', 'E-PAIEMENT CNSS 
Session tests d''intrégration BGFI
Rédaction du PV  de recette
Rédaction de la convention tripartite

COLLABORATION AIRTEL 
Présentation de l''initiative de l''hackathon sheleadsdigital au DG d''Airtel

SUPPORT SFEC
Création des entreprises 
Participation au sessions de formation des contributables', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'orphee.dita.ntsiona@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'Tous les projets en tant que PMO.' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 70 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'CNSS' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.1, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'prince.bouende@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'eGov' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 60 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'prince.bouende@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'prince.bouende@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'BENCH', 'BENCH
Présentation du prototype PNLIR au client

SFEC
Discussions SFEC autour des problématiques de types de factures potentiels V2
Rédaction d''un document de backlog SFEC potentiels V2

eGov
Cadrage e-Gov : Note de cadrage
Atelier avec le Ministère de la Santé et de la Population
Amélioration du questionnaire de recueil de besoins pour le Ministère des Affaires étrangères', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-11-25'::date, '2026-12-31'::date, 26, 'Jacques Dani, Pasteur', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-11-25'::date);
with u as (select id from profiles where email = 'nedith.louzolo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-06'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-07-06'
  limit 1
),
proj as (select id from projects where name = 'Autre Support Projet' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;

-- Semaine du 2026-07-13
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'CarTracking' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'eGov' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Support Homologation : MTI, ALPHA DIGITAL  ( Homologation)', '- Support Homologation : MTI, ALPHA DIGITAL  ( Homologation)
- Mis a jour des notes de cadrages, questionnaires et courriers ( eGov)
-  Mis a jour du registre des ministeres et des services par phases ( eGov)
-  Redaction des specifications pour la plateforme d''homologation v2', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-18'::date, '2026-12-23'::date, 4, 'Audrey', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-18'::date);
with u as (select id from profiles where email = 'destino.alain.dello@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'destino.alain.dello@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'KAMOA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'destino.alain.dello@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'Akieni' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'GED' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Elaboration du questionnaire de cadrage pour le projet du ministère de la justice', '- Elaboration du questionnaire de cadrage pour le projet du ministère de la justice
- Ajustements des questionnaire prioritaire pour le projet e-gov
- Traivaille de SQUAD avec les agent MPT sur les les questionnaire des ministère qui nous sont assigné
- Atélier question reponse avec le DEP du ministère de la justice et le DSI
- Tests et suivie des avencement sur le projet NSIA
-  Descente de terrain au ministère de la justice TGI, interview avec le DEP et le  greffier en chef', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.1, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'Ragec' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'Maxia initiatives' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '## Projet NSIA', '## Projet NSIA

1. Participation aux réunions Daily Stand-up
2. Préparation des Test fonctionnelle de la plateforme NSIA Loan


## Projet SFEC

1. Organisation de Test de l''application mobile E-Facture
2. Suivi des activités de développement de l''app. Datamega conforment au scope de la phase 1. (Organisation des UAT)


## Projet Ministère de la Justice

1. Activités de découverte et de cadrage du projet
2. Requirements gatherings (sessions au ministère au TGI)


## CAMU
1. Suivi des activités de développement des API pour Airtel et Momo V2
2. Test des APIs développés et support à l''équipe CAMU

## Projet E-Gov
1. Participation aux sessions de cadrages et de requirements gathering

Ragec :
- Proposition tecthinque review et offre technique', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-28'::date, '2027-01-08'::date, 10, 'Audrey, Ibalico, Abed', 'approved' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-28'::date);
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.0, '"Assistance post-déploiement à la CNSS : accompagnement des équipes métier dans la finalisation et la formalisation de la procédure d''enregistrement des assurés, depuis la saisie des informations jusqu''à la production et la remise des cartes. Analyse du processus existant, collecte des besoins utilisateurs et appui à la documentation des procédures opérationnelles. (GED CNSS)
Suivi de courrier UBA ( En cours)
Réunion de travail avec Green Archive : échanges sur les modalités de partenariat.
Séance de travail avec les équipes d''eGOUV : démonstration de la solution GED(Akieni), collecte des retours utilisateurs, analyse des besoins et identification des améliorations fonctionnelles à intégrer.
Suivi des formation et integration avec les contribuables sur SFEC ( En cours)"', 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'CNSS GED' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'Produit GED-WF' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '"Assistance post-déploiement à la CNSS : accompagnement des équipes métier dans la finalisation et la formalisation de la procédure d''enregistrement des assurés, depuis la saisie des informations jusqu''à la production et la remise des cartes. Analyse du processus existant, collecte des besoins utili', '"Assistance post-déploiement à la CNSS : accompagnement des équipes métier dans la finalisation et la formalisation de la procédure d''enregistrement des assurés, depuis la saisie des informations jusqu''à la production et la remise des cartes. Analyse du processus existant, collecte des besoins utilisateurs et appui à la documentation des procédures opérationnelles. (GED CNSS)
Étude et analyse des modalités d''intégration des courriers de la DRC au sein de la GED CNSS. 
 
Suivi du dysfonctionnement entre l''ERP et la GED CNSS
E-GOV : Atelier avec le M de la Santé et de la Pop
E-GOV:Ministére de la jeunesse: l’Académie Numérique de la Jeunesse, la Plateforme d’Éducation Civique en Ligne, la Fabrique Civique et les Marathons de Conception Numérique.(En cours)
(Identification des besoins métiers, analyse des flux documentaires existants et proposition d''un mécanisme de liaison et de gestion des courriers dans le système.) (En cours )
Workflow de validation et suivi des validations ( Terniné GED Akieni)
Suivi de courrier UBA ( En cours)
Support( SFEC )', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '"- Formations des agents économiques', '"- Formations des agents économiques 
- Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques 
-  tests efacture PGSFEC, Homologation, distributeur agrée
 - tests Homologation et distributeur agrée avec la DGID
- Creation des tickets pour amelioration efacture/Pgsfec
- Présentation e-facture lors de la séance de sensibilisation UNOQ
- Finalisation des projet de courriers en reponses au agents economiques pour la DGID
- Presentation des supports de formation projet SFEC pour les points focaux
- Assistance à l''équipe support', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '-  Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.', '-  Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Répondre aux mails des agents économiques
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques 
- Coordonner l’équipe de sensibilisation chargée des interventions sur le terrain (Daniel et Merveilles).
- Assister l''équipe support sur certaines problématiques 
- Mettre à jour le tutoriel PGSFEC sur Storylane', 'in_progress', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'esther.mban@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'esther.mban@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'esther.mban@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'OFF', 'OFF', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'OFF', 'OFF', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-08-03'::date, '2026-08-14'::date, 5, 'Daniel Katoro', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-08-03'::date);
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 90 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Entretien avec les partenaires World Winner pour une equipe descente de terrrain', '- Entretien avec les partenaires World Winner pour une equipe descente de terrrain
- revue de tous les consultans et evolutions de pipes
- Revue des points bloquants sur tous les projets 
- Cadrage et projection sur les réunions sensibilisationavec UNICONGO pour SFEC', 'in_progress', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'mawete.gatien@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Suivi des Travaux avec Data Mega - En cours', '- Suivi des Travaux avec Data Mega - En cours
- Documentation des cas de tests TCC (Homologation) (90%) - En cours
- UAT Terminaux Internes (80%) - En attente
- GAP Terminaux Data Mega vs Terminaux Interne (60%) - En cours
- UAT Sim MTN (90%) - En attente
- Suivi des bugs avec l''équipe dev
- Stratégie de mise à disposition des terminaux (30%) - En cours
- Specs taxes sectorielles (80%) - En cours
- Document zéro rating (90%) - En attente de retour
- Document v2 sfec (40%) - en cours
- Assistance équipe support', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'typhaine.mutombo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.2, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'typhaine.mutombo@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'CONGO PAY - GIMAC :', 'CONGO PAY - GIMAC : 
- Réunion cadrage dossier GIMAC avec M. Brice - done 
- Rédifier et envoyer le courrier de demande de partenariat technique avec DG ADEN - Done 
- Business plan - in progress
- Planifier réunion avec DG ADEN - in progress

 COLLABORATION AIRTEL : 
- Création support de présentation Hackhation #sheleadsdigital - done
- Définition des nexts steps pour l''offre commerciale- done 
- Livrable pour l''offre commerciale - in progress
- Planifier réunion avec Franck pour définir l''offre commerciale - in progress

LCDE : 
Revoir l''offre avec Franck et soumettre l''offre - En cours

E- Paiement CNSS 
Rédaction PV de recette - envoyer à BGDFI pour validation
Convention tripartite BGFI / AKIENI/ CNSS - envoyé à BGFI pour relecture et validation 

SUPPORT SFEC : 
Création des entreprises 
Participation au sessions de formation des contributables', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'orphee.dita.ntsiona@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'Tous les projets en tant que PMO.' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 70 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'CNSS' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'prince.bouende@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'eGov', 'eGov
Cadrage e-Gov : Notes de cadrage Ministères pris en P1
Revue et amélioration des questionnaires, collaboration avec les parties prenantes', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-11-25'::date, '2026-12-31'::date, 26, 'Jacques Dani, Pasteur', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-11-25'::date);
with u as (select id from profiles where email = 'nedith.louzolo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-13'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-07-13'
  limit 1
),
proj as (select id from projects where name = 'Autre Support Projet' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;

-- Semaine du 2026-07-20
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0, 'Sur la plateforme d''homologation depuis le 16 juillet j''ai partager les changement a faire dans le canal, 
aucun point n''a ete fait avec les devs jusqu''a ce jour', 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'eGov' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'eden.ngouanda@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Session de cadrage Ministere de l''enseignement prescolaire, primaire, secondaire et de l''alphabetisation', '- Session de cadrage Ministere de l''enseignement prescolaire, primaire, secondaire et de l''alphabetisation
- Session de cadrage Ministere de l''assainissement 
- Session de travail Ministere du commerce : Etat de lieu sur la messagerie et du site web
-  Redaction des specifications pour la plateforme d''homologation v2', 'in_progress', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-18'::date, '2026-12-23'::date, 4, 'Audrey, Nissi', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-18'::date);
with u as (select id from profiles where email = 'destino.alain.dello@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'destino.alain.dello@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'KAMOA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'destino.alain.dello@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'Akieni' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 50 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'SMS Congo' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'Cartracking' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'daniel.katoro@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'pasteur.abed.apipi.bouya@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.1, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'Ragec' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 25 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'Maxia initiatives' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 15 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'jacques.dani.ntalemba@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '## Projet NSIA', '## Projet NSIA

1. Participation aux réunions Daily Stand-up
2. Préparation des Test fonctionnelle de la plateforme NSIA Loan


## Projet SFEC

1. Organisation de Test de l''application mobile E-Facture
2. Suivi des activités de développement de l''app. Datamega conforment au scope de la phase 1. (Organisation des UAT)


## Projet Ministère de la Justice

1. Activités de découverte et de cadrage du projet
2. Requirements gatherings (sessions au ministère au TGI)


## CAMU
1. Suivi des activités de développement des API pour Airtel et Momo V2
2. Test des APIs développés et support à l''équipe CAMU

## Projet E-Gov
1. Participation aux sessions de cadrages et de requirements gathering

Ragec :
- Proposition tecthinque review et offre technique', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-28'::date, '2027-01-08'::date, 10, 'Audrey, Ibalico, Abed', 'approved' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-28'::date);
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.0, 'Suivi du dysfonctionnement entre l''ERP et la GED  (GED CNSS)(En cours)
Suivi de courrier UBA ( En cours)
Envoie du corrier à Green Archive : revue et validation sur les modalités de partenariat.
Séance de travail avec les équipes d''eGOUV : 
Suivi des formation et integration avec les contribuables sur SFEC ( En cours)"', 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'CNSS GED' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'Produit GED-WF' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'reine.malouono.mapila@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'Suivi du dysfonctionnement entre l''ERP et la GED CNSS', 'Suivi du dysfonctionnement entre l''ERP et la GED CNSS 
Réunion techniques sur l''intégration ERP/GED CNSS (Encors)

E-GOV : Atelier de cadrage avec le Ministère des Affaires Sociales 
E-GOV :  Atelier de cadrage avec le Ministère des Hydrocarbures
E-GOV :  Réunion avec le MASAH (Ministère des Affaires Sociales)
E-GOV :  Atelier Ministère  Assainissement Urbain (Extérieur)
E-GOV :  AtelierMin Agriculture  (Extérieur) 
E-GOV : Préparation des lettres de transmission des courriers destinés aux ministères de l''Enseignement primaire, des Affaires sociales, des Hydrocarbures et des Sports.

Mails de transmission du NDA à Green Archives
 
Point Province de Kinshasa (Opportunité Akieni)

Support( SFEC )', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'marcel.batchi.ibalico@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '"- Formations des agents économiques', '"- Formations des agents économiques 
- Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques 
-  tests efacture PGSFEC, Homologation, distributeur agrée
 - tests Homologation et distributeur agrée avec la DGID
- Creation des tickets pour amelioration efacture/Pgsfec
- Présentation e-facture lors de la séance de sensibilisation UNOQ
- Finalisation des projet de courriers en reponses au agents economiques pour la DGID
- Presentation des supports de formation projet SFEC pour les points focaux
- Assistance à l''équipe support', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.1, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 70 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'Odoo interne' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'indrix.muriel.abolawe@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Planiffier et suivre des formations avec des agents économiques', '- Planiffier et suivre des formations avec des agents économiques 
- Aider les agents économiques dans leur intégration API, TCC, TFC en faisant intervenir les personnes dédiées.  
- Répondre aux mails des agents économiques
- Accompagner les agents économique rencontrant des difficultés fonctionnelles ou techniques 
- Onborder les nouveaux agents économiques 
- Leader l''équipe de sensibilisation qui descend sur le terrain', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'esther.mban@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'esther.mban@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'alfa.zihal@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-08-03'::date, '2026-08-14'::date, 5, 'Daniel Katoro', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-08-03'::date);
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 90 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'audrey.mabiala@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 10 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'mawete.gatien@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 100 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'mawete.gatien@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, '- Suivi des Travaux avec Data Mega - En cours', '- Suivi des Travaux avec Data Mega - En cours
- Documentation des cas de tests TCC (Homologation) (90%) - En cours
- UAT Terminaux Internes (80%) - En attente
- GAP Terminaux Data Mega vs Terminaux Interne (90%) - En cours
- UAT Sim MTN (90%) - En attente
- Suivi des bugs avec l''équipe dev
- Specs taxes sectorielles (80%) - En cours
- Document zéro rating (90%) - En attente de retour
- Document v2 sfec (50%) - en cours
- Assistance équipe support', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'typhaine.mutombo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.2, 'CONGO PAY - GIMAC : 
- Finaliser Business plan - Done
- Réunion M.Brice et équipe technique -  Done
- Collecter le dossier technique auprès de Jacques N. - in progress
- Suivre l''avancement de mise à jour des document ADEN x GIMAC - avenant en cours M. ITOUMOU - In progress
- Rédaction du protcole d''accord ADEN x AKIENI - in progress
- Rédaction cahier des charges fonctionnelles - to -do

 COLLABORATION AIRTEL : 
- Offre Hackathon nationale - Done 


E- Paiement CNSS 
Réunion d''avancement avec BGFI et YAO Corp- Done
Réunion de revue de la convention - to-do
Suivi des points techniques : chiffrement et preuves de sécurité : In progress
Suivi déploiement API Cash out  et tests paiements cash out - in prgress', 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'typhaine.mutombo@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'CONGO PAY - GIMAC :', 'CONGO PAY - GIMAC : 
- Réunion cadrage dossier GIMAC avec M. Brice - Done 
- Rédifier et envoyer le courrier de demande de partenariat technique avec DG ADEN - Done 
- Finaliser Business plan - in progress
- Planifier et préparer la réunion avec DG ADEN - Done
- Collecter le dossier technique auprès de Jacques N. - in progress
- Suivre l''avancement de mise à jour des document ADEN x GIMAC - avenant en cours M. ITOUMOU - In progress

 COLLABORATION AIRTEL : 
- Création support de présentation Hackhation #sheleadsdigital - done
- Définition des nexts steps pour l''offre commerciale- done 
-  recontacter participants pour obtenir les livrable pour l''offre commerciale "Women in tecn- done 
- Planifier réunion avec Franck pour définir l''offre commerciale - done
- Finaliser l''offre commerciale Women in tech - done
- Offre Hackathon nationale - to do


LCDE : 
Revoir l''offre avec Franck et soumettre l''offre à LCDE - Done 

E- Paiement CNSS 
Rédaction PV de recette - envoyer à BGDFI pour validation - Done
Convention tripartite BGFI / AKIENI/ CNSS - envoyé à BGFI pour relecture et validation - done
Réunion de revue de la convention - in progress
Suivi des points techniques : chiffrement et preuves de sécurité : In progress', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'orphee.dita.ntsiona@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'Tous les projets en tant que PMO.' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 70 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'orphee.dita.ntsiona@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'CNSS' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 30 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.6, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'prince.bouende@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'FHN' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 40 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'prince.bouende@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
)
insert into deliverables (plan_id, title, description, status, priority)
select p.id, 'MINISTERE DU COMMERCE', 'MINISTERE DU COMMERCE
- Atelier d''évaluation de la maturité numérique du site web
- Rédaction du compte-rendu

MINISTERE DE L''ENSEIGNEMENT PRESCOLAIRE, PRIMAIRE,SECONDAIRE & DE L''ALPHABETISATION
- Atelier de prise de contact : Présentation du projet egov & Recueil high-level du besoin
- Rédaction du compte-rendu 

MINISTERE DE L''ASSAINISSEMENT
- Atelier de prise de contact : Présentation du projet egov & Recueil high-level du besoin
- Rédaction du compte-rendu', 'done', 'medium' from p
where not exists (select 1 from deliverables where plan_id = p.id);
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-11-25'::date, '2026-12-31'::date, 26, 'Jacques Dani, Pasteur', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-11-25'::date);
with u as (select id from profiles where email = 'nedith.louzolo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-07-20'::date, 0.0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 80 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;
with p as (
  select wp.id from weekly_plans wp
  join profiles pr on pr.id = wp.user_id
  where pr.email = 'nedith.louzolo@ba-tracker.local' and wp.week_start = '2026-07-20'
  limit 1
),
proj as (select id from projects where name = 'Autre Support Projet' limit 1)
insert into plan_projects (plan_id, project_id, allocation_percent)
select p.id, proj.id, 20 from p, proj
on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;

-- Semaine du 2026-09-21
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-18'::date, '2026-12-31'::date, 10, NULL, 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-18'::date);
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-18'::date, '2027-01-17'::date, null, NULL, 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-18'::date);
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-09-21'::date, '2026-07-15'::date, null, NULL, 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-09-21'::date);
with u as (select id from profiles where email = 'esther.mban@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'mawete.gatien@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'typhaine.mutombo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'karhyt.mboungou@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'daniel.jedheon@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-21'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;

-- Semaine du 2026-09-28
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-18'::date, '2026-12-31'::date, 10, NULL, 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-18'::date);
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'esther.mban@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'mawete.gatien@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'typhaine.mutombo@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'karhyt.mboungou@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'daniel.jedheon@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-09-28'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;

-- Semaine du 2026-10-05
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-18'::date, '2026-12-31'::date, 10, NULL, 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-18'::date);
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-09-21'::date, '2026-10-14'::date, 21, 'Esther Mban/ Equipe support N1', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-09-21'::date);
with u as (select id from profiles where email = 'esther.mban@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'mawete.gatien@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'karhyt.mboungou@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'daniel.jedheon@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-05'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;

-- Semaine du 2026-10-12
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-12-16'::date, '2026-12-31'::date, 15, NULL, 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-12-16'::date);
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1)
insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)
select u.id, '2026-09-21'::date, '2026-10-14'::date, 21, 'Esther Mban/ Equipe support N1', 'requested' from u
where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = '2026-09-21'::date);
with u as (select id from profiles where email = 'esther.mban@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'mawete.gatien@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'karhyt.mboungou@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;
with u as (select id from profiles where email = 'daniel.jedheon@ba-tracker.local' limit 1)
insert into weekly_plans (user_id, week_start, bench, general_comments, status)
select u.id, '2026-10-12'::date, 0, NULL, 'validated' from u
on conflict (user_id, week_start) do nothing;

-- 3. Affectations user ↔ projet (déduites de l'historique)

with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'CarTracking' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'eden.ngouanda@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'eGov' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'destino.alain.dello@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'KAMOA' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'destino.alain.dello@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'Akieni' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'Cartracking' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'GED' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SMS Congo' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'daniel.katoro@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'pasteur.abed.apipi.bouya@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'Maxia initiatives' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'Ragec' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'MinJustice' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'jacques.dani.ntalemba@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'Produit GED-WF' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'reine.malouono.mapila@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'CNSS GED' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'marcel.batchi.ibalico@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'Odoo interne' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'indrix.muriel.abolawe@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'esther.mban@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'CarTracking' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'PNLIR' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'alfa.zihal@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'NSIA' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'audrey.mabiala@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'eGouv' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'mawete.gatien@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'orphee.dita.ntsiona@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'CNSS' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'orphee.dita.ntsiona@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'Tous les projets en tant que PMO.' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'FHN' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SangVie' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'eGov' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'prince.bouende@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'nedith.louzolo@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'SFEC' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;
with u as (select id from profiles where email = 'nedith.louzolo@ba-tracker.local' limit 1),
proj as (select id from projects where name = 'Autre Support Projet' limit 1)
insert into assignments (user_id, project_id) select u.id, proj.id from u, proj
on conflict (user_id, project_id) do nothing;

-- Terminé.