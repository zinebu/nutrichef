"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { NutritionData } from "@/types";

interface NutritionPanelProps {
  nutrition: NutritionData;
}

export function NutritionPanel({ nutrition }: NutritionPanelProps) {
  const macros = [
    { label: "Calories", value: `${Math.round(nutrition.caloriesTotal)} kcal`, highlight: true },
    { label: "Par portion", value: `${Math.round(nutrition.caloriesPerServing)} kcal` },
    { label: "Protéines", value: `${nutrition.proteinsG.toFixed(1)} g` },
    { label: "Glucides", value: `${nutrition.carbsG.toFixed(1)} g` },
    { label: "Lipides", value: `${nutrition.fatsG.toFixed(1)} g` },
    { label: "Sucres", value: `${nutrition.sugarG.toFixed(1)} g` },
    { label: "Fibres", value: `${nutrition.fiberG.toFixed(1)} g` },
  ];

  return (
    <Card elevated className="space-y-4">
      <h3 className="font-semibold text-lg">Analyse nutritionnelle</h3>

      {nutrition.detectedFoods.length > 0 && (
        <div>
          <p className="text-sm text-muted mb-2">Aliments détectés</p>
          <div className="flex flex-wrap gap-1.5">
            {nutrition.detectedFoods.map((food) => (
              <Badge key={food} className="bg-accent/20 text-accent">
                {food}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {macros.map((macro) => (
          <div
            key={macro.label}
            className={`rounded-2xl p-3 ${
              macro.highlight ? "bg-accent/10 col-span-2" : "bg-surface"
            }`}
          >
            <p className="text-xs text-muted">{macro.label}</p>
            <p className={`font-semibold ${macro.highlight ? "text-xl text-accent" : ""}`}>
              {macro.value}
            </p>
          </div>
        ))}
      </div>

      {nutrition.tips && (
        <div className="rounded-xl bg-accent/10 p-3 border border-accent/20">
          <p className="text-xs text-accent font-medium mb-1">Conseil</p>
          <p className="text-sm">{nutrition.tips}</p>
        </div>
      )}
    </Card>
  );
}
