-- =====================================================================
-- BA Tracker - Schéma initial
-- =====================================================================
-- Convention: les semaines commencent toujours le LUNDI (week_start).
-- Les permissions sont contrôlées par Row Level Security + helper is_admin().

-- Extensions utilitaires
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 1. profiles - données utilisateur (lié à auth.users)
-- =====================================================================
create type user_role as enum ('admin', 'ba');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  service_line text,                 -- Produit, UX, Consultant, BA, PMO, Support, Manager BA, Lead BA
  role user_role not null default 'ba',
  avatar_color text default '#3b82f6',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_active_idx on public.profiles(active);

-- =====================================================================
-- 2. projects - catalogue des projets (ownership d'activité)
-- =====================================================================
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,              -- SFEC, eGov, NSIA, ...
  name text not null,
  description text,
  color text default '#64748b',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index projects_active_idx on public.projects(active);

-- =====================================================================
-- 3. assignments - affectation user <-> projet (fixée par l'admin)
-- =====================================================================
create table public.assignments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  default_allocation smallint,            -- pourcentage de base attendu (0-100)
  created_at timestamptz not null default now(),
  unique (user_id, project_id)
);

create index assignments_user_idx on public.assignments(user_id);
create index assignments_project_idx on public.assignments(project_id);

-- =====================================================================
-- 4. weekly_plans - entrée hebdomadaire par BA
-- =====================================================================
create type plan_status as enum ('draft', 'submitted', 'validated');

create table public.weekly_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,               -- lundi de la semaine
  bench numeric(3,2) default 0,           -- fraction d'inoccupation 0..1
  general_comments text,
  status plan_status not null default 'draft',
  submitted_at timestamptz,
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index weekly_plans_user_idx on public.weekly_plans(user_id);
create index weekly_plans_week_idx on public.weekly_plans(week_start);

-- =====================================================================
-- 5. plan_projects - répartition projets dans la semaine
-- =====================================================================
create table public.plan_projects (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references public.weekly_plans(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  allocation_percent smallint not null check (allocation_percent >= 0 and allocation_percent <= 100),
  created_at timestamptz not null default now(),
  unique (plan_id, project_id)
);

create index plan_projects_plan_idx on public.plan_projects(plan_id);

-- =====================================================================
-- 6. deliverables - livrables / tâches de la semaine (kanban)
-- =====================================================================
create type deliverable_status as enum ('todo', 'in_progress', 'blocked', 'done');
create type deliverable_priority as enum ('low', 'medium', 'high', 'critical');

create table public.deliverables (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references public.weekly_plans(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  status deliverable_status not null default 'todo',
  priority deliverable_priority not null default 'medium',
  due_date date,
  completed_at timestamptz,
  order_idx int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deliverables_plan_idx on public.deliverables(plan_id);
create index deliverables_status_idx on public.deliverables(status);

-- =====================================================================
-- 7. objectives - objectifs hebdo / mensuels par BA
-- =====================================================================
create type objective_status as enum ('pending', 'on_track', 'at_risk', 'done');

create table public.objectives (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.weekly_plans(id) on delete set null,
  title text not null,
  description text,
  target_date date,
  status objective_status not null default 'pending',
  progress smallint not null default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index objectives_user_idx on public.objectives(user_id);
create index objectives_plan_idx on public.objectives(plan_id);

-- =====================================================================
-- 8. vacations - demandes de congé
-- =====================================================================
create type vacation_status as enum ('requested', 'approved', 'rejected', 'cancelled');

create table public.vacations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  days_count smallint,
  interim_user_id uuid references public.profiles(id) on delete set null,
  interim_text text,                      -- nom libre si pas d'user
  status vacation_status not null default 'requested',
  comments text,
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index vacations_user_idx on public.vacations(user_id);
create index vacations_status_idx on public.vacations(status);

-- =====================================================================
-- 9. activity_log - journal d'activité (audit léger)
-- =====================================================================
create table public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,                   -- 'plan.submit', 'deliverable.create', 'vacation.approve', ...
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_user_idx on public.activity_log(user_id);
create index activity_log_created_idx on public.activity_log(created_at desc);

-- =====================================================================
-- Fonction helper is_admin()
-- =====================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- =====================================================================
-- Trigger updated_at
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_weekly_plans_updated_at
  before update on public.weekly_plans
  for each row execute function public.set_updated_at();

create trigger trg_deliverables_updated_at
  before update on public.deliverables
  for each row execute function public.set_updated_at();

create trigger trg_objectives_updated_at
  before update on public.objectives
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Trigger pour auto-créer le profil à l'inscription
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, service_line)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'ba'),
    new.raw_user_meta_data->>'service_line'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.assignments enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.plan_projects enable row level security;
alter table public.deliverables enable row level security;
alter table public.objectives enable row level security;
alter table public.vacations enable row level security;
alter table public.activity_log enable row level security;

-- profiles
create policy "profiles: everyone reads"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles: user updates own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: admin writes"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- projects
create policy "projects: everyone reads"
  on public.projects for select
  to authenticated
  using (true);

create policy "projects: admin writes"
  on public.projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- assignments
create policy "assignments: everyone reads"
  on public.assignments for select
  to authenticated
  using (true);

create policy "assignments: admin writes"
  on public.assignments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- weekly_plans - BA voit/édite les siens, admin voit tout
create policy "weekly_plans: read own or admin"
  on public.weekly_plans for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "weekly_plans: user manages own"
  on public.weekly_plans for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "weekly_plans: admin manages all"
  on public.weekly_plans for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- plan_projects
create policy "plan_projects: read via plan"
  on public.plan_projects for select
  to authenticated
  using (
    exists (
      select 1 from public.weekly_plans p
      where p.id = plan_id and (p.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "plan_projects: write via plan"
  on public.plan_projects for all
  to authenticated
  using (
    exists (
      select 1 from public.weekly_plans p
      where p.id = plan_id and (p.user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.weekly_plans p
      where p.id = plan_id and (p.user_id = auth.uid() or public.is_admin())
    )
  );

-- deliverables
create policy "deliverables: read via plan"
  on public.deliverables for select
  to authenticated
  using (
    exists (
      select 1 from public.weekly_plans p
      where p.id = plan_id and (p.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "deliverables: write via plan"
  on public.deliverables for all
  to authenticated
  using (
    exists (
      select 1 from public.weekly_plans p
      where p.id = plan_id and (p.user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.weekly_plans p
      where p.id = plan_id and (p.user_id = auth.uid() or public.is_admin())
    )
  );

-- objectives
create policy "objectives: read own or admin"
  on public.objectives for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "objectives: user manages own"
  on public.objectives for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "objectives: admin manages all"
  on public.objectives for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- vacations
create policy "vacations: read own or admin"
  on public.vacations for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "vacations: user creates own"
  on public.vacations for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "vacations: user updates own pending"
  on public.vacations for update
  to authenticated
  using (user_id = auth.uid() and status = 'requested')
  with check (user_id = auth.uid());

create policy "vacations: admin manages all"
  on public.vacations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- activity_log
create policy "activity_log: admin reads"
  on public.activity_log for select
  to authenticated
  using (public.is_admin() or user_id = auth.uid());

create policy "activity_log: authenticated inserts"
  on public.activity_log for insert
  to authenticated
  with check (true);
