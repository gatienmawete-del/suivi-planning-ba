import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { mondayOf, isoDate, weekLabel } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Plane,
} from "lucide-react";
import { DELIVERABLE_STATUS_LABELS, DELIVERABLE_STATUS_COLORS, PLAN_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const weekStart = isoDate(mondayOf());

  // Plan de la semaine
  const { data: currentPlan } = await supabase
    .from("weekly_plans")
    .select("*, plan_projects(*, projects(*)), deliverables(*)")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  // Objectifs ouverts
  const { data: objectives } = await supabase
    .from("objectives")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "done")
    .order("target_date", { ascending: true, nullsFirst: false })
    .limit(5);

  // Prochains congés
  const { data: upcomingVacations } = await supabase
    .from("vacations")
    .select("*")
    .eq("user_id", user.id)
    .gte("end_date", new Date().toISOString().slice(0, 10))
    .order("start_date")
    .limit(3);

  const deliverables = currentPlan?.deliverables ?? [];
  const total = deliverables.length;
  const done = deliverables.filter((d: any) => d.status === "done").length;
  const inProgress = deliverables.filter((d: any) => d.status === "in_progress").length;
  const blocked = deliverables.filter((d: any) => d.status === "blocked").length;
  const completionRate = total ? Math.round((done / total) * 100) : 0;

  const totalAllocation = (currentPlan?.plan_projects ?? []).reduce(
    (s: number, p: any) => s + (p.allocation_percent ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Bonjour, {profile?.full_name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Semaine du {weekLabel(weekStart)} — vue d&apos;ensemble de ton activité
          </p>
        </div>
        <Button asChild>
          <Link href="/planning">
            <CalendarDays className="h-4 w-4" />
            Remplir ma semaine
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Livrables terminés"
          value={`${done}/${total}`}
          hint={`${completionRate}% de complétion`}
          icon={CheckCircle2}
          tone="emerald"
          progress={completionRate}
        />
        <KpiCard
          label="En cours"
          value={inProgress}
          hint={`${total} livrables cette semaine`}
          icon={Clock}
          tone="blue"
        />
        <KpiCard
          label="Bloqués"
          value={blocked}
          hint={blocked > 0 ? "Nécessitent attention" : "Aucun blocage"}
          icon={AlertCircle}
          tone={blocked > 0 ? "red" : "slate"}
        />
        <KpiCard
          label="Allocation projets"
          value={`${totalAllocation}%`}
          hint={
            totalAllocation === 100
              ? "Semaine 100% affectée"
              : totalAllocation > 100
                ? "⚠️ Sur-affectation"
                : `${100 - totalAllocation}% restant à affecter`
          }
          icon={TrendingUp}
          tone={totalAllocation > 100 ? "red" : totalAllocation === 100 ? "emerald" : "amber"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Livrables récents */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mes livrables de la semaine</CardTitle>
              <CardDescription>
                {currentPlan
                  ? `Statut du plan : ${PLAN_STATUS_LABELS[currentPlan.status as keyof typeof PLAN_STATUS_LABELS]}`
                  : "Plan non encore démarré"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/planning">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {deliverables.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucun livrable pour cette semaine.
                </p>
                <Button className="mt-3" size="sm" asChild>
                  <Link href="/planning">Commencer le planning</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {deliverables.slice(0, 6).map((d: any) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent/30"
                  >
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${DELIVERABLE_STATUS_COLORS[d.status as keyof typeof DELIVERABLE_STATUS_COLORS]}`}
                    >
                      {DELIVERABLE_STATUS_LABELS[d.status as keyof typeof DELIVERABLE_STATUS_LABELS]}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{d.title}</span>
                    {d.due_date && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(d.due_date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Objectifs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Objectifs</CardTitle>
              <CardDescription>Prochaines échéances</CardDescription>
            </div>
            <Target className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {(objectives?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun objectif actif.</p>
            ) : (
              <ul className="space-y-4">
                {objectives!.map((o: any) => (
                  <li key={o.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium">{o.title}</span>
                      {o.target_date && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {new Date(o.target_date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                    <Progress value={o.progress} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{o.progress}%</span>
                      <Badge variant="outline" className="text-[10px]">
                        {o.status === "at_risk" ? "À risque" : o.status === "on_track" ? "Sur la bonne voie" : "En attente"}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Congés */}
      {(upcomingVacations?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" /> Prochains congés
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vacations">Gérer</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {upcomingVacations!.map((v: any) => (
                <li key={v.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {new Date(v.start_date).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(v.end_date).toLocaleDateString("fr-FR")} ({v.days_count}j)
                  </span>
                  <Badge
                    variant={
                      v.status === "approved"
                        ? "default"
                        : v.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {v.status === "requested"
                      ? "En attente"
                      : v.status === "approved"
                        ? "Approuvé"
                        : v.status === "rejected"
                          ? "Refusé"
                          : "Annulé"}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  progress,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "blue" | "amber" | "red" | "slate";
  progress?: number;
}) {
  const toneBg = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  }[tone];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {typeof progress === "number" && <Progress className="mt-3" value={progress} />}
      </CardContent>
    </Card>
  );
}
