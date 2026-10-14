"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  History,
  Target,
  Users2,
  FolderKanban,
  Plane,
  LineChart,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const items: Item[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/planning", label: "Ma semaine", icon: CalendarDays },
  { href: "/history", label: "Historique", icon: History },
  { href: "/objectives", label: "Mes objectifs", icon: Target },
  { href: "/vacations", label: "Congés", icon: Plane },
  { href: "/admin/team", label: "Équipe", icon: Users2, adminOnly: true },
  { href: "/admin/users", label: "Utilisateurs", icon: Users2, adminOnly: true },
  { href: "/admin/projects", label: "Projets", icon: FolderKanban, adminOnly: true },
  { href: "/admin/analytics", label: "Analytique", icon: LineChart, adminOnly: true },
];

export function Sidebar({ isAdmin, userName, userEmail }: { isAdmin: boolean; userName: string; userEmail?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visibleItems = items.filter((it) => !it.adminOnly || isAdmin);

  return (
    <>
      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LineChart className="h-4 w-4" />
          </div>
          <span className="font-semibold">BA Tracker</span>
        </Link>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-md p-2 hover:bg-accent"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r bg-card transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-3 border-b px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <LineChart className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold leading-none">BA Tracker</div>
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {isAdmin ? "Administrateur" : "Analyste"}
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {!isAdmin ? null : (
              <div className="mb-1 px-3 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Perso
              </div>
            )}
            {visibleItems
              .filter((it) => !it.adminOnly)
              .map((it) => {
                const active = pathname === it.href || pathname.startsWith(it.href + "/");
                const Icon = it.icon;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {it.label}
                  </Link>
                );
              })}

            {isAdmin && (
              <>
                <div className="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Administration
                </div>
                {visibleItems
                  .filter((it) => it.adminOnly)
                  .map((it) => {
                    const active = pathname === it.href || pathname.startsWith(it.href + "/");
                    const Icon = it.icon;
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/70 hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {it.label}
                      </Link>
                    );
                  })}
              </>
            )}
          </nav>

          {/* Pied */}
          <div className="border-t p-3">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-accent hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Déconnexion
              </button>
            </form>
            <div className="mt-3 truncate border-t pt-3 text-xs text-muted-foreground">
              Connecté : <span className="font-medium text-foreground/80">{userName}</span>
              {userEmail && (
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground/70">{userEmail}</div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
