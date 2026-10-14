"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updatePlanMeta,
  submitPlan,
  upsertPlanProject,
  deletePlanProject,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  createObjective,
  updateObjectiveProgress,
  deleteObjective,
} from "@/lib/actions/planning";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertCircle,
  Loader2,
  FolderKanban,
  Flag,
  Target,
  Archive,
} from "lucide-react";
import {
  DELIVERABLE_STATUS_LABELS,
  DELIVERABLE_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  PLAN_STATUS_LABELS,
  type Deliverable,
  type DeliverableStatus,
  type DeliverablePriority,
  type Project,
} from "@/lib/types";
import { addDays, isoDate, isCurrentWeek, isPastWeek } from "@/lib/utils";

type Objective = {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  status: string;
  target_date: string | null;
  plan_id: string | null;
  project_id?: string | null;
};

type Props = {
  plan: any;
  profile: any;
  weekStart: string;
  weekLabelStr: string;
  allProjects: Project[];
  assignments: Array<{ id: string; project_id: string; default_allocation: number | null; projects: Project }>;
  planProjects: Array<{ id: string; project_id: string; allocation_percent: number; projects: Project }>;
  deliverables: Deliverable[];
  objectives: Objective[];
};

const STATUSES: DeliverableStatus[] = ["todo", "in_progress", "blocked", "done"];

export function PlanningClient(props: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [comments, setComments] = useState<string>(props.plan.general_comments ?? "");
  const [saving, setSaving] = useState(false);

  const totalAlloc = props.planProjects.reduce((s, p) => s + p.allocation_percent, 0);

  function navigateWeek(direction: number) {
    const current = new Date(props.weekStart + "T00:00:00Z");
    const target = addDays(current, direction * 7);
    router.push(`/planning?week=${isoDate(target)}`);
  }

  async function saveMeta() {
    setSaving(true);
    try {
      await updatePlanMeta({
        planId: props.plan.id,
        comments: comments || null,
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!confirm("Soumettre ce planning hebdomadaire pour validation ?")) return;
    startTransition(async () => {
      await submitPlan(props.plan.id);
      router.refresh();
    });
  }

  const isValidated = props.plan.status === "validated";
  const isSubmitted = props.plan.status === "submitted";
  const pastWeek = isPastWeek(props.weekStart);
  const currentWeek = isCurrentWeek(props.weekStart);
  // Semaines passées = archivées (lecture seule). Semaine courante = modifiable (sauf si validé)
  const locked = pastWeek || isValidated;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)} aria-label="Semaine précédente">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Semaine du {props.weekLabelStr}</h1>
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)} aria-label="Semaine suivante">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Renseigne tes projets, livrables, objectifs et commentaires pour la semaine.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isValidated ? "default" : isSubmitted ? "secondary" : "outline"}>
            {PLAN_STATUS_LABELS[props.plan.status as keyof typeof PLAN_STATUS_LABELS]}
          </Badge>
          {!locked && props.plan.status === "draft" && (
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4" /> Soumettre
            </Button>
          )}
          {isValidated && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> Validé
            </Badge>
          )}
        </div>
      </div>

      {/* Bannière semaine archivée */}
      {pastWeek && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <Archive className="h-4 w-4 shrink-0" />
          <span>Cette semaine est archivée. Les modifications ne sont plus possibles.</span>
        </div>
      )}

      {/* Row: Projets + Bench */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Projets en cours
              </CardTitle>
              <CardDescription>
                Répartition de ton temps sur les projets de la semaine (en %)
              </CardDescription>
            </div>
            <AddProjectDialog
              planId={props.plan.id}
              available={props.allProjects.filter(
                (p) => !props.planProjects.find((pp) => pp.project_id === p.id),
              )}
              assignments={props.assignments}
              disabled={locked}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {props.planProjects.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Aucun projet renseigné pour la semaine. Clique sur « Ajouter un projet ».
              </div>
            ) : (
              <ul className="space-y-2">
                {props.planProjects.map((pp) => (
                  <li key={pp.id} className="flex items-center gap-3 rounded-md border p-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: pp.projects.color ?? "#64748b" }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{pp.projects.name}</span>
                        <span className="text-sm font-semibold tabular-nums">
                          {pp.allocation_percent}%
                        </span>
                      </div>
                      <Progress
                        className="mt-1.5"
                        value={pp.allocation_percent}
                        color={pp.projects.color ?? undefined}
                      />
                    </div>
                    <EditAllocation
                      planProject={pp}
                      planId={props.plan.id}
                      disabled={locked}
                    />
                    {!locked && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          startTransition(async () => {
                            await deletePlanProject(pp.id);
                            router.refresh();
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div
              className={`mt-3 flex items-center justify-between rounded-md p-3 text-sm ${
                totalAlloc > 100
                  ? "bg-red-500/10 text-red-700 dark:text-red-400"
                  : totalAlloc === 100
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-muted"
              }`}
            >
              <span className="flex items-center gap-2">
                {totalAlloc > 100 && <AlertCircle className="h-4 w-4" />}
                Total alloué
              </span>
              <span className="font-semibold tabular-nums">{totalAlloc}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Bench & notes
            </CardTitle>
            <CardDescription>Le bench est défini par l&apos;administrateur.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bench">Bench</Label>
              <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
                <span className="font-semibold tabular-nums">{props.plan.bench ?? 0}</span>
                <span className="text-xs text-muted-foreground">(défini par l&apos;admin)</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Commentaires</Label>
              <Textarea
                id="comments"
                rows={5}
                placeholder="Points marquants, blocages, demandes…"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                disabled={locked}
              />
            </div>
            <Button variant="outline" className="w-full" onClick={saveMeta} disabled={locked || saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Livrables */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" /> Livrables de la semaine
            </CardTitle>
            <CardDescription>
              Détaille les tâches à produire — glisser-déposer les statuts, ajouter des échéances.
            </CardDescription>
          </div>
          <AddDeliverableDialog
            planId={props.plan.id}
            projects={props.allProjects}
            weekStart={props.weekStart}
            disabled={locked}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STATUSES.map((status) => {
              const items = props.deliverables.filter((d) => d.status === status);
              return (
                <div key={status} className="rounded-lg bg-muted/30 p-3">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${DELIVERABLE_STATUS_COLORS[status]}`}
                    >
                      {DELIVERABLE_STATUS_LABELS[status]}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.length === 0 && (
                      <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                        Aucun livrable
                      </p>
                    )}
                    {items.map((d) => (
                      <DeliverableCard
                        key={d.id}
                        d={d}
                        projects={props.allProjects}
                        disabled={locked}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Objectifs de la semaine */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" /> Objectifs de la semaine
            </CardTitle>
            <CardDescription>
              Définis tes objectifs pour cette semaine et suis leur progression.
            </CardDescription>
          </div>
          <AddObjectiveDialog
            planId={props.plan.id}
            projects={props.allProjects}
            disabled={locked}
          />
        </CardHeader>
        <CardContent>
          {props.objectives.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Aucun objectif pour cette semaine. Clique sur « Nouvel objectif ».
            </div>
          ) : (
            <div className="space-y-3">
              {props.objectives.map((obj) => (
                <ObjectiveCard key={obj.id} obj={obj} projects={props.allProjects} disabled={locked} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --------- Sous-composants ---------

function AddProjectDialog({
  planId,
  available,
  assignments,
  disabled,
}: {
  planId: string;
  available: Project[];
  assignments: Array<{ project_id: string; default_allocation: number | null }>;
  disabled: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [allocation, setAllocation] = useState("20");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setLoading(true);
    try {
      await upsertPlanProject({
        planId,
        projectId,
        allocation: parseInt(allocation, 10),
      });
      setOpen(false);
      setProjectId("");
      setAllocation("20");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  // Suggestions = projets de l'assignation user en priorité
  const assigned = available.filter((p) => assignments.find((a) => a.project_id === p.id));
  const others = available.filter((p) => !assignments.find((a) => a.project_id === p.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          <Plus className="h-4 w-4" /> Ajouter un projet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un projet à la semaine</DialogTitle>
          <DialogDescription>
            Choisis un projet et son pourcentage d&apos;affectation pour cette semaine.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-2">
            <Label>Projet</Label>
            <Select value={projectId} onValueChange={(v) => {
              setProjectId(v);
              const match = assignments.find((a) => a.project_id === v);
              if (match?.default_allocation) setAllocation(String(match.default_allocation));
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner…" />
              </SelectTrigger>
              <SelectContent>
                {assigned.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                      Mes projets affectés
                    </div>
                    {assigned.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </>
                )}
                {others.length > 0 && (
                  <>
                    <div className="mt-2 px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                      Autres projets
                    </div>
                    {others.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Allocation (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={allocation}
              onChange={(e) => setAllocation(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditAllocation({
  planProject,
  planId,
  disabled,
}: {
  planProject: { id: string; project_id: string; allocation_percent: number };
  planId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [val, setVal] = useState(planProject.allocation_percent.toString());
  const [editing, setEditing] = useState(false);

  async function save() {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0 || n > 100) return;
    await upsertPlanProject({
      planId,
      projectId: planProject.project_id,
      allocation: n,
    });
    router.refresh();
    setEditing(false);
  }

  if (!editing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-16 shrink-0"
        onClick={() => setEditing(true)}
        disabled={disabled}
      >
        Modifier
      </Button>
    );
  }
  return (
    <Input
      type="number"
      className="h-8 w-20"
      min={0}
      max={100}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(false);
      }}
      autoFocus
    />
  );
}

function AddDeliverableDialog({
  planId,
  projects,
  weekStart,
  disabled,
}: {
  planId: string;
  projects: Project[];
  weekStart: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [priority, setPriority] = useState<DeliverablePriority>("medium");
  const [status, setStatus] = useState<DeliverableStatus>("todo");
  const [dueDate, setDueDate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const weekEnd = isoDate(addDays(new Date(weekStart + "T00:00:00Z"), 6));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createDeliverable({
        planId,
        projectId: projectId === "none" ? null : projectId,
        title,
        description: description || null,
        priority,
        status,
        dueDate: dueDate || null,
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      setProjectId("none");
      setPriority("medium");
      setStatus("todo");
      setDueDate("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          <Plus className="h-4 w-4" /> Nouveau livrable
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nouveau livrable</DialogTitle>
          <DialogDescription>
            Décris une tâche ou un livrable concret attendu cette semaine.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Finaliser la spec v2.3 Hydrocarbures"
              required
              maxLength={300}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails, lien, dépendances…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Projet</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Aucun —</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as DeliverablePriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["low", "medium", "high", "critical"] as DeliverablePriority[]).map((p) => (
                    <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut initial</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as DeliverableStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{DELIVERABLE_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Échéance</Label>
              <Input
                type="date"
                min={weekStart}
                max={weekEnd}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeliverableCard({
  d,
  projects,
  disabled,
}: {
  d: Deliverable;
  projects: Project[];
  disabled: boolean;
}) {
  const router = useRouter();
  const project = projects.find((p) => p.id === d.project_id);

  async function changeStatus(status: DeliverableStatus) {
    await updateDeliverable(d.id, { status });
    router.refresh();
  }

  async function remove() {
    if (!confirm("Supprimer ce livrable ?")) return;
    await deleteDeliverable(d.id);
    router.refresh();
  }

  return (
    <div className="group rounded-md border bg-background p-3 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-medium ${PRIORITY_COLORS[d.priority]}`}>
          {PRIORITY_LABELS[d.priority]}
        </span>
        {!disabled && (
          <button
            onClick={remove}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        )}
      </div>
      <p className="mt-1 text-sm font-medium leading-snug">{d.title}</p>
      {d.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>
      )}
      {project && (
        <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: project.color ?? "#64748b" }}
          />
          {project.name}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between gap-1">
        {d.due_date && (
          <span className="text-[10px] text-muted-foreground">
            {new Date(d.due_date).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        )}
        {!disabled && (
          <Select value={d.status} onValueChange={(v) => changeStatus(v as DeliverableStatus)}>
            <SelectTrigger className="ml-auto h-6 w-28 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {DELIVERABLE_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

// --------- Objectifs ---------

function AddObjectiveDialog({
  planId,
  projects,
  disabled,
}: {
  planId: string;
  projects: Project[];
  disabled: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createObjective({
        planId,
        projectId: projectId || null,
        title,
        description: description || null,
        targetDate: targetDate || null,
        progress: 0,
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      setTargetDate("");
      setProjectId("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          <Plus className="h-4 w-4" /> Nouvel objectif
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel objectif</DialogTitle>
          <DialogDescription>
            Définis un objectif pour cette semaine.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label>Projet *</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un projet" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: p.color ?? "#64748b" }} />
                      {p.name} ({p.code})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Titre *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Finaliser le livrable X"
              required
              maxLength={300}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails, critères de succès…"
            />
          </div>
          <div className="space-y-2">
            <Label>Date cible</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ObjectiveCard({
  obj,
  projects,
  disabled,
}: {
  obj: Objective;
  projects: Project[];
  disabled: boolean;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(obj.progress);
  const [saving, setSaving] = useState(false);

  async function saveProgress(val: number) {
    setSaving(true);
    try {
      await updateObjectiveProgress(obj.id, val);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Supprimer cet objectif ?")) return;
    await deleteObjective(obj.id);
    router.refresh();
  }

  const statusColor = obj.progress >= 100
    ? "text-emerald-600 dark:text-emerald-400"
    : obj.progress > 0
      ? "text-blue-600 dark:text-blue-400"
      : "text-muted-foreground";

  const project = obj.project_id ? projects.find((p) => p.id === obj.project_id) : null;

  return (
    <div className="group flex items-start gap-4 rounded-md border p-4 transition hover:shadow-sm">
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            {project && (
              <span className="mb-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.color ?? "#64748b" }} />
                {project.code}
              </span>
            )}
            <p className="text-sm font-medium">{obj.title}</p>
            {obj.description && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{obj.description}</p>
            )}
          </div>
          {!disabled && (
            <button onClick={remove} className="opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1" />
          <span className={`text-xs font-semibold tabular-nums ${statusColor}`}>
            {progress}%
          </span>
        </div>
        {!disabled && (
          <div className="flex items-center gap-2">
            <Input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value, 10))}
              className="h-2 flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => saveProgress(progress)}
              disabled={saving || progress === obj.progress}
              className="h-7 text-xs"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Sauver"}
            </Button>
          </div>
        )}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {obj.target_date && (
            <span>
              Cible : {new Date(obj.target_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
            </span>
          )}
          <Badge variant={obj.progress >= 100 ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
            {obj.progress >= 100 ? "Atteint" : obj.progress > 0 ? "En cours" : "En attente"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
