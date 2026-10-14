import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gère ton profil et ton mot de passe.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
          <CardDescription>
            Email : <span className="font-medium text-foreground">{profile?.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm profile={profile!} />
        </CardContent>
      </Card>
    </div>
  );
}
