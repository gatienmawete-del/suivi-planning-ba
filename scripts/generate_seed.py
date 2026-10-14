"""Génère le fichier supabase/seed.sql à partir de data.json."""
import json
import re
import unicodedata
import hashlib

with open("/home/claude/ba-tracker/scripts/data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

users = data["users"]
weeks = data["weeks"]


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-zA-Z0-9]+", ".", s).strip(".")
    return s.lower()


def email_of(name):
    return slugify(name) + "@ba-tracker.local"


# Déterminer un admin: Audrey MABIALA (Manager BA) ou Karhyt (Lead BA)
ADMINS = {"Audrey MABIALA", "Karhyt Mboungou"}


def sql_str(s):
    if s is None:
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def extract_project_codes(text):
    """Extrait les codes projets d'un texte comme '- CarTracking (30%)\n- SFEC (50%)'."""
    if not text:
        return []
    out = []
    for line in text.splitlines():
        m = re.search(r"^\s*[-'•]*\s*([A-Za-zÀ-ÿ0-9][\w\-\s/\.]*?)\s*\((\d{1,3})\s*%?\)", line)
        if m:
            name = m.group(1).strip().rstrip(" -")
            pct = int(m.group(2))
            if name:
                out.append((name, pct))
        else:
            # Nom tout seul sur une ligne?
            s = line.strip().lstrip("-'•").strip()
            if s and len(s) < 40 and not any(c in s for c in [":", ","]) and re.match(r"^[A-Za-zÀ-ÿ][\w\s\-/\.]*$", s):
                # ignore noise
                pass
    return out


# Collecter tous les projets uniques (codes courts)
proj_set = {}
for w in weeks:
    for e in w["entries"]:
        for name, _pct in extract_project_codes(e.get("projects")):
            key = name.strip()
            # normaliser quelques variantes
            canon = key
            if proj_set.get(key.lower()) is None:
                proj_set[key.lower()] = canon

# Palette couleurs
PALETTE = [
    "#2563eb", "#7c3aed", "#db2777", "#dc2626", "#ea580c",
    "#ca8a04", "#16a34a", "#0d9488", "#0284c7", "#4f46e5",
    "#64748b", "#9333ea", "#e11d48", "#059669", "#2dd4bf",
    "#f59e0b", "#6366f1", "#f97316", "#14b8a6", "#ec4899",
]


def color_for(name):
    h = int(hashlib.md5(name.encode()).hexdigest(), 16)
    return PALETTE[h % len(PALETTE)]


def code_for(name):
    # Code court = premiers mots en MAJ, max 20 chars
    base = re.sub(r"[^A-Za-z0-9]", "", name).upper()
    return base[:20] if base else "P" + hashlib.md5(name.encode()).hexdigest()[:4].upper()


out = []
out.append("-- =====================================================")
out.append("-- BA Tracker — Seed des données initiales")
out.append("-- Généré automatiquement depuis Planning_BA_projet_et_activite.xlsx")
out.append("-- =====================================================")
out.append("-- IMPORTANT: lance ce script via le SQL Editor de Supabase APRÈS")
out.append("-- la migration 001_initial_schema.sql, et APRÈS avoir créé les")
out.append("-- utilisateurs via le script Node (scripts/seed-users.mjs).")
out.append("")
out.append("-- 1. Projets")
out.append("")

project_rows = []
for key, canon in sorted(proj_set.items()):
    code = code_for(canon)
    color = color_for(canon)
    project_rows.append((canon, code, color))

# Dédupliquer les codes
seen_codes = {}
final_projects = []
for name, code, color in project_rows:
    base = code
    i = 2
    while code in seen_codes:
        code = f"{base}{i}"
        i += 1
    seen_codes[code] = True
    final_projects.append((name, code, color))

for name, code, color in final_projects:
    out.append(
        f"insert into projects (code, name, color) values "
        f"({sql_str(code)}, {sql_str(name)}, {sql_str(color)}) "
        f"on conflict (code) do nothing;"
    )

out.append("")
out.append("-- 2. Plannings hebdomadaires et affectations")
out.append("--    Les utilisateurs doivent avoir été créés AVANT via le script Node.")
out.append("--    Ce bloc utilise l'email pour retrouver chaque user.")
out.append("")

# Pour chaque semaine, pour chaque entrée, générer:
# - weekly_plan (upsert)
# - plan_projects
# - deliverable (une entrée texte libre)
# - vacation si dates
for w in weeks:
    week_start = w["week_start"]
    out.append(f"-- Semaine du {week_start}")
    for e in w["entries"]:
        name = e["name"]
        email = email_of(name)
        bench = e.get("bench") if e.get("bench") is not None else 0

        # weekly_plan
        out.append(
            "with u as (select id from profiles where email = {} limit 1)\n"
            "insert into weekly_plans (user_id, week_start, bench, general_comments, status)\n"
            "select u.id, {}::date, {}, {}, 'validated' from u\n"
            "on conflict (user_id, week_start) do nothing;".format(
                sql_str(email),
                sql_str(week_start),
                str(bench),
                sql_str(e.get("comments")),
            )
        )

        # Récupérer plan_id dans un with pour les enfants
        plan_cte = (
            f"with p as (\n"
            f"  select wp.id from weekly_plans wp\n"
            f"  join profiles pr on pr.id = wp.user_id\n"
            f"  where pr.email = {sql_str(email)} and wp.week_start = {sql_str(week_start)}\n"
            f"  limit 1\n"
            f")"
        )

        # plan_projects
        for pname, pct in extract_project_codes(e.get("projects")):
            out.append(
                plan_cte
                + f",\nproj as (select id from projects where name = {sql_str(pname)} limit 1)\n"
                + "insert into plan_projects (plan_id, project_id, allocation_percent)\n"
                + f"select p.id, proj.id, {pct} from p, proj\n"
                + "on conflict (plan_id, project_id) do update set allocation_percent = excluded.allocation_percent;"
            )

        # deliverable: on crée UN livrable "récap" par semaine avec le texte Ownership
        if e.get("deliverables"):
            status_src = (e.get("deliverables_status") or "").lower()
            if "termin" in status_src or "fait" in status_src or "done" in status_src:
                status = "done"
            elif "cours" in status_src or "progr" in status_src:
                status = "in_progress"
            elif "bloc" in status_src:
                status = "blocked"
            else:
                status = "done"  # historique → consider fait par défaut

            # Prendre juste la première ligne comme titre
            lines = [l.strip() for l in e["deliverables"].splitlines() if l.strip()]
            title = (lines[0] if lines else "Livrables de la semaine")[:300].replace("'", "''")
            full = e["deliverables"][:4000]
            out.append(
                plan_cte
                + f"\ninsert into deliverables (plan_id, title, description, status, priority)\n"
                + f"select p.id, '{title}', {sql_str(full)}, '{status}', 'medium' from p\n"
                + f"where not exists (select 1 from deliverables where plan_id = p.id);"
            )

        # vacation si dates
        if e.get("vacation_start") and e.get("vacation_end"):
            # On ne les crée qu'une seule fois globalement (dans la 1ʳᵉ semaine où elles apparaissent)
            # Simple heuristique: insérer si pas déjà présent pour cet utilisateur
            interim_txt = e.get("vacation_interim")
            vstatus = (e.get("vacation_status") or "").lower()
            if "approuv" in vstatus or "valid" in vstatus or "accord" in vstatus:
                vs = "approved"
            elif "refus" in vstatus or "reject" in vstatus:
                vs = "rejected"
            elif "attente" in vstatus or "pending" in vstatus or "request" in vstatus:
                vs = "requested"
            else:
                vs = "requested"
            days = e.get("vacation_days")
            days_sql = str(days) if days else "null"
            out.append(
                "with u as (select id from profiles where email = {} limit 1)\n"
                "insert into vacations (user_id, start_date, end_date, days_count, interim_text, status)\n"
                "select u.id, {}::date, {}::date, {}, {}, '{}' from u\n"
                "where not exists (select 1 from vacations v where v.user_id = u.id and v.start_date = {}::date);".format(
                    sql_str(email),
                    sql_str(e["vacation_start"]),
                    sql_str(e["vacation_end"]),
                    days_sql,
                    sql_str(interim_txt),
                    vs,
                    sql_str(e["vacation_start"]),
                )
            )
    out.append("")

# Affectations: tout utilisateur affecté à TOUT projet rencontré au moins une fois dans son planning
out.append("-- 3. Affectations user ↔ projet (déduites de l'historique)")
out.append("")
user_projects = {}
for w in weeks:
    for e in w["entries"]:
        name = e["name"]
        pset = user_projects.setdefault(name, set())
        for pname, _ in extract_project_codes(e.get("projects")):
            pset.add(pname)

for name, pset in user_projects.items():
    email = email_of(name)
    for pname in pset:
        out.append(
            "with u as (select id from profiles where email = {} limit 1),\n"
            "proj as (select id from projects where name = {} limit 1)\n"
            "insert into assignments (user_id, project_id) select u.id, proj.id from u, proj\n"
            "on conflict (user_id, project_id) do nothing;".format(
                sql_str(email), sql_str(pname)
            )
        )

out.append("")
out.append("-- Terminé.")

with open("/home/claude/ba-tracker/supabase/seed.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(out))

print(f"Seed SQL généré : {len(final_projects)} projets, "
      f"{sum(len(w['entries']) for w in weeks)} plans hebdos.")
print("Fichier: supabase/seed.sql")
