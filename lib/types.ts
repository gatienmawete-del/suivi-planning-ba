export type UserRole = "admin" | "ba" | "viewer";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  service_line: string | null;
  role: UserRole;
  avatar_color: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  active: boolean;
  created_at: string;
};

export type Assignment = {
  id: string;
  user_id: string;
  project_id: string;
  default_allocation: number | null;
};

/** Colonne conservée en base mais plus utilisée (les statuts de plan ont été retirés). */
export type PlanStatus = "draft" | "submitted" | "validated";

export type WeeklyPlan = {
  id: string;
  user_id: string;
  week_start: string;
  bench: number | null;
  general_comments: string | null;
  status: PlanStatus;
  submitted_at: string | null;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PlanProject = {
  id: string;
  plan_id: string;
  project_id: string;
  allocation_percent: number;
};

export type DeliverableStatus = "todo" | "in_progress" | "blocked" | "done";
export type DeliverablePriority = "low" | "medium" | "high" | "critical";

export type Deliverable = {
  id: string;
  plan_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  priority: DeliverablePriority;
  due_date: string | null;
  completed_at: string | null;
  order_idx: number;
  created_at: string;
  updated_at: string;
};

export type ObjectiveStatus = "pending" | "on_track" | "at_risk" | "done";

export type Objective = {
  id: string;
  user_id: string;
  plan_id: string | null;
  project_id: string | null;
  title: string;
  description: string | null;
  target_date: string | null;
  status: ObjectiveStatus;
  progress: number;
};

export type VacationStatus = "requested" | "approved" | "rejected" | "cancelled";

export type Vacation = {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  days_count: number | null;
  interim_user_id: string | null;
  interim_text: string | null;
  status: VacationStatus;
  comments: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
};

export const SERVICE_LINES = [
  "Produit",
  "UX",
  "Consultant",
  "Consultant/BA",
  "BA",
  "Lead BA",
  "Manager BA",
  "PMO",
  "Support",
] as const;

export const DELIVERABLE_STATUS_LABELS: Record<DeliverableStatus, string> = {
  todo: "À faire",
  in_progress: "En cours",
  blocked: "Bloqué",
  done: "Terminé",
};

export const DELIVERABLE_STATUS_COLORS: Record<DeliverableStatus, string> = {
  todo: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  in_progress: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  blocked: "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
  done: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
};

export const PRIORITY_COLORS: Record<DeliverablePriority, string> = {
  low: "text-slate-500",
  medium: "text-blue-500",
  high: "text-orange-500",
  critical: "text-red-500",
};

export const PRIORITY_LABELS: Record<DeliverablePriority, string> = {
  low: "Basse",
  medium: "Normale",
  high: "Haute",
  critical: "Critique",
};

export const VACATION_STATUS_LABELS: Record<VacationStatus, string> = {
  requested: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
  cancelled: "Annulé",
};
