import { createClient } from "@/lib/supabase/server";
import { ObjectivesClient } from "./objectives-client";

export const dynamic = "force-dynamic";

export default async function ObjectivesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: objectives } = await supabase
    .from("objectives")
    .select("*")
    .eq("user_id", user.id)
    .order("target_date", { ascending: true, nullsFirst: false });

  return <ObjectivesClient objectives={objectives ?? []} />;
}
