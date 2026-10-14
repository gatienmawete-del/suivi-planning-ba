import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Profil pas encore matérialisé (devrait être rare grâce au trigger)
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar isAdmin={profile.role === "admin"} userName={profile.full_name} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
