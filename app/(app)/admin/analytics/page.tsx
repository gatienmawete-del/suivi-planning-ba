import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCharts } from "./analytics-charts";
import { LineChart as LC } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [{ data: plans }, { data: deliverables }, { data: projects }, { data: profiles }] =
    await Promise.all([
      supabase.from("weekly_plans").select("id, user_id, week_start, bench, status"),
      supabase.from("deliverables").select("id, plan_id, project_id, status, created_at"),
      supabase.from("projects").select("id, name, color").eq("active", true),
      supabase.from("profiles").select("id, full_name, avatar_color").eq("active", true),
    ]);

  // Agrégation par semaine
  const weekMap = new Map<string, { total: number; done: number; blocked: number; bench: number[] }>();
  for (const p of plans ?? []) {
    const w = p.week_start;
    const bucket = weekMap.get(w) ?? { total: 0, done: 0, blocked: 0, bench: [] };
    const planDeliv = (deliverables ?? []).filter((d: any) => d.plan_id === p.id);
    bucket.total += planDeliv.length;
    bucket.done += planDeliv.filter((d: any) => d.status === "done").length;
    bucket.blocked += planDeliv.filter((d: any) => d.status === "blocked").length;
    if (p.bench !== null) bucket.bench.push(Number(p.bench));
    weekMap.set(w, bucket);
  }
  const weeklyData = Array.from(weekMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, v]) => ({
      week,
      Total: v.total,
      Terminés: v.done,
      Bloqués: v.blocked,
      Bench: v.bench.length ? +(v.bench.reduce((s, x) => s + x, 0) / v.bench.length).toFixed(2) : 0,
    }));

  // Répartition par projet
  const projectMap = new Map<string, number>();
  for (const d of deliverables ?? []) {
    if (!d.project_id) continue;
    projectMap.set(d.project_id, (projectMap.get(d.project_id) ?? 0) + 1);
  }
  const projectData = Array.from(projectMap.entries())
    .map(([pid, count]) => {
      const p = (projects ?? []).find((x: any) => x.id === pid);
      return { name: p?.name ?? "—", count, color: p?.color ?? "#64748b" };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top BAs (par livrables terminés)
  const baMap = new Map<string, number>();
  for (const d of deliverables ?? []) {
    if (d.status !== "done") continue;
    const plan = (plans ?? []).find((p: any) => p.id === d.plan_id);
    if (!plan) continue;
    baMap.set(plan.user_id, (baMap.get(plan.user_id) ?? 0) + 1);
  }
  const topBas = Array.from(baMap.entries())
    .map(([uid, count]) => {
      const u = (profiles ?? []).find((p: any) => p.id === uid);
      return { name: u?.full_name ?? "—", count, color: u?.avatar_color ?? "#3b82f6" };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          <LC className="mb-1 mr-2 inline h-6 w-6" />
          Analytique
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue agrégée des livrables, projets et performance de l&apos;équipe
        </p>
      </div>

      <AnalyticsCharts
        weeklyData={weeklyData}
        projectData={projectData}
        topBas={topBas}
      />
    </div>
  );
}
