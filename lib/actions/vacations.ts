"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const vacationSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  interimUserId: z.string().uuid().nullable().optional(),
  interimText: z.string().nullable().optional(),
  comments: z.string().max(2000).nullable().optional(),
});

export async function requestVacation(input: z.infer<typeof vacationSchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const parsed = vacationSchema.parse(input);
  const start = new Date(parsed.startDate);
  const end = new Date(parsed.endDate);
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);

  const { error } = await supabase.from("vacations").insert({
    user_id: user.id,
    start_date: parsed.startDate,
    end_date: parsed.endDate,
    days_count: days,
    interim_user_id: parsed.interimUserId || null,
    interim_text: parsed.interimText || null,
    comments: parsed.comments || null,
    status: "requested",
  });
  if (error) throw error;
  revalidatePath("/vacations");
  revalidatePath("/admin/team");
}

export async function cancelVacation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("vacations")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/vacations");
}

export async function decideVacation(id: string, decision: "approved" | "rejected") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("vacations")
    .update({
      status: decision,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/team");
  revalidatePath("/vacations");
}
