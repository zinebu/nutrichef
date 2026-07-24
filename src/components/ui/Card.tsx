import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ className, elevated, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 bg-surface border border-border",
        elevated && "bg-surface-elevated",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
