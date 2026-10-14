"""Extrait les BAs et l'historique du fichier Excel pour générer le seed SQL."""
import openpyxl
from datetime import datetime
import json
import re
import unicodedata

SRC = "/root/.claude/uploads/9e32bcae-f560-554d-b0d1-f559304628ed/9880db7f-Planning_BA_projet_et_activit__.xlsx"

MOIS_FR = {
    "janvier": 1, "fevrier": 2, "février": 2, "mars": 3, "avril": 4, "mai": 5,
    "juin": 6, "juillet": 7, "aout": 8, "août": 8, "septembre": 9,
    "octobre": 10, "novembre": 11, "decembre": 12, "décembre": 12,
}


def parse_sheet_name_to_date(name: str):
    """'Semaine du 15 Juin 2026' -> 2026-06-15 ; année manquante défaut 2026."""
    n = name.strip().lower()
    m = re.search(r"semaine\s+du\s+(\d{1,2})\s+(\w+)(?:\s+(\d{4}))?", n)
    if not m:
        return None
    day = int(m.group(1))
    mois_key = m.group(2).strip()
    year = int(m.group(3)) if m.group(3) else 2026
    mois = MOIS_FR.get(mois_key)
    if not mois:
        return None
    return datetime(year, mois, day).date()


def norm(s):
    if s is None:
        return None
    s = str(s).strip()
    return s if s else None


def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    users = {}  # name -> {service_line}
    weeks = []  # list of {week_start, entries: [...]}

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        week_date = parse_sheet_name_to_date(sheet_name)
        if not week_date:
            print(f"Skip (no date): {sheet_name}")
            continue

        # Trouver la ligne header (contient "N°" en col A ou "Nom & Prénom" en col B)
        header_row = None
        for r in range(1, min(20, ws.max_row + 1)):
            v = ws.cell(row=r, column=1).value
            v2 = ws.cell(row=r, column=2).value
            if (v and str(v).strip().startswith("N")) and v2 and "Nom" in str(v2):
                header_row = r
                break
        if not header_row:
            print(f"Skip (no header): {sheet_name}")
            continue

        entries = []
        for r in range(header_row + 1, ws.max_row + 1):
            num = ws.cell(row=r, column=1).value
            name = norm(ws.cell(row=r, column=2).value)
            if not name:
                continue
            if not isinstance(num, (int, float)):
                # fin du tableau
                if name and not any(ws.cell(row=r, column=c).value for c in range(3, 13)):
                    break
            service = norm(ws.cell(row=r, column=3).value)
            projets = norm(ws.cell(row=r, column=4).value)
            bench = ws.cell(row=r, column=5).value
            try:
                bench = float(bench) if bench is not None else None
            except Exception:
                bench = None
            date_debut = ws.cell(row=r, column=6).value
            date_fin = ws.cell(row=r, column=7).value
            jours = ws.cell(row=r, column=8).value
            interim = norm(ws.cell(row=r, column=9).value)
            statut_conge = norm(ws.cell(row=r, column=10).value)
            ownership = norm(ws.cell(row=r, column=11).value)
            statut_livr = norm(ws.cell(row=r, column=12).value)
            commentaires = norm(ws.cell(row=r, column=13).value)

            if name not in users and service:
                users[name] = {"service_line": service}
            elif name not in users:
                users[name] = {"service_line": None}

            if isinstance(date_debut, datetime):
                date_debut = date_debut.date().isoformat()
            else:
                date_debut = None
            if isinstance(date_fin, datetime):
                date_fin = date_fin.date().isoformat()
            else:
                date_fin = None
            try:
                jours = int(jours) if jours is not None else None
            except Exception:
                jours = None

            entries.append({
                "name": name,
                "service_line": service,
                "projects": projets,
                "bench": bench,
                "vacation_start": date_debut,
                "vacation_end": date_fin,
                "vacation_days": jours,
                "vacation_interim": interim,
                "vacation_status": statut_conge,
                "deliverables": ownership,
                "deliverables_status": statut_livr,
                "comments": commentaires,
            })

        weeks.append({
            "week_start": week_date.isoformat(),
            "sheet": sheet_name,
            "entries": entries,
        })

    # Normaliser service_line principal par user: dernière valeur rencontrée non-null
    final_users = {}
    for w in weeks:
        for e in w["entries"]:
            if e["name"] not in final_users:
                final_users[e["name"]] = {"service_line": None}
            if e["service_line"]:
                final_users[e["name"]]["service_line"] = e["service_line"]

    out = {
        "users": final_users,
        "weeks": weeks,
    }
    with open("/home/claude/ba-tracker/scripts/data.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2, default=str)

    print(f"Users: {len(final_users)}")
    for n, info in final_users.items():
        print(f"  - {n}  ({info['service_line']})")
    print(f"\nWeeks: {len(weeks)}")
    for w in weeks:
        print(f"  {w['week_start']}  ({len(w['entries'])} entries)  [{w['sheet']}]")


if __name__ == "__main__":
    main()
