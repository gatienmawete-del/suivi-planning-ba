import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { mondayOf, isoDate, addDays } from "@/lib/utils";
import { buildWeeklyReport, type ExportData } from "@/lib/export/weekly-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_WEEKS = 53;

/** Requête `.in()` découpée pour éviter des URLs trop longues. */
async function selectIn<T>(
  admin: ReturnType<typeof createAdminClient>,
  table: string,
  columns: string,
  column: string,
  ids: string[],
): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += 150) {
    const chunk = ids.slice(i, i + 150);
    const { data, error } = await admin.from(table).select(columns).in(column, chunk);
    if (error) throw error;
    out.push(...((data ?? []) as T[]));
  }
  return out;
}

export async function GET(req: NextRequest) {
  // ---- Auth : admin ou viewer uniquement ----
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (me?.role !== "admin" && me?.role !== "viewer") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs et viewers" }, { status: 403 });
  }

  // ---- Paramètres ----
  const sp = req.nextUrl.searchParams;
  const today = mondayOf();
  const parse = (v: string | null, fallback: Date) => {
    if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return fallback;
    const d = new Date(v + "T00:00:00Z");
    return isNaN(d.getTime()) ? fallback : mondayOf(d);
  };
  let from = parse(sp.get("from"), addDays(today, -21));
  let to = parse(sp.get("to"), today);
  if (from > to) [from, to] = [to, from];
  const weeksCount = Math.round((to.getTime() - from.getTime()) / (7 * 86400000)) + 1;
  if (weeksCount > MAX_WEEKS) {
    return NextResponse.json({ error: `Période trop longue (max ${MAX_WEEKS} semaines)` }, { status: 400 });
  }
  const fromIso = isoDate(from);
  const toIso = isoDate(to);
  const toEndIso = isoDate(addDays(to, 6));
  const userFilter = sp.get("user");
  const filterUserId = userFilter && userFilter !== "all" ? userFilter : null;

  // ---- Données (client service_role après contrôle du rôle) ----
  const admin = createAdminClient();

  const [{ data: users, error: e1 }, { data: projects, error: e2 }] = await Promise.all([
    admin.from("profiles").select("id, full_name, email, service_line, role, active").order("full_name"),
    admin.from("projects").select("id, code, name, color"),
  ]);
  if (e1 || e2) return NextResponse.json({ error: (e1 ?? e2)!.message }, { status: 500 });

  let plansQ = admin
    .from("weekly_plans")
    .select("id, user_id, week_start")
    .gte("week_start", fromIso)
    .lte("week_start", toIso);
  if (filterUserId) plansQ = plansQ.eq("user_id", filterUserId);
  const { data: plans, error: e3 } = await plansQ;
  if (e3) return NextResponse.json({ error: e3.message }, { status: 500 });

  const planIds = (plans ?? []).map((p) => p.id);

  let looseObjQ = admin
    .from("objectives")
    .select("user_id, plan_id, project_id, title, description, target_date, status, progress")
    .is("plan_id", null);
  if (filterUserId) looseObjQ = looseObjQ.eq("user_id", filterUserId);

  try {
    const [planProjects, deliverables, planObjectives, { data: looseObjectives }] =
      await Promise.all([
        selectIn<any>(admin, "plan_projects", "plan_id, project_id, allocation_percent", "plan_id", planIds),
        selectIn<any>(
          admin,
          "deliverables",
          "plan_id, project_id, title, description, status, priority, due_date, completed_at, order_idx",
          "plan_id",
          planIds,
        ),
        selectIn<any>(
          admin,
          "objectives",
          "user_id, plan_id, project_id, title, description, target_date, status, progress",
          "plan_id",
          planIds,
        ),
        looseObjQ,
      ]);

    const scopedUsers = filterUserId ? (users ?? []).filter((u) => u.id === filterUserId) : users ?? [];
    const scopeLabel = filterUserId
      ? `Membre : ${scopedUsers[0]?.full_name ?? "inconnu"}`
      : "Périmètre : toute l'équipe";

    const data: ExportData = {
      from: fromIso,
      to: toIso,
      generatedAt: new Date(),
      generatedBy: me?.full_name ?? "—",
      scopeLabel,
      users: scopedUsers as any,
      projects: (projects ?? []) as any,
      plans: (plans ?? []) as any,
      planProjects,
      deliverables,
      objectives: [...planObjectives, ...((looseObjectives ?? []) as any[])],
      vacations: [],
    };

    const buffer = await buildWeeklyReport(data);

    const who = filterUserId
      ? "_" + (scopedUsers[0]?.full_name ?? "membre").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-")
      : "_equipe";
    const filename = `BA-Tracker${who}_${fromIso}_au_${toEndIso}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur export" }, { status: 500 });
  }
}
