"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { DeliverableStatus, DeliverablePriority } from "@/lib/types";

/**
 * Récupère ou crée le plan de la semaine pour un user.
 * Un plan draft est auto-créé si absent.
 */
export async function ensureWeeklyPlan(weekStart: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Chercher existant
  const { data: existing } = await supabase
    .from("weekly_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("weekly_plans")
    .insert({ user_id: user.id, week_start: weekStart, status: "draft" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

const updatePlanSchema = z.object({
  planId: z.string().uuid(),
  bench: z.number().min(0).max(1).nullable().optional(),
  comments: z.string().max(5000).nullable().optional(),
});

export async function updatePlanMeta(input: z.infer<typeof updatePlanSchema>) {
  const supabase = await createClient();
  const parsed = updatePlanSchema.parse(input);

  const { error } = await supabase
    .from("weekly_plans")
    .update({
      bench: parsed.bench,
      general_comments: parsed.comments,
    })
    .eq("id", parsed.planId);

  if (error) throw error;
  revalidatePath("/planning");
  revalidatePath("/dashboard");
}

// ---------- Projets dans le plan ----------

const planProjectSchema = z.object({
  planId: z.string().uuid(),
  projectId: z.string().uuid(),
  allocation: z.number().int().min(0).max(100),
});

export async function upsertPlanProject(input: z.infer<typeof planProjectSchema>) {
  const supabase = await createClient();
  const parsed = planProjectSchema.parse(input);

  const { error } = await supabase.from("plan_projects").upsert(
    {
      plan_id: parsed.planId,
      project_id: parsed.projectId,
      allocation_percent: parsed.allocation,
    },
    { onConflict: "plan_id,project_id" },
  );
  if (error) throw error;
  revalidatePath("/planning");
}

export async function deletePlanProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("plan_projects").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/planning");
}

// ---------- Livrables ----------

const deliverableSchema = z.object({
  planId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(["todo", "in_progress", "blocked", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  dueDate: z.string().nullable().optional(),
});

export async function createDeliverable(input: z.infer<typeof deliverableSchema>) {
  const supabase = await createClient();
  const parsed = deliverableSchema.parse(input);

  const { data: maxOrder } = await supabase
    .from("deliverables")
    .select("order_idx")
    .eq("plan_id", parsed.planId)
    .order("order_idx", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("deliverables").insert({
    plan_id: parsed.planId,
    project_id: parsed.projectId || null,
    title: parsed.title,
    description: parsed.description || null,
    status: parsed.status,
    priority: parsed.priority,
    due_date: parsed.dueDate || null,
    order_idx: (maxOrder?.order_idx ?? -1) + 1,
  });
  if (error) throw error;
  revalidatePath("/planning");
}

export async function updateDeliverable(
  id: string,
  patch: {
    title?: string;
    description?: string | null;
    status?: DeliverableStatus;
    priority?: DeliverablePriority;
    due_date?: string | null;
    project_id?: string | null;
  },
) {
  const supabase = await createClient();
  const update: Record<string, unknown> = { ...patch };
  if (patch.status === "done") update.completed_at = new Date().toISOString();
  if (patch.status && patch.status !== "done") update.completed_at = null;
  const { error } = await supabase.from("deliverables").update(update).eq("id", id);
  if (error) throw error;
  revalidatePath("/planning");
}

export async function deleteDeliverable(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("deliverables").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/planning");
}

// ---------- Objectifs ----------

const objectiveSchema = z.object({
  planId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).nullable().optional(),
  targetDate: z.string().nullable().optional(),
  progress: z.number().int().min(0).max(100).default(0),
});

export async function createObjective(input: z.infer<typeof objectiveSchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const parsed = objectiveSchema.parse(input);
  const { error } = await supabase.from("objectives").insert({
    user_id: user.id,
    plan_id: parsed.planId || null,
    project_id: parsed.projectId || null,
    title: parsed.title,
    description: parsed.description || null,
    target_date: parsed.targetDate || null,
    progress: parsed.progress,
    status: parsed.progress >= 100 ? "done" : "pending",
  });
  if (error) throw error;
  revalidatePath("/objectives");
  revalidatePath("/planning");
}

export async function updateObjectiveProgress(id: string, progress: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("objectives")
    .update({
      progress,
      status: progress >= 100 ? "done" : progress > 0 ? "on_track" : "pending",
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/objectives");
}

export async function deleteObjective(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("objectives").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/objectives");
}
