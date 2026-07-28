"use client";

import { Coffee, Salad, Moon, CakeSlice, Cookie, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { RecipeCategory } from "@/types";

const RAIL: Array<{
  value: RecipeCategory | "";
  label: string;
  icon: typeof Coffee;
}> = [
  { value: "", label: "Tout", icon: Sparkles },
  { value: "petit_dejeuner", label: "Matin", icon: Coffee },
  { value: "dejeuner", label: "Déjeuner", icon: Salad },
  { value: "diner", label: "Dîner", icon: Moon },
  { value: "dessert", label: "Dessert", icon: CakeSlice },
  { value: "snack", label: "Snack", icon: Cookie },
];

interface CategoryRailProps {
  active: RecipeCategory | "";
  counts: Record<string, number>;
  onSelect: (category: RecipeCategory | "") => void;
}

export function CategoryRail({ active, counts, onSelect }: CategoryRailProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
      {RAIL.map(({ value, label, icon: Icon }) => {
        const isActive = active === value;
        const count = value === "" ? counts.all : counts[value];

        return (
          <button
            key={value || "all"}
            type="button"
            onClick={() => onSelect(value)}
            className="tap-scale shrink-0 flex flex-col items-center gap-1.5 w-16"
          >
            <span
              className={cn(
                "relative w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors",
                isActive
                  ? "bg-accent border-accent text-white shadow-md shadow-accent/25"
                  : "bg-surface border-border text-accent"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={1.75} />
              {count > 0 && (
                <span
                  className={cn(
                    "absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] font-semibold flex items-center justify-center",
                    isActive ? "bg-white text-accent" : "bg-accent text-white"
                  )}
                >
                  {count}
                </span>
              )}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium",
                isActive ? "text-accent" : "text-muted"
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
