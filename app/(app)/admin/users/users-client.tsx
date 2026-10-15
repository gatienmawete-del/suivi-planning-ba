"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createUser, updateUser, resetUserPassword, deleteUser, purgeUser } from "@/lib/actions/admin";
import { SERVICE_LINES, type Profile, type Project } from "@/lib/types";
import { Plus, Users2, Loader2, Edit, KeyRound, PowerOff, Power, Search, Trash2, AlertTriangle } from "lucide-react";

export function UsersClient({
  users,
  projects,
  assignments,
}: {
  users: Profile[];
  projects: Project[];
  assignments: Array<{ user_id: string; project_id: string }>;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase()) ||
      (u.service_line ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  function assignedProjectIds(userId: string) {
    return assignments.filter((a) => a.user_id === userId).map((a) => a.project_id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            <Users2 className="mb-1 mr-2 inline h-6 w-6" />
            Utilisateurs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.filter((u) => u.active).length} actifs · {users.length} au total
          </p>
        </div>
        <CreateUserDialog projects={projects} onDone={() => router.refresh()} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email, service…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Projets affectés</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => {
                const userProjects = projects.filter((p) =>
                  assignedProjectIds(u.id).includes(p.id),
                );
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.full_name} color={u.avatar_color} />
                        <div>
                          <div className="font-medium">{u.full_name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{u.service_line ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : u.role === "viewer" ? "outline" : "secondary"}>
                        {u.role === "admin" ? "Admin" : u.role === "viewer" ? "Viewer" : "BA"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {userProjects.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          userProjects.slice(0, 3).map((p) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]"
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: p.color ?? "#64748b" }}
                              />
                              {p.code}
                            </span>
                          ))
                        )}
                        {userProjects.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{userProjects.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.active ? "default" : "outline"}>
                        {u.active ? "Actif" : "Désactivé"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <UserActions
                        user={u}
                        projects={projects}
                        currentProjectIds={assignedProjectIds(u.id)}
                        onDone={() => router.refresh()}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateUserDialog({ projects, onDone }: { projects: Project[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serviceLine, setServiceLine] = useState<string>("BA");
  const [role, setRole] = useState<"admin" | "ba" | "viewer">("ba");
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toggleProject(id: string) {
    setProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await createUser({ fullName, email, password, serviceLine, role, projectIds });
      setFullName("");
      setEmail("");
      setPassword("");
      setProjectIds([]);
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
          <Plus className="h-4 w-4" /> Nouvel utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Crée un compte BA, admin ou viewer, et affecte-le immédiatement à des projets.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom complet *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe temporaire *</Label>
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Au moins 8 caractères"
              />
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={serviceLine} onValueChange={setServiceLine}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_LINES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "ba" | "viewer")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ba">BA</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer (lecture seule)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Affecter aux projets</Label>
            <div className="max-h-48 overflow-y-auto rounded-md border p-2">
              {projects.length === 0 ? (
                <p className="p-2 text-xs text-muted-foreground">
                  Aucun projet. Crée-les dans « Projets ».
                </p>
              ) : (
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
                        className="rounded border-input"
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: p.color ?? "#64748b" }}
                      />
                      <span>{p.name}</span>
                      <span className="text-xs text-muted-foreground">({p.code})</span>
                    </label>
                  ))}
                </div>
              )}
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

function UserActions({
  user,
  projects,
  currentProjectIds,
  onDone,
}: {
  user: Profile;
  projects: Project[];
  currentProjectIds: string[];
  onDone: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);

  async function toggleActive() {
    if (!confirm(user.active ? "Désactiver cet utilisateur ?" : "Réactiver cet utilisateur ?")) return;
    if (user.active) {
      await deleteUser(user.id);
    } else {
      await updateUser({ id: user.id, active: true });
    }
    onDone();
  }

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)} aria-label="Modifier">
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setPwOpen(true)} aria-label="Mot de passe">
        <KeyRound className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={toggleActive} aria-label="Statut">
        {user.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setPurgeOpen(true)}
        aria-label="Supprimer définitivement"
        title="Supprimer définitivement"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {editOpen && (
        <EditUserDialog
          user={user}
          projects={projects}
          currentProjectIds={currentProjectIds}
          open={editOpen}
          onOpenChange={setEditOpen}
          onDone={onDone}
        />
      )}
      {pwOpen && (
        <ResetPasswordDialog
          user={user}
          open={pwOpen}
          onOpenChange={setPwOpen}
        />
      )}
      {purgeOpen && (
        <PurgeUserDialog
          user={user}
          open={purgeOpen}
          onOpenChange={setPurgeOpen}
          onDone={onDone}
        />
      )}
    </div>
  );
}

function EditUserDialog({
  user,
  projects,
  currentProjectIds,
  open,
  onOpenChange,
  onDone,
}: {
  user: Profile;
  projects: Project[];
  currentProjectIds: string[];
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onDone: () => void;
}) {
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [serviceLine, setServiceLine] = useState(user.service_line ?? "BA");
  const [role, setRole] = useState<"admin" | "ba" | "viewer">(user.role);
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
      await updateUser({
        id: user.id,
        fullName,
        email,
        serviceLine,
        role,
        projectIds,
      });
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier {user.full_name}</DialogTitle>
          <DialogDescription>Attributions et paramètres de l&apos;utilisateur.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={serviceLine} onValueChange={setServiceLine}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_LINES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "ba" | "viewer")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ba">BA</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer (lecture seule)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Projets affectés</Label>
            <div className="max-h-48 overflow-y-auto rounded-md border p-2">
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

function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: Profile;
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      await resetUserPassword(user.id, pw);
      setMsg("Mot de passe mis à jour.");
      setPw("");
    } catch (e: any) {
      setErr(e.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogDescription>
            Nouveau mot de passe pour <b>{user.full_name}</b> ({user.email})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nouveau mot de passe</Label>
            <Input
              type="text"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              minLength={8}
              required
            />
          </div>
          {msg && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              {msg}
            </div>
          )}
          {err && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Changer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PurgeUserDialog({
  user,
  open,
  onOpenChange,
  onDone,
}: {
  user: Profile;
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onDone: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const canDelete = confirmText.trim() === user.full_name.trim();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canDelete) return;
    setErr(null);
    setLoading(true);
    try {
      await purgeUser(user.id);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Supprimer définitivement
          </DialogTitle>
          <DialogDescription>
            Cette action est <b>irréversible</b>. Le compte de <b>{user.full_name}</b> ({user.email}) sera
            supprimé avec tout son historique.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <ul className="list-disc space-y-1 rounded-md border border-destructive/30 bg-destructive/5 py-3 pl-8 pr-3 text-sm">
            <li>Plannings hebdomadaires et allocations projets</li>
            <li>Livrables et objectifs</li>
            <li>Congés et affectations aux projets</li>
            <li>Compte de connexion et journal d&apos;activité</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Astuce : pour garder l&apos;historique, utilise plutôt le bouton « Désactiver ».
          </p>
          <div className="space-y-2">
            <Label>
              Pour confirmer, tape le nom complet : <b>{user.full_name}</b>
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              placeholder={user.full_name}
            />
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
            <Button type="submit" variant="destructive" disabled={!canDelete || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
