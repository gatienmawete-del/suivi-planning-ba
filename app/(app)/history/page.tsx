import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, History as HistoryIcon } from "lucide-react";
import { weekLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: plans } = await supabase
    .from("weekly_plans")
    .select("*, plan_projects(allocation_percent, projects(name, color)), deliverables(id, status)")
    .eq("user_id", user.id)
    .order("week_start", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          <HistoryIcon className="mb-1 mr-2 inline h-6 w-6" />
          Historique
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tes {plans?.length ?? 0} semaines renseignées — clique pour revoir le détail.
        </p>
      </div>

      {(plans?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            Aucune semaine renseignée pour l&apos;instant.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans!.map((p: any) => {
            const total = p.deliverables.length;
            const done = p.deliverables.filter((d: any) => d.status === "done").length;
            const inProg = p.deliverables.filter((d: any) => d.status === "in_progress").length;
            return (
              <Card key={p.id} className="transition hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Semaine du {weekLabel(p.week_start)}</CardTitle>
                    <Badge variant={total > 0 && done === total ? "default" : "outline"}>
                      {done}/{total} livrable{total > 1 ? "s" : ""} terminé{done > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <CardDescription>
                    {p.plan_projects.length} projet{p.plan_projects.length > 1 ? "s" : ""} · bench {p.bench ?? 0}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {p.plan_projects.slice(0, 5).map((pp: any) => (
                      <span
                        key={pp.projects.name}
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
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {done}/{total}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-blue-500" /> {inProg} en cours
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/planning?week=${p.week_start}`}>
                      Voir le détail <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
