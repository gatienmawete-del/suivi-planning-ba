"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plane, Plus, Loader2, X } from "lucide-react";
import { requestVacation, cancelVacation } from "@/lib/actions/vacations";
import { VACATION_STATUS_LABELS } from "@/lib/types";

export function VacationsClient({
  vacations,
  teammates,
}: {
  vacations: any[];
  teammates: Array<{ id: string; full_name: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interim, setInterim] = useState<string>("none");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await requestVacation({
        startDate,
        endDate,
        interimUserId: interim === "none" ? null : interim,
        interimText: null,
        comments: comments || null,
      });
      setStartDate("");
      setEndDate("");
      setInterim("none");
      setComments("");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            <Plane className="mb-1 mr-2 inline h-6 w-6" />
            Mes congés
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Demande, suivi et historique des périodes d&apos;absence
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Nouvelle demande
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Demander un congé</DialogTitle>
              <DialogDescription>
                Après soumission, l&apos;admin reçoit la demande pour validation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start">Date début *</Label>
                  <Input
                    id="start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">Date fin *</Label>
                  <Input
                    id="end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    min={startDate || undefined}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Intérim assuré par</Label>
                <Select value={interim} onValueChange={setInterim}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un collègue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Aucun —</SelectItem>
                    {teammates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Commentaires</Label>
                <Textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Motif, précisions…"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Envoyer la demande
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>Toutes tes demandes et leur statut</CardDescription>
        </CardHeader>
        <CardContent>
          {vacations.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Aucune demande de congé pour le moment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Jours</TableHead>
                  <TableHead>Intérim</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Commentaires</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vacations.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">
                      {new Date(v.start_date).toLocaleDateString("fr-FR")} →{" "}
                      {new Date(v.end_date).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>{v.days_count}</TableCell>
                    <TableCell>{v.interim?.full_name ?? v.interim_text ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          v.status === "approved"
                            ? "default"
                            : v.status === "rejected"
                              ? "destructive"
                              : v.status === "cancelled"
                                ? "outline"
                                : "secondary"
                        }
                      >
                        {VACATION_STATUS_LABELS[v.status as keyof typeof VACATION_STATUS_LABELS]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {v.comments ?? ""}
                    </TableCell>
                    <TableCell>
                      {v.status === "requested" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (!confirm("Annuler cette demande ?")) return;
                            await cancelVacation(v.id);
                            router.refresh();
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
