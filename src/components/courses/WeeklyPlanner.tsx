"use client";

import { useState } from "react";
import { ShoppingCart, Star } from "lucide-react";
import { DAYS_OF_WEEK, MEAL_SLOTS, SHOPPING_CATEGORIES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DayPlanner } from "./DayPlanner";
import { itemsForDay } from "@/lib/utils/meal-plan";
import { cn } from "@/lib/utils/cn";
import { useMealPlan, useRecipes } from "@/hooks/useAppData";

function todayIndex() {
  return (new Date().getDay() + 6) % 7;
}

export function WeeklyPlanner({ onGenerateList }: { onGenerateList: () => void }) {
  const { recipes } = useRecipes();
  const { mealPlan, defaultBreakfastId, applyDefaultBreakfast } = useMealPlan();
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  const hasSelections = (mealPlan?.items ?? []).some((item) => item.recipe_id);
  const defaultBreakfast = recipes.find((r) => r.id === defaultBreakfastId) ?? null;
  const missingBreakfastDays = DAYS_OF_WEEK.filter(
    (_, day) => !itemsForDay(mealPlan, day).some((i) => i.meal_type === "petit_dejeuner")
  ).length;

  return (
    <div className="space-y-4">
      <h2 className="font-handwritten text-2xl text-accent">Ma semaine</h2>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {DAYS_OF_WEEK.map((label, day) => {
          const filled = itemsForDay(mealPlan, day).filter((i) => i.recipe_id);
          const isSelected = day === selectedDay;
          const isToday = day === todayIndex();

          return (
            <button
              key={label}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={cn(
                "tap-scale shrink-0 w-14 py-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-colors",
                isSelected
                  ? "bg-accent border-accent text-white shadow-md shadow-accent/25"
                  : "bg-surface border-border"
              )}
            >
              <span className="text-xs font-medium">{label.slice(0, 3)}</span>
              <span className="flex gap-0.5 h-1.5 items-center">
                {MEAL_SLOTS.map((slot) => (
                  <span
                    key={slot.value}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      filled.some((i) => i.meal_type === slot.value)
                        ? isSelected
                          ? "bg-white"
                          : "bg-accent"
                        : isSelected
                          ? "bg-white/35"
                          : "bg-border"
                    )}
                  />
                ))}
              </span>
              <span
                className={cn(
                  "text-[9px] uppercase tracking-wide",
                  isToday ? (isSelected ? "text-white/90" : "text-accent") : "opacity-0"
                )}
              >
                Auj.
              </span>
            </button>
          );
        })}
      </div>

      {defaultBreakfast && missingBreakfastDays > 0 && (
        <Card className="flex items-center gap-3 p-3 border-accent/30">
          <Star className="w-4 h-4 text-accent shrink-0 fill-accent" />
          <p className="flex-1 text-sm leading-snug">
            <span className="font-medium">{defaultBreakfast.name}</span> est ton petit déjeuner
            habituel. {missingBreakfastDays} jour{missingBreakfastDays > 1 ? "s" : ""} sans petit
            déjeuner.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0"
            onClick={() => applyDefaultBreakfast(defaultBreakfast.id)}
          >
            Remplir
          </Button>
        </Card>
      )}

      <DayPlanner key={selectedDay} day={selectedDay} />

      {hasSelections && (
        <Button className="w-full rounded-full" onClick={onGenerateList}>
          <span className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Générer la liste de courses
          </span>
        </Button>
      )}
    </div>
  );
}

interface ShoppingListViewProps {
  items: Array<{
    id: string;
    name: string;
    quantity: number | null;
    unit: string | null;
    category: string;
    is_checked: boolean;
  }>;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (name: string) => void;
}

export function ShoppingListView({
  items,
  onToggle,
  onRemove,
  onAdd,
}: ShoppingListViewProps) {
  const grouped = items.reduce(
    (acc, item) => {
      const cat = item.category || "autres";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, typeof items>
  );

  const handleAdd = () => {
    const name = prompt("Nom du produit :");
    if (name?.trim()) onAdd(name.trim());
  };

  if (items.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-muted text-sm">
          Planifiez vos repas de la semaine pour générer automatiquement votre liste.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, catItems]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-muted mb-2 px-1">
            {SHOPPING_CATEGORIES[category] ?? category}
          </h3>
          <Card className="space-y-1 p-2">
            {catItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-elevated/50"
              >
                <input
                  type="checkbox"
                  checked={item.is_checked}
                  onChange={() => onToggle(item.id)}
                  className="w-5 h-5 rounded accent-accent"
                />
                <span
                  className={`flex-1 text-sm ${
                    item.is_checked ? "line-through text-muted" : ""
                  }`}
                >
                  {item.name}
                  {item.quantity && (
                    <span className="text-muted ml-1">
                      ({item.quantity}
                      {item.unit ? ` ${item.unit}` : ""})
                    </span>
                  )}
                </span>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-red-400 text-xs px-2 py-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </Card>
        </div>
      ))}
      <Button variant="secondary" className="w-full" onClick={handleAdd}>
        + Ajouter un produit
      </Button>
    </div>
  );
}
