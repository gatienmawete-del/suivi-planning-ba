import { createClient } from "@/lib/supabase/server";
import { ProjectsClient } from "./projects-client";

export const dynamic = "force-dynamic";

export default async function ProjectsAdminPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase.from("projects").select("*").order("name");
  const { data: assignmentsCount } = await supabase
    .from("assignments")
    .select("project_id");

  return <ProjectsClient projects={projects ?? []} assignmentsCount={assignmentsCount ?? []} />;
}
