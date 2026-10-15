"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { FileSpreadsheet, Loader2, Download } from "lucide-react";
import { mondayOf, isoDate, addDays, weekLabel } from "@/lib/utils";

type UserOption = { id: string; full_name: string };

export function ExportDialog({ users }: { users: UserOption[] }) {
  const thisMonday = mondayOf();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(isoDate(addDays(thisMonday, -21)));
  const [to, setTo] = useState(isoDate(thisMonday));
  const [userId, setUserId] = useState("all");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fromMonday = useMemo(() => (from ? isoDate(mondayOf(new Date(from + "T00:00:00Z"))) : ""), [from]);
  const toMonday = useMemo(() => (to ? isoDate(mondayOf(new Date(to + "T00:00:00Z"))) : ""), [to]);
  const weeks =
    fromMonday && toMonday
      ? Math.round((new Date(toMonday).getTime() - new Date(fromMonday).getTime()) / (7 * 86400000)) + 1
      : 0;

  function preset(n: number) {
    setFrom(isoDate(addDays(thisMonday, -7 * (n - 1))));
    setTo(isoDate(thisMonday));
  }

  async function download() {
    setErr(null);
    if (weeks < 1) return setErr("La date de fin doit être après la date de début.");
    if (weeks > 53) return setErr("Maximum 53 semaines par export.");
    setLoading(true);
    try {
      const qs = new URLSearchParams({ from: fromMonday, to: toMonday, user: userId });
      const res = await fetch(`/api/export?${qs}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Erreur ${res.status}`);
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const name = /filename="([^"]+)"/.exec(cd)?.[1] ?? "BA-Tracker.xlsx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (e: any) {
      setErr(e.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="h-4 w-4" /> Exporter Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" /> Export Excel
          </DialogTitle>
          <DialogDescription>
            Une feuille par semaine (allocations, livrables, objectifs) + synthèse, charge projets et allocation par BA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { n: 1, l: "Semaine en cours" },
              { n: 4, l: "4 semaines" },
              { n: 8, l: "8 semaines" },
              { n: 13, l: "Trimestre" },
            ].map((p) => (
              <Button key={p.n} type="button" size="sm" variant="secondary" onClick={() => preset(p.n)}>
                {p.l}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Du</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              {fromMonday && <p className="text-xs text-muted-foreground">Semaine {weekLabel(fromMonday)}</p>}
            </div>
            <div className="space-y-2">
              <Label>Au</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              {toMonday && <p className="text-xs text-muted-foreground">Semaine {weekLabel(toMonday)}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Périmètre</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute l&apos;équipe</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            {weeks > 0 ? `${weeks} semaine(s) → ${weeks} feuille(s) détaillée(s)` : "Période invalide"}
          </p>

          {err && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={download} disabled={loading || weeks < 1}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Télécharger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
