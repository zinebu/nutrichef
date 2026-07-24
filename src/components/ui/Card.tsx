import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ className, elevated, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl p-4 transition-all",
        elevated
          ? "bg-surface-elevated shadow-lg shadow-black/10 border border-border/50"
          : "bg-surface border border-border/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
