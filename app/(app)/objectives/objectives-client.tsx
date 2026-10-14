"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import { createObjective, deleteObjective, updateObjectiveProgress } from "@/lib/actions/planning";
import { Target, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import type { Objective } from "@/lib/types";

export function ObjectivesClient({ objectives }: { objectives: Objective[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createObjective({
        title,
        description: description || null,
        targetDate: targetDate || null,
        progress: 0,
      });
      setTitle("");
      setDescription("");
      setTargetDate("");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const active = objectives.filter((o) => o.status !== "done");
  const completed = objectives.filter((o) => o.status === "done");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            <Target className="mb-1 mr-2 inline h-6 w-6" />
            Mes objectifs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suis tes OKRs personnels : {active.length} actifs · {completed.length} atteints
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Nouvel objectif
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvel objectif</DialogTitle>
              <DialogDescription>Un objectif concret, mesurable, avec une échéance.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="o-title">Titre *</Label>
                <Input
                  id="o-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={300}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="o-desc">Description</Label>
                <Textarea
                  id="o-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="o-date">Échéance</Label>
                <Input
                  id="o-date"
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>En cours</CardTitle>
          <CardDescription>Objectifs non encore atteints</CardDescription>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Aucun objectif actif. Ajoute-en un pour piloter ta semaine.
            </div>
          ) : (
            <ul className="space-y-5">
              {active.map((o) => (
                <ObjectiveRow key={o.id} o={o} onRefresh={() => router.refresh()} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {completed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Atteints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {completed.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <span className="font-medium">{o.title}</span>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Fait
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

function ObjectiveRow({ o, onRefresh }: { o: Objective; onRefresh: () => void }) {
  const [progress, setProgress] = useState(o.progress);
  const [saving, setSaving] = useState(false);

  async function save(v: number) {
    setSaving(true);
    try {
      await updateObjectiveProgress(o.id, v);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium">{o.title}</p>
          {o.description && (
            <p className="mt-1 text-xs text-muted-foreground">{o.description}</p>
          )}
          {o.target_date && (
            <p className="mt-1 text-xs text-muted-foreground">
              Échéance :{" "}
              {new Date(o.target_date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            if (!confirm("Supprimer cet objectif ?")) return;
            await deleteObjective(o.id);
            onRefresh();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          onChange={(e) => setProgress(parseInt(e.target.value, 10))}
          onMouseUp={(e) => save(parseInt((e.target as HTMLInputElement).value, 10))}
          onTouchEnd={(e) => save(parseInt((e.target as HTMLInputElement).value, 10))}
          className="flex-1 accent-primary"
          disabled={saving}
        />
        <span className="w-14 text-right text-sm font-semibold tabular-nums">{progress}%</span>
      </div>
      <Progress value={progress} />
    </li>
  );
}
