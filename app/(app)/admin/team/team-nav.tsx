"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { addDays, isoDate, mondayOf } from "@/lib/utils";

export function TeamNav({ weekStart }: { weekStart: string }) {
  const router = useRouter();
  function navigate(dir: number) {
    const d = new Date(weekStart + "T00:00:00Z");
    router.push(`/admin/team?week=${isoDate(addDays(d, dir * 7))}`);
  }
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => router.push(`/admin/team?week=${isoDate(mondayOf())}`)}>
        <CalendarDays className="h-4 w-4" /> Cette semaine
      </Button>
      <Button variant="outline" size="sm" onClick={() => navigate(1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
