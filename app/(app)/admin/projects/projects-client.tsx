"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProject, updateProject, deleteProject } from "@/lib/actions/admin";
import { FolderKanban, Plus, Loader2, Edit, Power, PowerOff } from "lucide-react";
import type { Project } from "@/lib/types";

const COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#dc2626", "#ea580c",
  "#ca8a04", "#16a34a", "#0d9488", "#0284c7", "#4f46e5",
  "#64748b",
];

export function ProjectsClient({
  projects,
  assignmentsCount,
}: {
  projects: Project[];
  assignmentsCount: Array<{ project_id: string }>;
}) {
  const router = useRouter();
  function countFor(id: string) {
    return assignmentsCount.filter((a) => a.project_id === id).length;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            <FolderKanban className="mb-1 mr-2 inline h-6 w-6" />
            Projets
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catalogue des projets sur lesquels les BAs sont affectés
          </p>
        </div>
        <CreateProjectDialog onDone={() => router.refresh()} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projet</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Affectations</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ background: p.color ?? "#64748b" }}
                      />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.code}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {p.description ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{countFor(p.id)} BA(s)</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.active ? "default" : "outline"}>
                      {p.active ? "Actif" : "Archivé"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ProjectActions project={p} onDone={() => router.refresh()} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateProjectDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await createProject({ code, name, description: description || null, color });
      setCode("");
      setName("");
      setDescription("");
      setColor(COLORS[0]);
      setOpen(false);
      onDone();
    } catch (e: any) {
      setErr(e.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nouveau projet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau projet</DialogTitle>
          <DialogDescription>
            Ajoute un projet au catalogue. Les BAs pourront ensuite y être affectés.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Code court *</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SFEC, eGov, NSIA…"
                maxLength={50}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Nom complet *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full ring-offset-2 ${color === c ? "ring-2 ring-ring" : ""}`}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          {err && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          )}
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

function ProjectActions({ project, onDone }: { project: Project; onDone: () => void }) {
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [color, setColor] = useState(project.color ?? COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    if (project.active) {
      if (!confirm("Archiver ce projet ?")) return;
      await deleteProject(project.id);
    } else {
      await updateProject(project.id, { active: true });
    }
    onDone();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProject(project.id, { name, description, color });
      setEditOpen(false);
      onDone();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-end gap-1">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full ring-offset-2 ${color === c ? "ring-2 ring-ring" : ""}`}
                    style={{ background: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
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
      <Button variant="ghost" size="icon" onClick={toggleActive} aria-label="Archiver">
        {project.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
      </Button>
    </div>
  );
}
