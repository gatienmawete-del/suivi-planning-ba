"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function SettingsForm({ profile }: { profile: any }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    const supabase = createClient();

    try {
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", profile.id);
      if (pErr) throw pErr;

      if (newPassword) {
        if (newPassword.length < 8) throw new Error("Mot de passe trop court (min 8).");
        const { error: aErr } = await supabase.auth.updateUser({ password: newPassword });
        if (aErr) throw aErr;
      }

      setMsg("Modifications enregistrées.");
      setNewPassword("");
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pw">Nouveau mot de passe</Label>
        <Input
          id="pw"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Laisser vide pour ne pas changer"
          autoComplete="new-password"
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
      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
