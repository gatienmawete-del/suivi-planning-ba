import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  color?: string;
}

export function Progress({ value = 0, color, className, ...props }: ProgressProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${v}%`, background: color ?? "hsl(var(--primary))" }}
      />
    </div>
  );
}
