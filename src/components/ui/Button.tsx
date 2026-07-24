"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/25":
              variant === "primary",
            "bg-surface-elevated text-foreground border border-border hover:bg-surface":
              variant === "secondary",
            "text-muted hover:text-foreground hover:bg-surface-elevated":
              variant === "ghost",
            "bg-red-500/20 text-red-400 hover:bg-red-500/30": variant === "danger",
            "h-9 px-4 text-sm": size === "sm",
            "h-12 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
