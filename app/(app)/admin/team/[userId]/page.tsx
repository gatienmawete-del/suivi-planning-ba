import { createClient } from "@/lib/supabase/server";
import { mondayOf, isoDate, weekLabel } from "@/lib/utils";
import { ensureWeeklyPlanForUser } from "@/lib/actions/admin";
import { AdminPlanningClient } from "./admin-planning-client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUserPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { userId } = await params;
  const sp = await searchParams;
  const weekStart = sp.week ?? isoDate(mondayOf());
  const supabase = await createClient();

  // Vérifier que le profil existe
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) notFound();

  // Récupérer ou créer le plan
  const plan = await ensureWeeklyPlanForUser(userId, weekStart);

  const [{ data: projects }, { data: assignments }, { data: planProjects }, { data: deliverables }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("active", true).order("name"),
      supabase.from("assignments").select("*, projects(*)").eq("user_id", userId),
      supabase.from("plan_projects").select("*, projects(*)").eq("plan_id", plan.id),
      supabase.from("deliverables").select("*").eq("plan_id", plan.id).order("order_idx"),
    ]);

  return (
    <AdminPlanningClient
      plan={plan}
      profile={profile}
      weekStart={weekStart}
      weekLabelStr={weekLabel(weekStart)}
      allProjects={projects ?? []}
      assignments={assignments ?? []}
      planProjects={planProjects ?? []}
      deliverables={deliverables ?? []}
    />
  );
}
