-- Add project_id to objectives table to link objectives to projects
alter table public.objectives
  add column project_id uuid references public.projects(id) on delete set null;

create index objectives_project_idx on public.objectives(project_id);
