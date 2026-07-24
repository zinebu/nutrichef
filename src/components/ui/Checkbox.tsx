"use client";

import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer group", className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
          checked
            ? "bg-accent border-accent"
            : "border-border group-hover:border-accent/50"
        )}
      >
        {checked && <Check className="w-4 h-4 text-white" />}
      </button>
      {label && (
        <span
          className={cn(
            "text-sm transition-all",
            checked ? "text-muted line-through" : "text-foreground"
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}
