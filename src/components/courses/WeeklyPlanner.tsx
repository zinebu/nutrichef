"use client";

import { DAYS_OF_WEEK, SHOPPING_CATEGORIES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { MealPlan, Recipe } from "@/types";

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
  const getRecipeForDay = (day: number) => {
    const item = mealPlan?.items?.find((i) => i.day_of_week === day);
    if (!item?.recipe_id) return null;
    return recipes.find((r) => r.id === item.recipe_id) ?? item.recipe ?? null;
  };

  const hasSelections = (mealPlan?.items?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {DAYS_OF_WEEK.map((day, index) => {
          const recipe = getRecipeForDay(index);
          return (
            <Card key={day} className="flex items-center gap-3">
              <div className="w-12 shrink-0">
                <p className="text-xs text-muted">{day.slice(0, 3)}</p>
                <p className="font-semibold text-sm">{day}</p>
              </div>
              <select
                value={recipe?.id ?? ""}
                onChange={(e) =>
                  onSelectRecipe(index, e.target.value || null)
                }
                className="flex-1 h-10 px-3 rounded-xl bg-surface-elevated border border-border/50 text-sm"
              >
                <option value="">— Choisir une recette —</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Card>
          );
        })}
      </div>

      {hasSelections && (
        <Button className="w-full" onClick={onGenerateList}>
          Générer la liste de courses
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
