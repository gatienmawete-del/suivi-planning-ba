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
  Users2,
} from "lucide-react";
import { ExportDialog } from "@/components/export-dialog";
import { DELIVERABLE_STATUS_LABELS, DELIVERABLE_STATUS_COLORS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const weekStart = isoDate(mondayOf());
  const isAdminOrViewer = profile?.role === "admin" || profile?.role === "viewer";

  if (isAdminOrViewer) {
    return <TeamDashboard profile={profile} weekStart={weekStart} />;
  }

  return <PersonalDashboard profile={profile} userId={user.id} weekStart={weekStart} />;
}

/* ========== DASHBOARD PERSONNEL (BA) ========== */

async function PersonalDashboard({
  profile,
  userId,
  weekStart,
}: {
  profile: any;
  userId: string;
  weekStart: string;
}) {
  const supabase = await createClient();

  const { data: currentPlan } = await supabase
    .from("weekly_plans")
    .select("*, plan_projects(*, projects(*)), deliverables(*)")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();

  const { data: objectives } = await supabase
    .from("objectives")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "done")
    .order("target_date", { ascending: true, nullsFirst: false })
    .limit(5);

  const { data: upcomingVacations } = await supabase
    .from("vacations")
    .select("*")
    .eq("user_id", userId)
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
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mes livrables de la semaine</CardTitle>
              <CardDescription>
                {total > 0
                  ? `${done} terminé(s) · ${inProgress} en cours · ${blocked} bloqué(s)`
                  : "Aucun livrable renseigné"}
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

/* ========== DASHBOARD ÉQUIPE (ADMIN / VIEWER) ========== */

async function TeamDashboard({
  profile,
  weekStart,
}: {
  profile: any;
  weekStart: string;
}) {
  const supabase = await createClient();

  // Tous les profils actifs (BA + viewer ne sont pas des contributeurs, on affiche les BA)
  const { data: allUsers } = await supabase
    .from("profiles")
    .select("*")
    .eq("active", true)
    .in("role", ["ba", "admin"])
    .order("full_name");

  // Tous les plans de la semaine
  const { data: allPlans } = await supabase
    .from("weekly_plans")
    .select("*, plan_projects(*, projects(*)), deliverables(*)")
    .eq("week_start", weekStart);

  // Tous les objectifs non terminés
  const { data: allObjectives } = await supabase
    .from("objectives")
    .select("*, profiles:user_id(full_name, avatar_color)")
    .neq("status", "done")
    .order("target_date", { ascending: true, nullsFirst: false });

  const plans = allPlans ?? [];
  const users = allUsers ?? [];
  const objectives = allObjectives ?? [];

  // Agréger les KPIs
  const allDeliverables = plans.flatMap((p: any) => p.deliverables ?? []);
  const totalDeliverables = allDeliverables.length;
  const totalDone = allDeliverables.filter((d: any) => d.status === "done").length;
  const totalInProgress = allDeliverables.filter((d: any) => d.status === "in_progress").length;
  const totalBlocked = allDeliverables.filter((d: any) => d.status === "blocked").length;
  const globalCompletion = totalDeliverables ? Math.round((totalDone / totalDeliverables) * 100) : 0;

  const objAvgProgress = objectives.length
    ? Math.round(objectives.reduce((s: number, o: any) => s + (o.progress ?? 0), 0) / objectives.length)
    : 0;
  const objAtRisk = objectives.filter((o: any) => o.status === "at_risk").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            <Users2 className="mb-1 mr-2 inline h-7 w-7" />
            Tableau de bord équipe
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Semaine du {weekLabel(weekStart)} — vue d&apos;ensemble de toute l&apos;équipe
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportDialog users={users.map((u: any) => ({ id: u.id, full_name: u.full_name }))} />
          {profile.role === "admin" && (
            <Button asChild>
              <Link href="/admin/team">
                <Users2 className="h-4 w-4" />
                Gérer l&apos;équipe
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Livrables terminés"
          value={`${totalDone}/${totalDeliverables}`}
          hint={`${globalCompletion}% de complétion globale`}
          icon={CheckCircle2}
          tone="emerald"
          progress={globalCompletion}
        />
        <KpiCard
          label="En cours (équipe)"
          value={totalInProgress}
          hint={`${totalDeliverables} livrables au total`}
          icon={Clock}
          tone="blue"
        />
        <KpiCard
          label="Bloqués (équipe)"
          value={totalBlocked}
          hint={totalBlocked > 0 ? "Nécessitent attention" : "Aucun blocage"}
          icon={AlertCircle}
          tone={totalBlocked > 0 ? "red" : "slate"}
        />
        <KpiCard
          label="Objectifs en cours"
          value={objectives.length}
          hint={`Progression moyenne ${objAvgProgress}%${objAtRisk ? ` · ${objAtRisk} à risque` : ""}`}
          icon={Target}
          tone={objAtRisk > 0 ? "amber" : "emerald"}
          progress={objAvgProgress}
        />
      </div>

      {/* Statut par utilisateur */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Activité par membre</CardTitle>
            <CardDescription>Livrables de la semaine et objectifs en cours de chaque BA</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((u: any) => {
              const userPlan = plans.find((p: any) => p.user_id === u.id);
              const userDeliverables = userPlan?.deliverables ?? [];
              const uDone = userDeliverables.filter((d: any) => d.status === "done").length;
              const uTotal = userDeliverables.length;
              const uBlocked = userDeliverables.filter((d: any) => d.status === "blocked").length;
              const uCompletion = uTotal ? Math.round((uDone / uTotal) * 100) : 0;
              const uAllocation = (userPlan?.plan_projects ?? []).reduce(
                (s: number, p: any) => s + (p.allocation_percent ?? 0),
                0,
              );
              const uObjectives = objectives.filter((o: any) => o.user_id === u.id);
              const uObjAvg = uObjectives.length
                ? Math.round(uObjectives.reduce((s: number, o: any) => s + (o.progress ?? 0), 0) / uObjectives.length)
                : null;

              return (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3 sm:w-52">
                    <Avatar name={u.full_name} color={u.avatar_color} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{u.full_name}</div>
                      <div className="truncate text-xs text-muted-foreground">{u.service_line ?? "—"}</div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Livrables:</span>
                      <span className="text-xs font-medium">
                        {uDone}/{uTotal}
                      </span>
                      {uBlocked > 0 && (
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          ({uBlocked} bloqué{uBlocked > 1 ? "s" : ""})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Allocation:</span>
                      <span
                        className={`text-xs font-medium ${
                          uAllocation > 100
                            ? "text-red-600 dark:text-red-400"
                            : uAllocation === 100
                              ? "text-emerald-600 dark:text-emerald-400"
                              : ""
                        }`}
                      >
                        {uAllocation}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Objectifs:</span>
                      <span className="text-xs font-medium">
                        {uObjectives.length}
                        {uObjAvg !== null && ` · ${uObjAvg}%`}
                      </span>
                    </div>

                    <div className="ml-auto hidden w-32 sm:block">
                      <Progress value={uCompletion} />
                    </div>
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucun utilisateur actif.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Livrables bloqués de toute l'équipe */}
      {totalBlocked > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Livrables bloqués
            </CardTitle>
            <CardDescription>Livrables nécessitant une intervention</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plans.flatMap((p: any) => {
                const planUser = users.find((u: any) => u.id === p.user_id);
                return (p.deliverables ?? [])
                  .filter((d: any) => d.status === "blocked")
                  .map((d: any) => (
                    <li
                      key={d.id}
                      className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50/50 p-3 dark:border-red-900 dark:bg-red-950/30"
                    >
                      <Avatar
                        name={planUser?.full_name ?? "?"}
                        color={planUser?.avatar_color}
                        className="h-6 w-6 text-[10px]"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{d.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {planUser?.full_name}
                      </span>
                    </li>
                  ));
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Objectifs de l'équipe */}
      {objectives.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" /> Objectifs de l&apos;équipe
              </CardTitle>
              <CardDescription>Objectifs en cours de tous les membres</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {objectives.slice(0, 10).map((o: any) => (
                <li key={o.id} className="flex items-start gap-3 rounded-md border p-3">
                  <Avatar
                    name={(o.profiles as any)?.full_name ?? "?"}
                    color={(o.profiles as any)?.avatar_color}
                    className="mt-0.5 h-6 w-6 shrink-0 text-[10px]"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
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
                    <div className="flex items-center gap-2">
                      <Progress value={o.progress} className="flex-1" />
                      <span className="text-xs font-medium tabular-nums">{o.progress}%</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {(o.profiles as any)?.full_name}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ========== COMPOSANTS PARTAGÉS ========== */

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
