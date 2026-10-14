import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mondayOf, isoDate, weekLabel } from "@/lib/utils";
import { TeamNav } from "./team-nav";
import { TeamActions } from "./team-actions";
import {
  Users2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plane,
  CalendarDays,
} from "lucide-react";
import { PLAN_STATUS_LABELS, VACATION_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;
  const weekStart = sp.week ?? isoDate(mondayOf());

  const [{ data: users }, { data: plans }, { data: pendingVacations }] = await Promise.all([
    supabase.from("profiles").select("*").eq("active", true).order("full_name"),
    supabase
      .from("weekly_plans")
      .select("*, plan_projects(*, projects(name, color)), deliverables(id, status, title)")
      .eq("week_start", weekStart),
    supabase
      .from("vacations")
      .select("*, user:profiles!vacations_user_id_fkey(full_name, avatar_color)")
      .eq("status", "requested")
      .order("start_date"),
  ]);

  const plansByUser = new Map((plans ?? []).map((p: any) => [p.user_id, p]));

  const teamStats = {
    total: users?.length ?? 0,
    submitted: (plans ?? []).filter((p: any) => p.status === "submitted" || p.status === "validated").length,
    inProgress: (plans ?? []).reduce(
      (s: number, p: any) =>
        s + p.deliverables.filter((d: any) => d.status === "in_progress").length,
      0,
    ),
    blocked: (plans ?? []).reduce(
      (s: number, p: any) =>
        s + p.deliverables.filter((d: any) => d.status === "blocked").length,
      0,
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            <Users2 className="mb-1 mr-2 inline h-6 w-6" />
            Équipe — Semaine du {weekLabel(weekStart)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vue en temps réel du planning de chaque BA pour la semaine
          </p>
        </div>
        <TeamNav weekStart={weekStart} />
      </div>

      {/* KPIs équipe */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiMini
          label="BA actifs"
          value={teamStats.total}
          icon={Users2}
          tone="slate"
        />
        <KpiMini
          label="Plannings soumis"
          value={`${teamStats.submitted}/${teamStats.total}`}
          icon={CheckCircle2}
          tone="emerald"
        />
        <KpiMini
          label="Tâches en cours"
          value={teamStats.inProgress}
          icon={Clock}
          tone="blue"
        />
        <KpiMini
          label="Tâches bloquées"
          value={teamStats.blocked}
          icon={AlertCircle}
          tone={teamStats.blocked > 0 ? "red" : "slate"}
        />
      </div>

      {/* Grille BAs */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users?.map((u: any) => {
          const plan = plansByUser.get(u.id);
          const total = plan?.deliverables.length ?? 0;
          const done = plan?.deliverables.filter((d: any) => d.status === "done").length ?? 0;
          const blocked = plan?.deliverables.filter((d: any) => d.status === "blocked").length ?? 0;
          const totalAlloc =
            plan?.plan_projects.reduce((s: number, p: any) => s + p.allocation_percent, 0) ?? 0;

          return (
            <Card key={u.id} className="transition hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.full_name} color={u.avatar_color} size="lg" />
                    <div>
                      <CardTitle className="text-base">{u.full_name}</CardTitle>
                      <CardDescription className="text-xs">
                        {u.service_line ?? "—"}
                      </CardDescription>
                    </div>
                  </div>
                  {plan ? (
                    <Badge
                      variant={
                        plan.status === "validated"
                          ? "default"
                          : plan.status === "submitted"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {PLAN_STATUS_LABELS[plan.status as keyof typeof PLAN_STATUS_LABELS]}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Non démarré</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan ? (
                  <>
                    <div className="flex flex-wrap gap-1">
                      {plan.plan_projects.map((pp: any) => (
                        <span
                          key={pp.id}
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]"
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: pp.projects.color ?? "#64748b" }}
                          />
                          {pp.projects.name} · {pp.allocation_percent}%
                        </span>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Allocation</span>
                        <span className="tabular-nums">{totalAlloc}%</span>
                      </div>
                      <Progress value={Math.min(totalAlloc, 100)} />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {done}/{total}
                      </span>
                      {blocked > 0 && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" /> {blocked}
                        </span>
                      )}
                      <span>bench {plan.bench ?? 0}</span>
                    </div>
                    {plan.status === "submitted" && (
                      <TeamActions planId={plan.id} />
                    )}
                  </>
                ) : (
                  <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                    Le BA n&apos;a pas encore renseigné sa semaine
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Demandes congés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" /> Demandes de congés en attente
          </CardTitle>
          <CardDescription>
            {pendingVacations?.length ?? 0} demande(s) à traiter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(pendingVacations?.length ?? 0) === 0 ? (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Aucune demande en attente.
            </p>
          ) : (
            <ul className="divide-y">
              {pendingVacations!.map((v: any) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={v.user.full_name} color={v.user.avatar_color} />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{v.user.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        <CalendarDays className="mr-1 inline h-3 w-3" />
                        {new Date(v.start_date).toLocaleDateString("fr-FR")} →{" "}
                        {new Date(v.end_date).toLocaleDateString("fr-FR")} ({v.days_count}j)
                      </div>
                      {v.comments && (
                        <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          « {v.comments} »
                        </div>
                      )}
                    </div>
                  </div>
                  <TeamActions vacationId={v.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiMini({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "blue" | "red" | "slate";
}) {
  const toneClass = {
    emerald: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    blue: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
    red: "text-red-600 bg-red-500/10 dark:text-red-400",
    slate: "text-slate-600 bg-slate-500/10 dark:text-slate-400",
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
