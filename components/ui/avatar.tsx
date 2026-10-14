"use client";
import * as React from "react";
import { cn, initials, colorFromName } from "@/lib/utils";

interface AvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  name: string;
  color?: string | null;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ name, color, size = "md", className, ...props }: AvatarProps) {
  const bg = color ?? colorFromName(name);
  const sizeClass =
    size === "sm" ? "h-7 w-7 text-xs" : size === "lg" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm ring-2 ring-background",
        sizeClass,
        className,
      )}
      style={{ background: bg }}
      {...props}
    >
      {initials(name)}
    </div>
  );
}
