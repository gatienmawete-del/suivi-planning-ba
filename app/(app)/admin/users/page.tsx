import { createClient } from "@/lib/supabase/server";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const supabase = await createClient();

  const [{ data: users }, { data: projects }, { data: assignments }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name"),
    supabase.from("projects").select("*").eq("active", true).order("name"),
    supabase.from("assignments").select("*"),
  ]);

  return <UsersClient users={users ?? []} projects={projects ?? []} assignments={assignments ?? []} />;
}
