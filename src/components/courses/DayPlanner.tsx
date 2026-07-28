"use client";

import { useMemo, useState } from "react";
import {
  Coffee,
  Cookie,
  Loader2,
  Moon,
  Plus,
  Sparkles,
  Star,
  Sun,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RecipeThumb } from "./RecipeThumb";
import { MealRecipePicker } from "./MealRecipePicker";
import { SnackSheet } from "./SnackSheet";
import { DAILY_CALORIE_TARGET, DAYS_OF_WEEK, MEAL_SLOTS } from "@/lib/constants";
import {
  dayCalories,
  emptySlotsForDay,
  recipeForSlot,
  snacksForDay,
} from "@/lib/utils/meal-plan";
import { cn } from "@/lib/utils/cn";
import type { DaySuggestions, MealPlan, MealSlot, Recipe } from "@/types";
import { useMealPlan, useRecipes } from "@/hooks/useAppData";

const SLOT_ICONS = {
  petit_dejeuner: Coffee,
  dejeuner: Sun,
  diner: Moon,
} as const;

type FixedSlot = Exclude<MealSlot, "snack">;

function SlotRow({
  slot,
  label,
  recipe,
  isDefault,
  onOpen,
}: {
  slot: FixedSlot;
  label: string;
  recipe: Recipe | null;
  isDefault: boolean;
  onOpen: () => void;
}) {
  const Icon = SLOT_ICONS[slot];

  return (
    <button type="button" onClick={onOpen} className="w-full text-left tap-scale">
      <div
        className={cn(
          "flex items-center gap-3 p-2.5 rounded-2xl border transition-colors",
          recipe ? "bg-surface border-accent/25" : "border-dashed border-border/70"
        )}
      >
        <span
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            recipe ? "bg-accent/12 text-accent" : "bg-surface text-muted"
          )}
        >
          <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
        </span>

        {recipe ? (
          <>
            <RecipeThumb recipe={recipe} size="xs" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted flex items-center gap-1">
                {label}
                {isDefault && <Star className="w-2.5 h-2.5 fill-accent text-accent" />}
              </p>
              <p className="text-sm font-medium truncate leading-tight">{recipe.name}</p>
            </div>
            {recipe.calories_per_serving != null && (
              <span className="text-xs text-muted shrink-0">
                {Math.round(recipe.calories_per_serving)} kcal
              </span>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
              <p className="text-sm text-muted">À choisir</p>
            </div>
            <Plus className="w-4 h-4 text-muted shrink-0" />
          </>
        )}
      </div>
    </button>
  );
}

export function DayPlanner({ day }: { day: number }) {
  const { recipes } = useRecipes();
  const {
    mealPlan,
    setDayRecipe,
    addSnack,
    addQuickSnack,
    addManualSnack,
    removeMealItem,
    defaultBreakfastId,
    setDefaultBreakfast,
  } = useMealPlan();

  const [pickerSlot, setPickerSlot] = useState<FixedSlot | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<DaySuggestions | null>(null);

  const dayLabel = DAYS_OF_WEEK[day];
  const total = dayCalories(mealPlan, recipes, day);
  const snacks = snacksForDay(mealPlan, recipes, day);
  const emptySlots = emptySlotsForDay(mealPlan, recipes, day);
  const savedSnacks = useMemo(
    () => recipes.filter((r) => r.category === "snack").slice(0, 8),
    [recipes]
  );

  const loadSuggestions = async () => {
    setSuggesting(true);
    setSuggestions(null);
    try {
      const planned = (mealPlan?.items ?? [])
        .filter((item) => item.day_of_week === day && item.recipe_id)
        .map((item) => {
          const recipe = recipes.find((r) => r.id === item.recipe_id);
          return {
            mealType: item.meal_type,
            name: recipe?.name ?? "Repas",
            calories: recipe?.calories_per_serving ?? 0,
          };
        });

      const res = await fetch("/api/meal-plans/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayLabel,
          planned,
          emptySlots,
          dailyTarget: DAILY_CALORIE_TARGET,
          library: recipes
            .filter((r) => r.category !== "snack")
            .map((r) => ({
              id: r.id,
              name: r.name,
              category: r.category,
              calories: r.calories_per_serving,
              tags: r.tags,
            })),
        }),
      });

      if (!res.ok) throw new Error("suggestion failed");
      setSuggestions(await res.json());
    } catch {
      setSuggestions(fallbackSuggestions(mealPlan, recipes, day, emptySlots));
    } finally {
      setSuggesting(false);
    }
  };

  const applySuggestion = async (slot: MealSlot, recipeId: string) => {
    await setDayRecipe(day, slot, recipeId);
    setSuggestions((prev) =>
      prev
        ? { ...prev, suggestions: prev.suggestions.filter((s) => s.mealType !== slot) }
        : prev
    );
  };

  const pickerRecipe = pickerSlot
    ? recipeForSlot(mealPlan, recipes, day, pickerSlot)
    : null;

  return (
    <div className="space-y-3">
      <Card className="p-3 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <h3 className="font-handwritten text-2xl text-accent">{dayLabel}</h3>
          <p className="text-sm text-muted">
            {total > 0 ? (
              <>
                <span
                  className={cn(
                    "font-medium",
                    total > DAILY_CALORIE_TARGET * 1.15 ? "text-red-500" : "text-foreground"
                  )}
                >
                  {Math.round(total)}
                </span>{" "}
                / {DAILY_CALORIE_TARGET} kcal
              </>
            ) : (
              "Journée vide"
            )}
          </p>
        </div>

        <div className="space-y-2">
          {MEAL_SLOTS.map((slot) => (
            <SlotRow
              key={slot.value}
              slot={slot.value}
              label={slot.label}
              recipe={recipeForSlot(mealPlan, recipes, day, slot.value)}
              isDefault={
                slot.value === "petit_dejeuner" &&
                recipeForSlot(mealPlan, recipes, day, "petit_dejeuner")?.id ===
                  defaultBreakfastId
              }
              onOpen={() => setPickerSlot(slot.value)}
            />
          ))}
        </div>

        <div className="pt-1 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted">
            <Cookie className="w-3 h-3" />
            Snacks
            <span className="normal-case tracking-normal text-muted/70">(facultatif)</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {snacks.map(({ item, recipe }) => (
              <span
                key={item.id ?? `${recipe.id}-${item.day_of_week}`}
                className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-surface border border-border text-xs"
              >
                <span className="max-w-32 truncate">{recipe.name}</span>
                {recipe.calories_per_serving != null && (
                  <span className="text-muted">
                    {Math.round(recipe.calories_per_serving)} kcal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeMealItem(item)}
                  className="w-5 h-5 rounded-full flex items-center justify-center active:bg-border"
                  aria-label={`Retirer ${recipe.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={() => setSnackOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-border text-xs text-muted tap-scale"
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          </div>
        </div>
      </Card>

      {emptySlots.length > 0 && (
        <Button
          variant="secondary"
          className="w-full rounded-full"
          onClick={loadSuggestions}
          disabled={suggesting}
        >
          {suggesting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              L&apos;IA compose ta journée...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Équilibrer ma journée
            </span>
          )}
        </Button>
      )}

      {suggestions && (
        <Card className="p-3 space-y-3 border-accent/30 animate-fade-up">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-sm leading-snug flex-1">{suggestions.comment}</p>
            <button
              type="button"
              onClick={() => setSuggestions(null)}
              className="p-1 rounded-full active:bg-surface"
              aria-label="Fermer les suggestions"
            >
              <X className="w-4 h-4 text-muted" />
            </button>
          </div>

          {suggestions.suggestions.map((suggestion) => {
            const recipe = recipes.find((r) => r.id === suggestion.recipeId);
            if (!recipe) return null;
            const slotLabel =
              MEAL_SLOTS.find((s) => s.value === suggestion.mealType)?.label ?? "Snack";

            return (
              <div
                key={`${suggestion.mealType}-${suggestion.recipeId}`}
                className="flex items-center gap-3 p-2 rounded-2xl bg-surface"
              >
                <RecipeThumb recipe={recipe} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted">{slotLabel}</p>
                  <p className="text-sm font-medium truncate">{recipe.name}</p>
                  <p className="text-xs text-muted line-clamp-2">{suggestion.reason}</p>
                </div>
                <Button
                  size="sm"
                  className="shrink-0"
                  onClick={() => applySuggestion(suggestion.mealType, suggestion.recipeId)}
                >
                  Choisir
                </Button>
              </div>
            );
          })}
        </Card>
      )}

      {pickerSlot && (
        <MealRecipePicker
          recipes={recipes}
          selectedId={pickerRecipe?.id ?? null}
          dayLabel={dayLabel}
          slot={pickerSlot}
          slotLabel={MEAL_SLOTS.find((s) => s.value === pickerSlot)?.label ?? ""}
          dayCaloriesSoFar={total - (pickerRecipe?.calories_per_serving ?? 0)}
          dailyTarget={DAILY_CALORIE_TARGET}
          defaultBreakfastId={defaultBreakfastId}
          onSelect={(recipeId) => setDayRecipe(day, pickerSlot, recipeId)}
          onSetDefaultBreakfast={setDefaultBreakfast}
          onClose={() => setPickerSlot(null)}
        />
      )}

      {snackOpen && (
        <SnackSheet
          dayLabel={dayLabel}
          savedSnacks={savedSnacks}
          onQuickAdd={(name, quantity) => addQuickSnack(day, name, quantity)}
          onManualAdd={(name, calories) => addManualSnack(day, name, calories)}
          onPickSaved={(recipeId) => addSnack(day, recipeId)}
          onClose={() => setSnackOpen(false)}
        />
      )}
    </div>
  );
}

/** Repli local quand l'IA n'est pas joignable : la plus légère de chaque créneau */
function fallbackSuggestions(
  plan: MealPlan | null,
  recipes: Recipe[],
  day: number,
  emptySlots: FixedSlot[]
): DaySuggestions {
  const used = new Set(
    (plan?.items ?? [])
      .filter((item) => item.day_of_week === day)
      .map((item) => item.recipe_id)
  );

  const suggestions = emptySlots.flatMap((slot) => {
    const candidate = recipes
      .filter((r) => r.category === slot && !used.has(r.id))
      .sort(
        (a, b) => (a.calories_per_serving ?? 9999) - (b.calories_per_serving ?? 9999)
      )[0];
    if (!candidate) return [];
    used.add(candidate.id);
    return [
      {
        mealType: slot as MealSlot,
        recipeId: candidate.id,
        reason: "L'option la plus légère de cette catégorie.",
      },
    ];
  });

  return {
    comment:
      suggestions.length > 0
        ? "Suggestions hors ligne, basées sur les calories de tes recettes."
        : "Ajoute des recettes dans ces catégories pour recevoir des suggestions.",
    suggestions,
  };
}
