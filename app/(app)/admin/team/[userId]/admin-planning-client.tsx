"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  adminUpdatePlanMeta,
  adminUpsertPlanProject,
  adminDeletePlanProject,
  adminCreateDeliverable,
  adminUpdateDeliverable,
  adminDeleteDeliverable,
  adminValidatePlan,
  adminResetPlanToDraft,
  updateUser,
} from "@/lib/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
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
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertCircle,
  Loader2,
  FolderKanban,
  Flag,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  UserCog,
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
  type Profile,
} from "@/lib/types";
import { addDays, isoDate } from "@/lib/utils";

type Props = {
  plan: any;
  profile: Profile;
  weekStart: string;
  weekLabelStr: string;
  allProjects: Project[];
  assignments: Array<{ id: string; project_id: string; default_allocation: number | null; projects: Project }>;
  planProjects: Array<{ id: string; project_id: string; allocation_percent: number; projects: Project }>;
  deliverables: Deliverable[];
};

const STATUSES: DeliverableStatus[] = ["todo", "in_progress", "blocked", "done"];

export function AdminPlanningClient(props: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [bench, setBench] = useState<string>(props.plan.bench?.toString() ?? "0");
  const [comments, setComments] = useState<string>(props.plan.general_comments ?? "");
  const [saving, setSaving] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const totalAlloc = props.planProjects.reduce((s, p) => s + p.allocation_percent, 0);

  function navigateWeek(direction: number) {
    const current = new Date(props.weekStart + "T00:00:00Z");
    const target = addDays(current, direction * 7);
    router.push(`/admin/team/${props.profile.id}?week=${isoDate(target)}`);
  }

  async function saveMeta() {
    setSaving(true);
    try {
      await adminUpdatePlanMeta({
        planId: props.plan.id,
        bench: parseFloat(bench || "0"),
        comments: comments || null,
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleValidate() {
    if (!confirm("Valider ce planning ?")) return;
    startTransition(async () => {
      await adminValidatePlan(props.plan.id);
      router.refresh();
    });
  }

  async function handleResetDraft() {
    if (!confirm("Remettre ce planning en brouillon ? Le BA pourra le modifier à nouveau.")) return;
    startTransition(async () => {
      await adminResetPlanToDraft(props.plan.id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href={`/admin/team?week=${props.weekStart}`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à l&apos;équipe
          </Link>
          <div className="flex items-center gap-3">
            <Avatar name={props.profile.full_name} color={props.profile.avatar_color} size="lg" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {props.profile.full_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {props.profile.email} · {props.profile.service_line ?? "—"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold">Semaine du {props.weekLabelStr}</span>
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={props.plan.status === "validated" ? "default" : props.plan.status === "submitted" ? "secondary" : "outline"}>
            {PLAN_STATUS_LABELS[props.plan.status as keyof typeof PLAN_STATUS_LABELS]}
          </Badge>
          {(props.plan.status === "submitted" || props.plan.status === "draft") && (
            <Button size="sm" onClick={handleValidate}>
              <CheckCircle2 className="h-4 w-4" /> Valider
            </Button>
          )}
          {props.plan.status !== "draft" && (
            <Button size="sm" variant="outline" onClick={handleResetDraft}>
              <RotateCcw className="h-4 w-4" /> Remettre en brouillon
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
            <UserCog className="h-4 w-4" /> Gérer les projets affectés
          </Button>
        </div>
      </div>

      {/* Dialog assignation projets */}
      {assignOpen && (
        <AssignProjectsDialog
          userId={props.profile.id}
          projects={props.allProjects}
          currentProjectIds={props.assignments.map((a) => a.project_id)}
          open={assignOpen}
          onOpenChange={setAssignOpen}
          onDone={() => router.refresh()}
        />
      )}

      {/* Row: Projets + Bench */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" /> Projets en cours
              </CardTitle>
              <CardDescription>
                Répartition du temps sur les projets de la semaine (en %)
              </CardDescription>
            </div>
            <AdminAddProjectDialog
              planId={props.plan.id}
              available={props.allProjects.filter(
                (p) => !props.planProjects.find((pp) => pp.project_id === p.id),
              )}
              assignments={props.assignments}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {props.planProjects.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Aucun projet renseigné pour la semaine.
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
                      <Progress className="mt-1.5" value={pp.allocation_percent} color={pp.projects.color ?? undefined} />
                    </div>
                    <AdminEditAllocation planProject={pp} planId={props.plan.id} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        startTransition(async () => {
                          await adminDeletePlanProject(pp.id);
                          router.refresh();
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
            <CardDescription>Taux d&apos;inoccupation (0 = plein, 1 = inactif)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bench">Bench</Label>
              <Input
                id="bench"
                type="number"
                step="0.1"
                min={0}
                max={1}
                value={bench}
                onChange={(e) => setBench(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Commentaires</Label>
              <Textarea
                id="comments"
                rows={5}
                placeholder="Points marquants, blocages, demandes…"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full" onClick={saveMeta} disabled={saving}>
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
              Gérer les tâches et livrables du BA pour cette semaine.
            </CardDescription>
          </div>
          <AdminAddDeliverableDialog
            planId={props.plan.id}
            projects={props.allProjects}
            weekStart={props.weekStart}
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
                      <AdminDeliverableCard key={d.id} d={d} projects={props.allProjects} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --------- Dialog assignation projets au BA ---------

function AssignProjectsDialog({
  userId,
  projects,
  currentProjectIds,
  open,
  onOpenChange,
  onDone,
}: {
  userId: string;
  projects: Project[];
  currentProjectIds: string[];
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onDone: () => void;
}) {
  const [projectIds, setProjectIds] = useState<string[]>(currentProjectIds);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toggleProject(id: string) {
    setProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await updateUser({ id: userId, projectIds });
      onOpenChange(false);
      onDone();
    } catch (e: any) {
      setErr(e.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Projets affectés au BA</DialogTitle>
          <DialogDescription>
            Coche les projets sur lesquels ce BA travaille.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="max-h-64 overflow-y-auto rounded-md border p-2">
            <div className="grid gap-1 sm:grid-cols-2">
              {projects.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={projectIds.includes(p.id)}
                    onChange={() => toggleProject(p.id)}
                  />
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color ?? "#64748b" }} />
                  <span>{p.name}</span>
                  <span className="text-xs text-muted-foreground">({p.code})</span>
                </label>
              ))}
            </div>
          </div>
          {err && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------- Sous-composants admin ---------

function AdminAddProjectDialog({
  planId,
  available,
  assignments,
}: {
  planId: string;
  available: Project[];
  assignments: Array<{ project_id: string; default_allocation: number | null }>;
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
      await adminUpsertPlanProject({ planId, projectId, allocation: parseInt(allocation, 10) });
      setOpen(false);
      setProjectId("");
      setAllocation("20");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const assigned = available.filter((p) => assignments.find((a) => a.project_id === p.id));
  const others = available.filter((p) => !assignments.find((a) => a.project_id === p.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Ajouter un projet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un projet à la semaine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-2">
            <Label>Projet</Label>
            <Select value={projectId} onValueChange={(v) => {
              setProjectId(v);
              const match = assignments.find((a) => a.project_id === v);
              if (match?.default_allocation) setAllocation(String(match.default_allocation));
            }}>
              <SelectTrigger><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
              <SelectContent>
                {assigned.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">Projets affectés</div>
                    {assigned.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </>
                )}
                {others.length > 0 && (
                  <>
                    <div className="mt-2 px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">Autres projets</div>
                    {others.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Allocation (%)</Label>
            <Input type="number" min={0} max={100} value={allocation} onChange={(e) => setAllocation(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
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

function AdminEditAllocation({
  planProject,
  planId,
}: {
  planProject: { id: string; project_id: string; allocation_percent: number };
  planId: string;
}) {
  const router = useRouter();
  const [val, setVal] = useState(planProject.allocation_percent.toString());
  const [editing, setEditing] = useState(false);

  async function save() {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0 || n > 100) return;
    await adminUpsertPlanProject({ planId, projectId: planProject.project_id, allocation: n });
    router.refresh();
    setEditing(false);
  }

  if (!editing) {
    return (
      <Button variant="ghost" size="sm" className="w-16 shrink-0" onClick={() => setEditing(true)}>
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

function AdminAddDeliverableDialog({
  planId,
  projects,
  weekStart,
}: {
  planId: string;
  projects: Project[];
  weekStart: string;
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
      await adminCreateDeliverable({
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
        <Button size="sm"><Plus className="h-4 w-4" /> Nouveau livrable</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nouveau livrable (admin)</DialogTitle>
          <DialogDescription>Ajouter un livrable au planning du BA.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label>Titre *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={300} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Projet</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Aucun —</SelectItem>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as DeliverablePriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["low", "medium", "high", "critical"] as DeliverablePriority[]).map((p) => (
                    <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as DeliverableStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{DELIVERABLE_STATUS_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Échéance</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
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

function AdminDeliverableCard({ d, projects }: { d: Deliverable; projects: Project[] }) {
  const router = useRouter();
  const project = projects.find((p) => p.id === d.project_id);

  async function changeStatus(status: DeliverableStatus) {
    await adminUpdateDeliverable(d.id, { status });
    router.refresh();
  }

  async function remove() {
    if (!confirm("Supprimer ce livrable ?")) return;
    await adminDeleteDeliverable(d.id);
    router.refresh();
  }

  return (
    <div className="group rounded-md border bg-background p-3 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-medium ${PRIORITY_COLORS[d.priority]}`}>
          {PRIORITY_LABELS[d.priority]}
        </span>
        <button onClick={remove} className="opacity-0 transition-opacity group-hover:opacity-100">
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
      <p className="mt-1 text-sm font-medium leading-snug">{d.title}</p>
      {d.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>
      )}
      {project && (
        <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.color ?? "#64748b" }} />
          {project.name}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between gap-1">
        {d.due_date && (
          <span className="text-[10px] text-muted-foreground">
            {new Date(d.due_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
          </span>
        )}
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
      </div>
    </div>
  );
}
