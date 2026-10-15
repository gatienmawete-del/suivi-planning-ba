-- =====================================================================
-- 003 - Rôle "viewer" : lecture seule sur toutes les données équipe
-- =====================================================================

-- 1. Ajouter la valeur à l'enum (sans erreur si déjà fait)
alter type user_role add value if not exists 'viewer';

-- 2. Helper : peut lire les données de toute l'équipe (admin OU viewer)
--    (comparaison en texte pour éviter le problème "unsafe use of new enum value")
create or replace function public.can_read_all()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role::text in ('admin', 'viewer') from public.profiles where id = auth.uid()),
    false
  );
$$;

grant execute on function public.can_read_all() to authenticated;

-- 3. Policies de LECTURE pour le viewer (aucune écriture)
drop policy if exists "weekly_plans: viewer reads all" on public.weekly_plans;
create policy "weekly_plans: viewer reads all"
  on public.weekly_plans for select
  to authenticated
  using (public.can_read_all());

drop policy if exists "plan_projects: viewer reads all" on public.plan_projects;
create policy "plan_projects: viewer reads all"
  on public.plan_projects for select
  to authenticated
  using (public.can_read_all());

drop policy if exists "deliverables: viewer reads all" on public.deliverables;
create policy "deliverables: viewer reads all"
  on public.deliverables for select
  to authenticated
  using (public.can_read_all());

drop policy if exists "objectives: viewer reads all" on public.objectives;
create policy "objectives: viewer reads all"
  on public.objectives for select
  to authenticated
  using (public.can_read_all());

drop policy if exists "vacations: viewer reads all" on public.vacations;
create policy "vacations: viewer reads all"
  on public.vacations for select
  to authenticated
  using (public.can_read_all());
