"use client";

import { Moon, Sun, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Auto", icon: Smartphone },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="space-y-3">
      <p className="text-sm font-medium">Apparence</p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors",
              theme === value
                ? "bg-accent/10 border-accent text-accent"
                : "bg-surface border-border text-muted active:bg-surface-elevated"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </Card>
  );
}
