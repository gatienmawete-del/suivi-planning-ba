"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, CheckCircle2, Loader2 } from "lucide-react";
import { validatePlan } from "@/lib/actions/planning";
import { decideVacation } from "@/lib/actions/vacations";

export function TeamActions({ planId, vacationId }: { planId?: string; vacationId?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (planId) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          start(async () => {
            await validatePlan(planId);
            router.refresh();
          })
        }
        disabled={pending}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
        Valider la semaine
      </Button>
    );
  }

  if (vacationId) {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            start(async () => {
              await decideVacation(vacationId, "approved");
              router.refresh();
            })
          }
          disabled={pending}
        >
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          Approuver
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            start(async () => {
              if (!confirm("Refuser cette demande ?")) return;
              await decideVacation(vacationId, "rejected");
              router.refresh();
            })
          }
          disabled={pending}
        >
          <X className="h-3.5 w-3.5 text-red-600" />
          Refuser
        </Button>
      </div>
    );
  }

  return null;
}
