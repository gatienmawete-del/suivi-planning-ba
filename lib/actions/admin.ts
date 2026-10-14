"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Accès réservé à l'administrateur");
  return { supabase, userId: user.id };
}

// ---------- Users ----------

const createUserSchema = z.object({
  fullName: z.string().min(2).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  serviceLine: z.string().nullable().optional(),
  role: z.enum(["admin", "ba"]).default("ba"),
  projectIds: z.array(z.string().uuid()).optional(),
});

export async function createUser(input: z.infer<typeof createUserSchema>) {
  await requireAdmin();
  const parsed = createUserSchema.parse(input);
  const admin = createAdminClient();

  // 1. Créer l'auth user
  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email: parsed.email,
    password: parsed.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.fullName,
      role: parsed.role,
      service_line: parsed.serviceLine ?? null,
    },
  });
  if (authErr) throw authErr;
  const uid = created.user.id;

  // 2. Le trigger a dû créer le profil; on force role + service_line au cas où
  await admin.from("profiles").upsert(
    {
      id: uid,
      full_name: parsed.fullName,
      email: parsed.email,
      role: parsed.role,
      service_line: parsed.serviceLine ?? null,
    },
    { onConflict: "id" },
  );

  // 3. Affectations projets
  if (parsed.projectIds?.length) {
    const rows = parsed.projectIds.map((pid) => ({
      user_id: uid,
      project_id: pid,
    }));
    await admin.from("assignments").upsert(rows, { onConflict: "user_id,project_id" });
  }

  revalidatePath("/admin/users");
}

const updateUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2).max(200).optional(),
  email: z.string().email().optional(),
  serviceLine: z.string().nullable().optional(),
  role: z.enum(["admin", "ba"]).optional(),
  active: z.boolean().optional(),
  projectIds: z.array(z.string().uuid()).optional(),
});

export async function updateUser(input: z.infer<typeof updateUserSchema>) {
  await requireAdmin();
  const parsed = updateUserSchema.parse(input);
  const admin = createAdminClient();

  // Update email in Supabase Auth if changed
  if (parsed.email !== undefined) {
    const { error: authErr } = await admin.auth.admin.updateUserById(parsed.id, {
      email: parsed.email,
      email_confirm: true,
    });
    if (authErr) throw authErr;
  }

  const update: Record<string, unknown> = {};
  if (parsed.fullName !== undefined) update.full_name = parsed.fullName;
  if (parsed.email !== undefined) update.email = parsed.email;
  if (parsed.serviceLine !== undefined) update.service_line = parsed.serviceLine;
  if (parsed.role !== undefined) update.role = parsed.role;
  if (parsed.active !== undefined) update.active = parsed.active;

  if (Object.keys(update).length) {
    const { error } = await admin.from("profiles").update(update).eq("id", parsed.id);
    if (error) throw error;
  }

  if (parsed.projectIds !== undefined) {
    // Remplacer les affectations
    await admin.from("assignments").delete().eq("user_id", parsed.id);
    if (parsed.projectIds.length) {
      await admin.from("assignments").insert(
        parsed.projectIds.map((pid) => ({ user_id: parsed.id, project_id: pid })),
      );
    }
  }

  revalidatePath("/admin/users");
}

export async function resetUserPassword(userId: string, newPassword: string) {
  await requireAdmin();
  if (newPassword.length < 8) throw new Error("Mot de passe trop court (min 8)");
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) throw error;
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  // On préfère désactiver (soft-disable) plutôt que supprimer
  await admin.from("profiles").update({ active: false }).eq("id", userId);
  revalidatePath("/admin/users");
}

// ---------- Plans BA (admin édite) ----------

/**
 * Récupère ou crée le plan d'un BA pour une semaine donnée.
 * L'admin peut le faire pour n'importe quel utilisateur.
 */
export async function ensureWeeklyPlanForUser(userId: string, weekStart: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("weekly_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await admin
    .from("weekly_plans")
    .insert({ user_id: userId, week_start: weekStart, status: "draft" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function adminUpdatePlanMeta(input: {
  planId: string;
  bench?: number | null;
  comments?: string | null;
}) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("weekly_plans")
    .update({
      bench: input.bench,
      general_comments: input.comments,
    })
    .eq("id", input.planId);
  if (error) throw error;
  revalidatePath("/admin/team");
}

export async function adminUpsertPlanProject(input: {
  planId: string;
  projectId: string;
  allocation: number;
}) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("plan_projects").upsert(
    {
      plan_id: input.planId,
      project_id: input.projectId,
      allocation_percent: input.allocation,
    },
    { onConflict: "plan_id,project_id" },
  );
  if (error) throw error;
  revalidatePath("/admin/team");
}

export async function adminDeletePlanProject(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("plan_projects").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/team");
}

export async function adminCreateDeliverable(input: {
  planId: string;
  projectId?: string | null;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
}) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: maxOrder } = await admin
    .from("deliverables")
    .select("order_idx")
    .eq("plan_id", input.planId)
    .order("order_idx", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await admin.from("deliverables").insert({
    plan_id: input.planId,
    project_id: input.projectId || null,
    title: input.title,
    description: input.description || null,
    status: input.status ?? "todo",
    priority: input.priority ?? "medium",
    due_date: input.dueDate || null,
    order_idx: (maxOrder?.order_idx ?? -1) + 1,
  });
  if (error) throw error;
  revalidatePath("/admin/team");
}

export async function adminUpdateDeliverable(
  id: string,
  patch: Record<string, unknown>,
) {
  await requireAdmin();
  const admin = createAdminClient();
  const update: Record<string, unknown> = { ...patch };
  if (patch.status === "done") update.completed_at = new Date().toISOString();
  if (patch.status && patch.status !== "done") update.completed_at = null;
  const { error } = await admin.from("deliverables").update(update).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/team");
}

export async function adminDeleteDeliverable(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("deliverables").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/team");
}

export async function adminValidatePlan(planId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("weekly_plans")
    .update({ status: "validated", validated_at: new Date().toISOString() })
    .eq("id", planId);
  if (error) throw error;
  revalidatePath("/admin/team");
}

export async function adminResetPlanToDraft(planId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("weekly_plans")
    .update({ status: "draft", submitted_at: null, validated_at: null })
    .eq("id", planId);
  if (error) throw error;
  revalidatePath("/admin/team");
}

// ---------- Projects ----------

const projectSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(300),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

export async function createProject(input: z.infer<typeof projectSchema>) {
  const { supabase } = await requireAdmin();
  const parsed = projectSchema.parse(input);
  const { error } = await supabase.from("projects").insert({
    code: parsed.code,
    name: parsed.name,
    description: parsed.description ?? null,
    color: parsed.color ?? "#64748b",
  });
  if (error) throw error;
  revalidatePath("/admin/projects");
}

export async function updateProject(id: string, patch: Partial<z.infer<typeof projectSchema>> & { active?: boolean }) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("projects").update(patch).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/projects");
}

export async function deleteProject(id: string) {
  const { supabase } = await requireAdmin();
  // soft: on désactive
  const { error } = await supabase.from("projects").update({ active: false }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/projects");
}
