import { createClient } from "@/lib/supabase/server";
import { mondayOf, isoDate, weekLabel } from "@/lib/utils";
import { ensureWeeklyPlan } from "@/lib/actions/planning";
import { PlanningClient } from "./planning-client";

export const dynamic = "force-dynamic";

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;
  const weekStart = sp.week ?? isoDate(mondayOf());

  // S'assurer que le plan existe pour cette semaine
  const plan = await ensureWeeklyPlan(weekStart);

  const [{ data: projects }, { data: assignments }, { data: planProjects }, { data: deliverables }, { data: profile }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("active", true).order("name"),
      supabase.from("assignments").select("*, projects(*)").eq("user_id", plan.user_id),
      supabase.from("plan_projects").select("*, projects(*)").eq("plan_id", plan.id),
      supabase.from("deliverables").select("*").eq("plan_id", plan.id).order("order_idx"),
      supabase.from("profiles").select("*").eq("id", plan.user_id).single(),
    ]);

  return (
    <PlanningClient
      plan={plan}
      profile={profile!}
      weekStart={weekStart}
      weekLabelStr={weekLabel(weekStart)}
      allProjects={projects ?? []}
      assignments={assignments ?? []}
      planProjects={planProjects ?? []}
      deliverables={deliverables ?? []}
    />
  );
}
