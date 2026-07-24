"use client";

import { useState } from "react";
import Image from "next/image";
import { X, UtensilsCrossed, Check } from "lucide-react";
import { DAYS_OF_WEEK, SHOPPING_CATEGORIES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { MealPlan, Recipe } from "@/types";

function RecipeThumb({ recipe, size = "md" }: { recipe: Recipe; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-14 h-14", md: "w-20 h-20", lg: "w-full aspect-[4/3]" };
  return (
    <div className={cn("relative rounded-xl overflow-hidden bg-accent/10 shrink-0", sizes[size])}>
      {recipe.photo_url ? (
        recipe.photo_url.startsWith("data:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.photo_url} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <Image src={recipe.photo_url} alt={recipe.name} fill className="object-cover" sizes="120px" />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <UtensilsCrossed className="w-6 h-6 text-accent/50" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

interface RecipePickerProps {
  recipes: Recipe[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
  dayLabel: string;
}

function RecipePicker({ recipes, selectedId, onSelect, onClose, dayLabel }: RecipePickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div className="relative w-full max-w-lg bg-background rounded-t-3xl max-h-[80vh] flex flex-col animate-fade-up pb-safe">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div>
            <p className="text-xs text-muted">Planning</p>
            <h3 className="font-handwritten text-2xl text-accent">{dayLabel}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4">
          {recipes.length === 0 ? (
            <p className="text-center text-muted text-sm py-8">Aucune recette disponible</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {recipes.map((recipe) => {
                const isSelected = recipe.id === selectedId;
                return (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => {
                      onSelect(recipe.id);
                      onClose();
                    }}
                    className={cn(
                      "text-left rounded-2xl overflow-hidden border-2 transition-all tap-scale",
                      isSelected ? "border-accent shadow-md shadow-accent/20" : "border-border"
                    )}
                  >
                    <div className="relative">
                      <RecipeThumb recipe={recipe} size="lg" />
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-sm font-medium leading-tight line-clamp-2">{recipe.name}</p>
                      {recipe.calories_per_serving && (
                        <p className="text-xs text-muted mt-0.5">
                          {Math.round(recipe.calories_per_serving)} kcal
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedId && (
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                onClose();
              }}
              className="w-full mt-4 py-3 text-sm text-muted border border-dashed border-border rounded-xl"
            >
              Retirer ce repas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface WeeklyPlannerProps {
  mealPlan: MealPlan | null;
  recipes: Recipe[];
  onSelectRecipe: (day: number, recipeId: string | null) => void;
  onGenerateList: () => void;
}

export function WeeklyPlanner({
  mealPlan,
  recipes,
  onSelectRecipe,
  onGenerateList,
}: WeeklyPlannerProps) {
  const [pickerDay, setPickerDay] = useState<number | null>(null);

  const getRecipeForDay = (day: number) => {
    const item = mealPlan?.items?.find((i) => i.day_of_week === day);
    if (!item?.recipe_id) return null;
    return recipes.find((r) => r.id === item.recipe_id) ?? item.recipe ?? null;
  };

  const hasSelections = (mealPlan?.items?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <h2 className="font-handwritten text-2xl text-accent">Ma semaine</h2>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day, index) => {
          const recipe = getRecipeForDay(index);
          return (
            <button
              key={day}
              type="button"
              onClick={() => setPickerDay(index)}
              className="w-full text-left tap-scale"
            >
              <Card className={cn("flex gap-3 items-center p-3", recipe && "border-accent/30")}>
                <div className="w-14 shrink-0">
                  <p className="text-[10px] text-muted uppercase tracking-wide">{day.slice(0, 3)}</p>
                  <p className="font-medium text-sm">{day}</p>
                </div>

                {recipe ? (
                  <>
                    <RecipeThumb recipe={recipe} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{recipe.name}</p>
                      {recipe.calories_per_serving && (
                        <p className="text-xs text-muted">
                          {Math.round(recipe.calories_per_serving)} kcal
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center gap-3 py-2 px-3 rounded-xl border-2 border-dashed border-border/60">
                    <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
                      <UtensilsCrossed className="w-5 h-5 text-muted" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-muted">Choisir un repas</p>
                  </div>
                )}
              </Card>
            </button>
          );
        })}
      </div>

      {hasSelections && (
        <Button className="w-full rounded-full" onClick={onGenerateList}>
          Générer la liste de courses
        </Button>
      )}

      {pickerDay !== null && (
        <RecipePicker
          recipes={recipes}
          selectedId={getRecipeForDay(pickerDay)?.id ?? null}
          dayLabel={DAYS_OF_WEEK[pickerDay]}
          onSelect={(id) => onSelectRecipe(pickerDay, id)}
          onClose={() => setPickerDay(null)}
        />
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
