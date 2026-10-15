import ExcelJS from "exceljs";

/* =====================================================================
 * Rapport Excel BA Tracker
 *  - Synthèse      : KPIs par semaine (+ totaux en formules)
 *  - Charge projets: ETP par projet et par semaine
 *  - Allocation BA : % alloué par BA et par semaine (alerte > 100 %)
 *  - 1 feuille / semaine : statut des plans, allocations, livrables, objectifs
 *  - Objectifs hors semaine (si présents)
 * ===================================================================== */

export type ExportUser = {
  id: string;
  full_name: string;
  email: string;
  service_line: string | null;
  role: string;
  active: boolean;
};
export type ExportProject = { id: string; code: string; name: string; color: string | null };
export type ExportPlan = {
  id: string;
  user_id: string;
  week_start: string;
  status: "draft" | "submitted" | "validated";
  bench: number | null;
  general_comments: string | null;
  submitted_at: string | null;
  validated_at: string | null;
};
export type ExportPlanProject = { plan_id: string; project_id: string; allocation_percent: number };
export type ExportDeliverable = {
  plan_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "critical";
  due_date: string | null;
  completed_at: string | null;
  order_idx: number;
};
export type ExportObjective = {
  user_id: string;
  plan_id: string | null;
  project_id: string | null;
  title: string;
  description: string | null;
  target_date: string | null;
  status: string;
  progress: number;
};
export type ExportVacation = {
  user_id: string;
  start_date: string;
  end_date: string;
  days_count: number | null;
  status: string;
};

export type ExportData = {
  from: string; // lundi ISO
  to: string; // lundi ISO
  generatedAt: Date;
  generatedBy: string;
  scopeLabel: string;
  users: ExportUser[];
  projects: ExportProject[];
  plans: ExportPlan[];
  planProjects: ExportPlanProject[];
  deliverables: ExportDeliverable[];
  objectives: ExportObjective[];
  vacations: ExportVacation[];
};

/* ---------- Palette ---------- */
const C = {
  navy: "FF0F172A",
  navySoft: "FF1E293B",
  accent: "FF2563EB",
  accentSoft: "FFDBEAFE",
  white: "FFFFFFFF",
  zebra: "FFF8FAFC",
  border: "FFE2E8F0",
  muted: "FF64748B",
  text: "FF0F172A",
  sectionBg: "FFEFF6FF",
};

const DELIV_STATUS: Record<string, { label: string; fill: string; font: string }> = {
  todo: { label: "À faire", fill: "FFF1F5F9", font: "FF334155" },
  in_progress: { label: "En cours", fill: "FFDBEAFE", font: "FF1D4ED8" },
  blocked: { label: "Bloqué", fill: "FFFEE2E2", font: "FFB91C1C" },
  done: { label: "Terminé", fill: "FFD1FAE5", font: "FF047857" },
};
const PLAN_STATUS: Record<string, { label: string; fill: string; font: string }> = {
  draft: { label: "Brouillon", fill: "FFF1F5F9", font: "FF475569" },
  submitted: { label: "Soumis", fill: "FFFEF3C7", font: "FFB45309" },
  validated: { label: "Validé", fill: "FFD1FAE5", font: "FF047857" },
  none: { label: "Non renseigné", fill: "FFFFFFFF", font: "FF94A3B8" },
};
const PRIORITY: Record<string, { label: string; font: string; rank: number }> = {
  critical: { label: "Critique", font: "FFDC2626", rank: 0 },
  high: { label: "Haute", font: "FFEA580C", rank: 1 },
  medium: { label: "Normale", font: "FF2563EB", rank: 2 },
  low: { label: "Basse", font: "FF64748B", rank: 3 },
};
const OBJ_STATUS: Record<string, string> = {
  pending: "En attente",
  on_track: "En bonne voie",
  at_risk: "À risque",
  done: "Atteint",
};

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MONTHS_LONG = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/* ---------- Helpers dates ---------- */
function utc(iso: string) {
  return new Date(iso.slice(0, 10) + "T00:00:00Z");
}
function addDaysIso(iso: string, n: number) {
  const d = utc(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function isoWeekNumber(iso: string) {
  const d = utc(iso);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const diff = (d.getTime() - firstThursday.getTime()) / 86400000;
  return 1 + Math.round((diff - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}
function shortDate(iso: string) {
  const d = utc(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]}`;
}
function weekRangeLong(iso: string) {
  const s = utc(iso);
  const e = utc(addDaysIso(iso, 6));
  const sameMonth = s.getUTCMonth() === e.getUTCMonth();
  return sameMonth
    ? `du ${s.getUTCDate()} au ${e.getUTCDate()} ${MONTHS_LONG[e.getUTCMonth()]} ${e.getUTCFullYear()}`
    : `du ${s.getUTCDate()} ${MONTHS_LONG[s.getUTCMonth()]} au ${e.getUTCDate()} ${MONTHS_LONG[e.getUTCMonth()]} ${e.getUTCFullYear()}`;
}
function weeksBetween(from: string, to: string) {
  const out: string[] = [];
  for (let w = from; w <= to; w = addDaysIso(w, 7)) out.push(w);
  return out;
}
function sheetNameForWeek(iso: string) {
  const s = utc(iso);
  const e = utc(addDaysIso(iso, 6));
  const p = (n: number) => String(n).padStart(2, "0");
  return `S${p(isoWeekNumber(iso))} (${p(s.getUTCDate())}.${p(s.getUTCMonth() + 1)}-${p(e.getUTCDate())}.${p(e.getUTCMonth() + 1)})`;
}
function argb(hex: string | null | undefined, fallback = "FF64748B") {
  if (!hex) return fallback;
  const h = hex.replace("#", "").trim();
  return /^[0-9a-fA-F]{6}$/.test(h) ? "FF" + h.toUpperCase() : fallback;
}
function lighten(hexArgb: string, ratio = 0.82) {
  const h = hexArgb.slice(2);
  const mix = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16);
    return Math.round(v + (255 - v) * ratio).toString(16).padStart(2, "0");
  };
  return ("FF" + mix(0) + mix(2) + mix(4)).toUpperCase();
}
function colLetter(n: number) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/* ---------- Helpers style ---------- */
const thin = { style: "thin" as const, color: { argb: C.border } };
const allBorders = { top: thin, left: thin, bottom: thin, right: thin };

function fill(argbColor: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb: argbColor } };
}

function styleHeaderRow(row: ExcelJS.Row, from: number, to: number) {
  row.height = 22;
  for (let c = from; c <= to; c++) {
    const cell = row.getCell(c);
    cell.fill = fill(C.navySoft);
    cell.font = { bold: true, color: { argb: C.white }, size: 10 };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = allBorders;
  }
}

function styleDataRow(row: ExcelJS.Row, from: number, to: number, zebra: boolean) {
  for (let c = from; c <= to; c++) {
    const cell = row.getCell(c);
    if (zebra && !cell.fill) cell.fill = fill(C.zebra);
    cell.border = allBorders;
    cell.font = { size: 10, color: { argb: C.text }, ...(cell.font ?? {}) };
    cell.alignment = { vertical: "top", wrapText: true, ...(cell.alignment ?? {}) };
  }
}

function pill(cell: ExcelJS.Cell, label: string, fillArgb: string, fontArgb: string) {
  cell.value = label;
  cell.fill = fill(fillArgb);
  cell.font = { bold: true, size: 10, color: { argb: fontArgb } };
  cell.alignment = { horizontal: "center", vertical: "top" };
}

function sectionTitle(ws: ExcelJS.Worksheet, rowIdx: number, lastCol: number, title: string, subtitle?: string) {
  ws.mergeCells(rowIdx, 1, rowIdx, lastCol);
  const cell = ws.getCell(rowIdx, 1);
  cell.value = subtitle ? `${title}   ·   ${subtitle}` : title;
  cell.font = { bold: true, size: 12, color: { argb: C.accent } };
  cell.fill = fill(C.sectionBg);
  cell.alignment = { vertical: "middle", indent: 1 };
  cell.border = { left: { style: "thick", color: { argb: C.accent } } };
  ws.getRow(rowIdx).height = 24;
}

function emptyLine(ws: ExcelJS.Worksheet, rowIdx: number, lastCol: number, text: string) {
  ws.mergeCells(rowIdx, 1, rowIdx, lastCol);
  const cell = ws.getCell(rowIdx, 1);
  cell.value = text;
  cell.font = { italic: true, size: 10, color: { argb: C.muted } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.border = allBorders;
  ws.getRow(rowIdx).height = 20;
}

function banner(ws: ExcelJS.Worksheet, lastCol: number, title: string, subtitle: string) {
  ws.mergeCells(1, 1, 1, lastCol);
  const t = ws.getCell(1, 1);
  t.value = title;
  t.font = { bold: true, size: 16, color: { argb: C.white } };
  t.fill = fill(C.navy);
  t.alignment = { vertical: "middle", indent: 1 };
  ws.getRow(1).height = 34;

  ws.mergeCells(2, 1, 2, lastCol);
  const s = ws.getCell(2, 1);
  s.value = subtitle;
  s.font = { size: 10, color: { argb: "FFCBD5E1" } };
  s.fill = fill(C.navy);
  s.alignment = { vertical: "middle", indent: 1 };
  ws.getRow(2).height = 20;
}

function kpiStrip(ws: ExcelJS.Worksheet, rowIdx: number, items: Array<{ label: string; value: string | number; color?: string }>, lastCol: number) {
  // Répartit les KPIs sur les colonnes disponibles (2 colonnes par KPI max)
  const span = Math.max(1, Math.floor(lastCol / items.length));
  ws.getRow(rowIdx).height = 16;
  ws.getRow(rowIdx + 1).height = 26;
  items.forEach((it, i) => {
    const c1 = 1 + i * span;
    const c2 = i === items.length - 1 ? lastCol : c1 + span - 1;
    if (c2 > c1) {
      ws.mergeCells(rowIdx, c1, rowIdx, c2);
      ws.mergeCells(rowIdx + 1, c1, rowIdx + 1, c2);
    }
    const l = ws.getCell(rowIdx, c1);
    l.value = it.label.toUpperCase();
    l.font = { size: 8, bold: true, color: { argb: C.muted } };
    l.alignment = { horizontal: "center", vertical: "bottom" };
    l.fill = fill(C.white);
    const v = ws.getCell(rowIdx + 1, c1);
    v.value = it.value;
    v.font = { size: 16, bold: true, color: { argb: it.color ?? C.text } };
    v.alignment = { horizontal: "center", vertical: "middle" };
    v.fill = fill(C.white);
    for (let c = c1; c <= c2; c++) {
      ws.getCell(rowIdx, c).border = { top: thin, left: c === c1 ? thin : undefined, right: c === c2 ? thin : undefined };
      ws.getCell(rowIdx + 1, c).border = { bottom: thin, left: c === c1 ? thin : undefined, right: c === c2 ? thin : undefined };
    }
  });
}

function setupPrint(ws: ExcelJS.Worksheet, landscape = true) {
  ws.pageSetup = {
    orientation: landscape ? "landscape" : "portrait",
    paperSize: 9, // A4
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
  };
  ws.headerFooter = {
    oddFooter: "&L&8BA Tracker&C&8&A&R&8Page &P / &N",
  };
}

/* =====================================================================
 * Construction
 * ===================================================================== */
export async function buildWeeklyReport(data: ExportData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "BA Tracker";
  wb.lastModifiedBy = data.generatedBy;
  wb.created = data.generatedAt;
  wb.modified = data.generatedAt;

  const weeks = weeksBetween(data.from, data.to);
  const userById = new Map(data.users.map((u) => [u.id, u]));
  const projectById = new Map(data.projects.map((p) => [p.id, p]));
  const planById = new Map(data.plans.map((p) => [p.id, p]));
  const userName = (id: string) => userById.get(id)?.full_name ?? "—";

  // Membres affichés : ceux qui contribuent (BA/admin actifs) + ceux qui ont un plan sur la période
  const usersWithPlans = new Set(data.plans.map((p) => p.user_id));
  const members = data.users
    .filter((u) => (u.role !== "viewer" && u.active) || usersWithPlans.has(u.id))
    .sort((a, b) => a.full_name.localeCompare(b.full_name, "fr"));

  const generated = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Brazzaville",
  }).format(data.generatedAt);
  const periodLabel = `Période : semaine ${isoWeekNumber(data.from)} (${shortDate(data.from)}) → semaine ${isoWeekNumber(data.to)} (${shortDate(addDaysIso(data.to, 6))} ${utc(addDaysIso(data.to, 6)).getUTCFullYear()})`;

  // Pré-calcul par semaine
  const perWeek = weeks.map((w) => {
    const plans = data.plans.filter((p) => p.week_start === w);
    const planIds = new Set(plans.map((p) => p.id));
    const delivs = data.deliverables.filter((d) => planIds.has(d.plan_id));
    const objs = data.objectives.filter((o) => o.plan_id && planIds.has(o.plan_id));
    const pps = data.planProjects.filter((pp) => planIds.has(pp.plan_id));
    return { week: w, sheet: sheetNameForWeek(w), plans, delivs, objs, pps };
  });

  /* ---------------- 1. SYNTHÈSE ---------------- */
  const syn = wb.addWorksheet("Synthèse", {
    properties: { tabColor: { argb: C.navy } },
    views: [{ state: "frozen", ySplit: 7, showGridLines: false }],
  });
  const synCols = [
    { h: "Semaine", w: 22 },
    { h: "Période", w: 18 },
    { h: "Plans renseignés", w: 11 },
    { h: "Validés", w: 9 },
    { h: "Soumis", w: 9 },
    { h: "Brouillons", w: 10 },
    { h: "Livrables", w: 10 },
    { h: "Terminés", w: 10 },
    { h: "En cours", w: 10 },
    { h: "Bloqués", w: 9 },
    { h: "Taux de complétion", w: 13 },
    { h: "Objectifs", w: 10 },
    { h: "Progression moy. objectifs", w: 14 },
    { h: "Allocation moy. / BA", w: 13 },
  ];
  synCols.forEach((c, i) => (syn.getColumn(i + 1).width = c.w));
  const synLast = synCols.length;
  banner(syn, synLast, "BA Tracker — Rapport d'activité hebdomadaire", `${periodLabel}   ·   ${data.scopeLabel}   ·   Généré le ${generated} par ${data.generatedBy}`);

  const totDeliv = data.deliverables.length;
  const totDone = data.deliverables.filter((d) => d.status === "done").length;
  const totBlocked = data.deliverables.filter((d) => d.status === "blocked").length;
  kpiStrip(
    syn,
    4,
    [
      { label: "Semaines", value: weeks.length },
      { label: "Membres", value: members.length },
      { label: "Plans renseignés", value: data.plans.length },
      { label: "Livrables", value: totDeliv },
      { label: "Terminés", value: totDeliv ? `${Math.round((totDone / totDeliv) * 100)} %` : "—", color: "FF047857" },
      { label: "Bloqués", value: totBlocked, color: totBlocked ? "FFB91C1C" : C.text },
      { label: "Objectifs", value: data.objectives.filter((o) => o.plan_id).length },
    ],
    synLast,
  );

  const synHeaderRow = 7;
  const hr = syn.getRow(synHeaderRow);
  synCols.forEach((c, i) => (hr.getCell(i + 1).value = c.h));
  styleHeaderRow(hr, 1, synLast);
  hr.height = 32;

  let r = synHeaderRow + 1;
  const firstDataRow = r;
  perWeek.forEach((pw, idx) => {
    const row = syn.getRow(r);
    const objAvg = pw.objs.length ? pw.objs.reduce((s, o) => s + o.progress, 0) / pw.objs.length / 100 : null;
    const allocAvg = pw.plans.length
      ? pw.plans.reduce(
          (s, p) => s + pw.pps.filter((pp) => pp.plan_id === p.id).reduce((a, pp) => a + pp.allocation_percent, 0),
          0,
        ) /
        pw.plans.length /
        100
      : null;

    row.getCell(1).value = { text: `Semaine ${isoWeekNumber(pw.week)}  →`, hyperlink: `#'${pw.sheet}'!A1` };
    row.getCell(1).font = { color: { argb: C.accent }, underline: true, bold: true, size: 10 };
    row.getCell(2).value = `${shortDate(pw.week)} – ${shortDate(addDaysIso(pw.week, 6))}`;
    row.getCell(3).value = pw.plans.length;
    row.getCell(4).value = pw.plans.filter((p) => p.status === "validated").length;
    row.getCell(5).value = pw.plans.filter((p) => p.status === "submitted").length;
    row.getCell(6).value = pw.plans.filter((p) => p.status === "draft").length;
    row.getCell(7).value = pw.delivs.length;
    row.getCell(8).value = pw.delivs.filter((d) => d.status === "done").length;
    row.getCell(9).value = pw.delivs.filter((d) => d.status === "in_progress").length;
    row.getCell(10).value = pw.delivs.filter((d) => d.status === "blocked").length;
    row.getCell(11).value = { formula: `IF(G${r}=0,"",H${r}/G${r})` };
    row.getCell(11).numFmt = "0%";
    row.getCell(12).value = pw.objs.length;
    row.getCell(13).value = objAvg ?? "";
    row.getCell(13).numFmt = "0%";
    row.getCell(14).value = allocAvg ?? "";
    row.getCell(14).numFmt = "0%";
    styleDataRow(row, 1, synLast, idx % 2 === 1);
    for (let c = 2; c <= synLast; c++) row.getCell(c).alignment = { horizontal: "center", vertical: "middle" };
    if ((row.getCell(10).value as number) > 0) row.getCell(10).font = { bold: true, size: 10, color: { argb: "FFB91C1C" } };
    row.height = 20;
    r++;
  });
  const lastDataRow = r - 1;

  // Ligne de total (formules)
  if (perWeek.length) {
    const tr = syn.getRow(r);
    tr.getCell(1).value = "TOTAL";
    tr.getCell(2).value = `${weeks.length} semaine(s)`;
    for (const c of [3, 4, 5, 6, 7, 8, 9, 10, 12]) {
      const L = colLetter(c);
      tr.getCell(c).value = { formula: `SUM(${L}${firstDataRow}:${L}${lastDataRow})` };
    }
    tr.getCell(11).value = { formula: `IF(G${r}=0,"",H${r}/G${r})` };
    tr.getCell(11).numFmt = "0%";
    tr.getCell(13).value = { formula: `IFERROR(AVERAGE(M${firstDataRow}:M${lastDataRow}),"")` };
    tr.getCell(13).numFmt = "0%";
    tr.getCell(14).value = { formula: `IFERROR(AVERAGE(N${firstDataRow}:N${lastDataRow}),"")` };
    tr.getCell(14).numFmt = "0%";
    for (let c = 1; c <= synLast; c++) {
      const cell = tr.getCell(c);
      cell.font = { bold: true, size: 10, color: { argb: C.white } };
      cell.fill = fill(C.accent);
      cell.border = allBorders;
      cell.alignment = { horizontal: c === 1 ? "left" : "center", vertical: "middle", indent: c === 1 ? 1 : 0 };
    }
    tr.height = 22;

    syn.addConditionalFormatting({
      ref: `K${firstDataRow}:K${lastDataRow}`,
      rules: [
        {
          type: "dataBar",
          priority: 1,
          minLength: 0,
          maxLength: 100,
          gradient: false,
          cfvo: [
            { type: "num", value: 0 },
            { type: "num", value: 1 },
          ],
          color: { argb: "FF34D399" },
        } as any,
      ],
    });
    syn.addConditionalFormatting({
      ref: `M${firstDataRow}:M${lastDataRow}`,
      rules: [
        {
          type: "dataBar",
          priority: 2,
          minLength: 0,
          maxLength: 100,
          gradient: false,
          cfvo: [
            { type: "num", value: 0 },
            { type: "num", value: 1 },
          ],
          color: { argb: "FF60A5FA" },
        } as any,
      ],
    });
  }

  // Légende
  r += 2;
  syn.getCell(r, 1).value = "Légende";
  syn.getCell(r, 1).font = { bold: true, size: 10, color: { argb: C.muted } };
  r++;
  const legend: Array<[string, string, string]> = [
    ...Object.values(PLAN_STATUS).filter((s) => s.label !== "Non renseigné").map((s) => [s.label, s.fill, s.font] as [string, string, string]),
    ...Object.values(DELIV_STATUS).map((s) => [s.label, s.fill, s.font] as [string, string, string]),
  ];
  legend.forEach(([label, f, fo], i) => pill(syn.getCell(r, 1 + i), label, f, fo));
  r++;
  syn.getCell(r, 1).value = "Clique sur une semaine pour ouvrir sa feuille détaillée. Les allocations sont exprimées en % du temps de la semaine.";
  syn.getCell(r, 1).font = { italic: true, size: 9, color: { argb: C.muted } };
  setupPrint(syn);

  /* ---------------- 2. CHARGE PROJETS (ETP) ---------------- */
  const usedProjectIds = Array.from(new Set(data.planProjects.map((pp) => pp.project_id)));
  const usedProjects = usedProjectIds
    .map((id) => projectById.get(id))
    .filter((p): p is ExportProject => !!p)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  const cp = wb.addWorksheet("Charge projets", {
    properties: { tabColor: { argb: C.accent } },
    views: [{ state: "frozen", xSplit: 3, ySplit: 4, showGridLines: false }],
  });
  const cpLast = 3 + weeks.length + 1;
  cp.getColumn(1).width = 3;
  cp.getColumn(2).width = 12;
  cp.getColumn(3).width = 32;
  weeks.forEach((_, i) => (cp.getColumn(4 + i).width = 11));
  cp.getColumn(cpLast).width = 12;
  banner(cp, Math.max(cpLast, 6), "Charge par projet (ETP)", "1 ETP = une personne à 100 % sur la semaine. Somme des allocations de tous les BA.");

  const cph = cp.getRow(4);
  cph.getCell(1).value = "";
  cph.getCell(2).value = "Code";
  cph.getCell(3).value = "Projet";
  weeks.forEach((w, i) => (cph.getCell(4 + i).value = `S${isoWeekNumber(w)}\n${shortDate(w)}`));
  cph.getCell(cpLast).value = "Moyenne";
  styleHeaderRow(cph, 1, cpLast);
  cph.height = 32;

  let cr = 5;
  const cpFirst = cr;
  if (!usedProjects.length) {
    emptyLine(cp, cr, cpLast, "Aucune allocation projet sur la période.");
    cr++;
  }
  usedProjects.forEach((p, idx) => {
    const row = cp.getRow(cr);
    row.getCell(1).fill = fill(argb(p.color));
    row.getCell(2).value = p.code;
    row.getCell(3).value = p.name;
    perWeek.forEach((pw, i) => {
      const sum = pw.pps.filter((pp) => pp.project_id === p.id).reduce((s, pp) => s + pp.allocation_percent, 0);
      const cell = row.getCell(4 + i);
      cell.value = sum ? sum / 100 : null;
      cell.numFmt = "0.00";
    });
    row.getCell(cpLast).value = {
      formula: `IFERROR(AVERAGE(${colLetter(4)}${cr}:${colLetter(3 + weeks.length)}${cr}),0)`,
    };
    row.getCell(cpLast).numFmt = "0.00";
    styleDataRow(row, 2, cpLast, idx % 2 === 1);
    row.getCell(1).border = allBorders;
    for (let c = 4; c <= cpLast; c++) row.getCell(c).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(cpLast).font = { bold: true, size: 10 };
    row.getCell(2).font = { bold: true, size: 10, color: { argb: argb(p.color) } };
    cr++;
  });
  if (usedProjects.length) {
    const tr = cp.getRow(cr);
    tr.getCell(3).value = "Total ETP";
    for (let c = 4; c <= cpLast; c++) {
      const L = colLetter(c);
      tr.getCell(c).value = { formula: `SUM(${L}${cpFirst}:${L}${cr - 1})` };
      tr.getCell(c).numFmt = "0.00";
    }
    for (let c = 1; c <= cpLast; c++) {
      const cell = tr.getCell(c);
      cell.fill = fill(C.accent);
      cell.font = { bold: true, size: 10, color: { argb: C.white } };
      cell.border = allBorders;
      cell.alignment = { horizontal: c <= 3 ? "left" : "center", vertical: "middle", indent: c === 3 ? 1 : 0 };
    }
    cp.addConditionalFormatting({
      ref: `D${cpFirst}:${colLetter(3 + weeks.length)}${cr - 1}`,
      rules: [
        {
          type: "colorScale",
          priority: 1,
          cfvo: [{ type: "min" }, { type: "max" }],
          color: [{ argb: "FFF8FAFC" }, { argb: "FF93C5FD" }],
        },
      ],
    });
  }
  setupPrint(cp);

  /* ---------------- 3. ALLOCATION PAR BA (%) ---------------- */
  const ab = wb.addWorksheet("Allocation BA", {
    properties: { tabColor: { argb: "FF7C3AED" } },
    views: [{ state: "frozen", xSplit: 2, ySplit: 4, showGridLines: false }],
  });
  const abLast = 2 + weeks.length + 1;
  ab.getColumn(1).width = 28;
  ab.getColumn(2).width = 16;
  weeks.forEach((_, i) => (ab.getColumn(3 + i).width = 11));
  ab.getColumn(abLast).width = 12;
  banner(ab, Math.max(abLast, 6), "Allocation totale par BA (%)", "Vert = 100 %   ·   Orange = sous-alloué   ·   Rouge = sur-alloué (> 100 %)   ·   vide = pas de plan");

  const abh = ab.getRow(4);
  abh.getCell(1).value = "Membre";
  abh.getCell(2).value = "Service";
  weeks.forEach((w, i) => (abh.getCell(3 + i).value = `S${isoWeekNumber(w)}\n${shortDate(w)}`));
  abh.getCell(abLast).value = "Moyenne";
  styleHeaderRow(abh, 1, abLast);
  abh.height = 32;

  let ar = 5;
  const abFirst = ar;
  members.forEach((u, idx) => {
    const row = ab.getRow(ar);
    row.getCell(1).value = u.full_name;
    row.getCell(2).value = u.service_line ?? "—";
    perWeek.forEach((pw, i) => {
      const plan = pw.plans.find((p) => p.user_id === u.id);
      const cell = row.getCell(3 + i);
      if (plan) {
        const sum = pw.pps.filter((pp) => pp.plan_id === plan.id).reduce((s, pp) => s + pp.allocation_percent, 0);
        cell.value = sum / 100;
      } else cell.value = null;
      cell.numFmt = "0%";
    });
    row.getCell(abLast).value = {
      formula: `IFERROR(AVERAGE(${colLetter(3)}${ar}:${colLetter(2 + weeks.length)}${ar}),"")`,
    };
    row.getCell(abLast).numFmt = "0%";
    styleDataRow(row, 1, abLast, idx % 2 === 1);
    for (let c = 3; c <= abLast; c++) row.getCell(c).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(1).font = { bold: true, size: 10 };
    ar++;
  });
  if (members.length) {
    const ref = `C${abFirst}:${colLetter(2 + weeks.length)}${ar - 1}`;
    ab.addConditionalFormatting({
      ref,
      rules: [
        { type: "cellIs", operator: "greaterThan", formulae: ["1"], priority: 1, style: { fill: fill("FFFEE2E2"), font: { color: { argb: "FFB91C1C" }, bold: true } } },
        { type: "cellIs", operator: "equal", formulae: ["1"], priority: 2, style: { fill: fill("FFD1FAE5"), font: { color: { argb: "FF047857" }, bold: true } } },
        { type: "expression", formulae: [`AND(ISNUMBER(C${abFirst}),C${abFirst}<1)`], priority: 3, style: { fill: fill("FFFEF3C7"), font: { color: { argb: "FFB45309" } } } },
      ],
    });
  } else {
    emptyLine(ab, ar, abLast, "Aucun membre sur le périmètre.");
  }
  setupPrint(ab);

  /* ---------------- 4. UNE FEUILLE PAR SEMAINE ---------------- */
  const WCOLS = [
    { key: "a", w: 24 },
    { key: "b", w: 14 },
    { key: "c", w: 34 },
    { key: "d", w: 38 },
    { key: "e", w: 13 },
    { key: "f", w: 14 },
    { key: "g", w: 13 },
    { key: "h", w: 13 },
  ];
  const wLast = WCOLS.length;

  for (const pw of perWeek) {
    const ws = wb.addWorksheet(pw.sheet, {
      properties: { tabColor: { argb: pw.plans.length ? "FF10B981" : "FFCBD5E1" } },
      views: [{ state: "frozen", ySplit: 2, showGridLines: false }],
    });
    WCOLS.forEach((c, i) => (ws.getColumn(i + 1).width = c.w));

    banner(
      ws,
      wLast,
      `Semaine ${isoWeekNumber(pw.week)} — ${weekRangeLong(pw.week)}`,
      `${data.scopeLabel}   ·   Généré le ${generated}`,
    );

    // Lien retour
    const back = ws.getCell(3, wLast);
    back.value = { text: "← Synthèse", hyperlink: "#'Synthèse'!A1" };
    back.font = { color: { argb: C.accent }, underline: true, size: 9 };
    back.alignment = { horizontal: "right" };

    const done = pw.delivs.filter((d) => d.status === "done").length;
    const blocked = pw.delivs.filter((d) => d.status === "blocked").length;
    const objAvg = pw.objs.length ? Math.round(pw.objs.reduce((s, o) => s + o.progress, 0) / pw.objs.length) : null;
    kpiStrip(
      ws,
      4,
      [
        { label: "Plans renseignés", value: `${pw.plans.length} / ${members.length}` },
        { label: "Validés", value: pw.plans.filter((p) => p.status === "validated").length, color: "FF047857" },
        { label: "Livrables", value: pw.delivs.length },
        { label: "Terminés", value: pw.delivs.length ? `${done} (${Math.round((done / pw.delivs.length) * 100)} %)` : "0", color: "FF047857" },
        { label: "Bloqués", value: blocked, color: blocked ? "FFB91C1C" : C.text },
        { label: "Objectifs", value: objAvg === null ? "0" : `${pw.objs.length} · ${objAvg} %` },
      ],
      wLast,
    );

    let row = 7;

    /* --- A. Statut des plans --- */
    sectionTitle(ws, row, wLast, "1. Statut des plans", `${members.length} membre(s)`);
    row++;
    const h1 = ws.getRow(row);
    ["Membre", "Service", "Commentaires", "Congés sur la semaine", "Statut", "Allocation totale", "Bench", "Livrables terminés"].forEach(
      (h, i) => (h1.getCell(i + 1).value = h),
    );
    styleHeaderRow(h1, 1, wLast);
    row++;
    const weekEnd = addDaysIso(pw.week, 6);
    members.forEach((u, idx) => {
      const plan = pw.plans.find((p) => p.user_id === u.id);
      const pps = plan ? pw.pps.filter((pp) => pp.plan_id === plan.id) : [];
      const alloc = pps.reduce((s, pp) => s + pp.allocation_percent, 0);
      const ud = plan ? pw.delivs.filter((d) => d.plan_id === plan.id) : [];
      const vac = data.vacations
        .filter((v) => v.user_id === u.id && v.start_date <= weekEnd && v.end_date >= pw.week)
        .map((v) => `${shortDate(v.start_date)} → ${shortDate(v.end_date)}${v.status !== "approved" ? " (en attente)" : ""}`)
        .join("\n");

      const rr = ws.getRow(row);
      rr.getCell(1).value = u.full_name;
      rr.getCell(2).value = u.service_line ?? "—";
      rr.getCell(3).value = plan?.general_comments || "";
      rr.getCell(4).value = vac || "";
      rr.getCell(6).value = plan ? alloc / 100 : null;
      rr.getCell(6).numFmt = "0%";
      rr.getCell(7).value = plan?.bench ?? null;
      rr.getCell(8).value = plan ? `${ud.filter((d) => d.status === "done").length} / ${ud.length}` : "—";
      styleDataRow(rr, 1, wLast, idx % 2 === 1);
      const st = PLAN_STATUS[plan?.status ?? "none"];
      pill(rr.getCell(5), st.label, st.fill, st.font);
      rr.getCell(1).font = { bold: true, size: 10 };
      for (const c of [6, 7, 8]) rr.getCell(c).alignment = { horizontal: "center", vertical: "top" };
      if (plan && alloc > 100) rr.getCell(6).font = { bold: true, size: 10, color: { argb: "FFB91C1C" } };
      else if (plan && alloc === 100) rr.getCell(6).font = { bold: true, size: 10, color: { argb: "FF047857" } };
      else if (plan) rr.getCell(6).font = { size: 10, color: { argb: "FFB45309" } };
      if (vac) rr.getCell(4).font = { size: 10, color: { argb: "FF7C3AED" } };
      row++;
    });
    if (!members.length) emptyLine(ws, row++, wLast, "Aucun membre.");
    row++;

    /* --- B. Allocations par projet --- */
    sectionTitle(ws, row, wLast, "2. Allocations par projet", "répartition du temps de chaque BA");
    row++;
    const h2 = ws.getRow(row);
    ["Membre", "Code projet", "Projet", "", "", "Allocation", "ETP", ""].forEach((h, i) => (h2.getCell(i + 1).value = h));
    ws.mergeCells(row, 3, row, 5);
    styleHeaderRow(h2, 1, wLast);
    row++;
    const allocRows = pw.plans
      .flatMap((p) =>
        pw.pps
          .filter((pp) => pp.plan_id === p.id)
          .map((pp) => ({ user: userName(p.user_id), project: projectById.get(pp.project_id), pct: pp.allocation_percent })),
      )
      .sort((a, b) => a.user.localeCompare(b.user, "fr") || b.pct - a.pct);
    const allocFirst = row;
    allocRows.forEach((a, idx) => {
      const rr = ws.getRow(row);
      rr.getCell(1).value = a.user;
      rr.getCell(2).value = a.project?.code ?? "—";
      rr.getCell(3).value = a.project?.name ?? "Projet supprimé";
      ws.mergeCells(row, 3, row, 5);
      rr.getCell(6).value = a.pct / 100;
      rr.getCell(6).numFmt = "0%";
      rr.getCell(7).value = { formula: `F${row}` };
      rr.getCell(7).numFmt = "0.00";
      styleDataRow(rr, 1, wLast, idx % 2 === 1);
      const pc = argb(a.project?.color);
      rr.getCell(2).fill = fill(lighten(pc));
      rr.getCell(2).font = { bold: true, size: 10, color: { argb: pc } };
      rr.getCell(2).alignment = { horizontal: "center", vertical: "top" };
      rr.getCell(6).alignment = { horizontal: "center", vertical: "top" };
      rr.getCell(7).alignment = { horizontal: "center", vertical: "top" };
      row++;
    });
    if (!allocRows.length) emptyLine(ws, row++, wLast, "Aucune allocation renseignée cette semaine.");
    else {
      ws.addConditionalFormatting({
        ref: `F${allocFirst}:F${row - 1}`,
        rules: [
          {
            type: "dataBar",
            priority: 1,
            minLength: 0,
            maxLength: 100,
            gradient: false,
            cfvo: [
              { type: "num", value: 0 },
              { type: "num", value: 1 },
            ],
            color: { argb: "FF93C5FD" },
          } as any,
        ],
      });
      // Récap par projet
      const byProject = new Map<string, number>();
      allocRows.forEach((a) => {
        const k = a.project ? `${a.project.code} — ${a.project.name}` : "Projet supprimé";
        byProject.set(k, (byProject.get(k) ?? 0) + a.pct);
      });
      const tr = ws.getRow(row);
      tr.getCell(1).value = "Total équipe par projet";
      tr.getCell(3).value = Array.from(byProject.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k} : ${(v / 100).toFixed(2)} ETP`)
        .join("\n");
      ws.mergeCells(row, 3, row, 5);
      ws.mergeCells(row, 1, row, 2);
      tr.getCell(7).value = { formula: `SUM(G${allocFirst}:G${row - 1})` };
      tr.getCell(7).numFmt = "0.00";
      for (let c = 1; c <= wLast; c++) {
        const cell = tr.getCell(c);
        cell.fill = fill(C.accentSoft);
        cell.border = allBorders;
        cell.font = { bold: c !== 3, size: 10, color: { argb: C.navySoft } };
        cell.alignment = { vertical: "top", wrapText: true, horizontal: c === 7 ? "center" : "left" };
      }
      tr.height = Math.max(20, 14 * byProject.size);
      row++;
    }
    row++;

    /* --- C. Livrables --- */
    sectionTitle(ws, row, wLast, "3. Livrables", `${pw.delivs.length} livrable(s) · ${done} terminé(s) · ${blocked} bloqué(s)`);
    row++;
    const h3 = ws.getRow(row);
    ["Membre", "Projet", "Livrable", "Description", "Priorité", "Statut", "Échéance", "Terminé le"].forEach(
      (h, i) => (h3.getCell(i + 1).value = h),
    );
    styleHeaderRow(h3, 1, wLast);
    const delivHeaderRow = row;
    row++;
    const delivSorted = [...pw.delivs].sort((a, b) => {
      const ua = userName(planById.get(a.plan_id)?.user_id ?? "");
      const ub = userName(planById.get(b.plan_id)?.user_id ?? "");
      return (
        ua.localeCompare(ub, "fr") ||
        (PRIORITY[a.priority]?.rank ?? 9) - (PRIORITY[b.priority]?.rank ?? 9) ||
        a.order_idx - b.order_idx
      );
    });
    delivSorted.forEach((d, idx) => {
      const rr = ws.getRow(row);
      const proj = d.project_id ? projectById.get(d.project_id) : undefined;
      rr.getCell(1).value = userName(planById.get(d.plan_id)?.user_id ?? "");
      rr.getCell(2).value = proj?.code ?? "—";
      rr.getCell(3).value = d.title;
      rr.getCell(4).value = d.description ?? "";
      rr.getCell(5).value = PRIORITY[d.priority]?.label ?? d.priority;
      rr.getCell(7).value = d.due_date ? utc(d.due_date) : null;
      rr.getCell(7).numFmt = "dd/mm/yyyy";
      rr.getCell(8).value = d.completed_at ? utc(d.completed_at) : null;
      rr.getCell(8).numFmt = "dd/mm/yyyy";
      styleDataRow(rr, 1, wLast, idx % 2 === 1);
      const st = DELIV_STATUS[d.status];
      pill(rr.getCell(6), st.label, st.fill, st.font);
      rr.getCell(3).font = { bold: true, size: 10 };
      rr.getCell(4).font = { size: 9, color: { argb: C.muted } };
      rr.getCell(5).font = { bold: true, size: 10, color: { argb: PRIORITY[d.priority]?.font ?? C.text } };
      for (const c of [2, 5, 7, 8]) rr.getCell(c).alignment = { horizontal: "center", vertical: "top" };
      if (proj) rr.getCell(2).font = { bold: true, size: 10, color: { argb: argb(proj.color) } };
      row++;
    });
    if (!delivSorted.length) emptyLine(ws, row++, wLast, "Aucun livrable cette semaine.");
    else ws.autoFilter = { from: { row: delivHeaderRow, column: 1 }, to: { row: row - 1, column: wLast } };
    row++;

    /* --- D. Objectifs --- */
    sectionTitle(ws, row, wLast, "4. Objectifs de la semaine", objAvg === null ? "aucun" : `progression moyenne ${objAvg} %`);
    row++;
    const h4 = ws.getRow(row);
    ["Membre", "Projet", "Objectif", "Description", "Progression", "Statut", "Date cible", ""].forEach(
      (h, i) => (h4.getCell(i + 1).value = h),
    );
    styleHeaderRow(h4, 1, wLast);
    row++;
    const objFirst = row;
    const objSorted = [...pw.objs].sort(
      (a, b) => userName(a.user_id).localeCompare(userName(b.user_id), "fr") || b.progress - a.progress,
    );
    objSorted.forEach((o, idx) => {
      const rr = ws.getRow(row);
      const proj = o.project_id ? projectById.get(o.project_id) : undefined;
      rr.getCell(1).value = userName(o.user_id);
      rr.getCell(2).value = proj?.code ?? "—";
      rr.getCell(3).value = o.title;
      rr.getCell(4).value = o.description ?? "";
      rr.getCell(5).value = o.progress / 100;
      rr.getCell(5).numFmt = "0%";
      rr.getCell(7).value = o.target_date ? utc(o.target_date) : null;
      rr.getCell(7).numFmt = "dd/mm/yyyy";
      styleDataRow(rr, 1, wLast, idx % 2 === 1);
      const label = o.progress >= 100 ? "Atteint" : OBJ_STATUS[o.status] ?? o.status;
      const f =
        o.progress >= 100 ? DELIV_STATUS.done : o.status === "at_risk" ? DELIV_STATUS.blocked : o.progress > 0 ? DELIV_STATUS.in_progress : DELIV_STATUS.todo;
      pill(rr.getCell(6), label, f.fill, f.font);
      rr.getCell(3).font = { bold: true, size: 10 };
      rr.getCell(4).font = { size: 9, color: { argb: C.muted } };
      for (const c of [2, 5, 7]) rr.getCell(c).alignment = { horizontal: "center", vertical: "top" };
      if (proj) rr.getCell(2).font = { bold: true, size: 10, color: { argb: argb(proj.color) } };
      row++;
    });
    if (!objSorted.length) emptyLine(ws, row++, wLast, "Aucun objectif cette semaine.");
    else
      ws.addConditionalFormatting({
        ref: `E${objFirst}:E${row - 1}`,
        rules: [
          {
            type: "dataBar",
            priority: 1,
            minLength: 0,
            maxLength: 100,
            gradient: false,
            cfvo: [
              { type: "num", value: 0 },
              { type: "num", value: 1 },
            ],
            color: { argb: "FF34D399" },
          } as any,
        ],
      });

    setupPrint(ws);
  }

  /* ---------------- 5. OBJECTIFS HORS SEMAINE ---------------- */
  const loose = data.objectives.filter((o) => !o.plan_id);
  if (loose.length) {
    const ws = wb.addWorksheet("Objectifs long terme", {
      properties: { tabColor: { argb: "FFF59E0B" } },
      views: [{ state: "frozen", ySplit: 4, showGridLines: false }],
    });
    const cols = [24, 14, 36, 42, 13, 14, 13];
    cols.forEach((w, i) => (ws.getColumn(i + 1).width = w));
    banner(ws, cols.length, "Objectifs non rattachés à une semaine", data.scopeLabel);
    const h = ws.getRow(4);
    ["Membre", "Projet", "Objectif", "Description", "Progression", "Statut", "Date cible"].forEach((t, i) => (h.getCell(i + 1).value = t));
    styleHeaderRow(h, 1, cols.length);
    let rr = 5;
    loose
      .sort((a, b) => userName(a.user_id).localeCompare(userName(b.user_id), "fr"))
      .forEach((o, idx) => {
        const row = ws.getRow(rr);
        const proj = o.project_id ? projectById.get(o.project_id) : undefined;
        row.getCell(1).value = userName(o.user_id);
        row.getCell(2).value = proj?.code ?? "—";
        row.getCell(3).value = o.title;
        row.getCell(4).value = o.description ?? "";
        row.getCell(5).value = o.progress / 100;
        row.getCell(5).numFmt = "0%";
        row.getCell(7).value = o.target_date ? utc(o.target_date) : null;
        row.getCell(7).numFmt = "dd/mm/yyyy";
        styleDataRow(row, 1, cols.length, idx % 2 === 1);
        const f = o.progress >= 100 ? DELIV_STATUS.done : o.status === "at_risk" ? DELIV_STATUS.blocked : o.progress > 0 ? DELIV_STATUS.in_progress : DELIV_STATUS.todo;
        pill(row.getCell(6), o.progress >= 100 ? "Atteint" : OBJ_STATUS[o.status] ?? o.status, f.fill, f.font);
        row.getCell(3).font = { bold: true, size: 10 };
        for (const c of [2, 5, 7]) row.getCell(c).alignment = { horizontal: "center", vertical: "top" };
        rr++;
      });
    ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: rr - 1, column: cols.length } };
    setupPrint(ws);
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf as ArrayBuffer);
}
