import { createClient } from "@/lib/supabase/server";
import { VacationsClient } from "./vacations-client";

export const dynamic = "force-dynamic";

export default async function VacationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: vacations }, { data: teammates }] = await Promise.all([
    supabase
      .from("vacations")
      .select("*, interim:profiles!vacations_interim_user_id_fkey(full_name)")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("active", true)
      .neq("id", user.id)
      .order("full_name"),
  ]);

  return <VacationsClient vacations={vacations ?? []} teammates={teammates ?? []} />;
}
