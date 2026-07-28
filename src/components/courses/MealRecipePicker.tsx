"use client";

import { useMemo, useState } from "react";
import { Check, Flame, Search, Star, X } from "lucide-react";
import { RecipeThumb } from "./RecipeThumb";
import { cn } from "@/lib/utils/cn";
import type { MealSlot, Recipe } from "@/types";

interface MealRecipePickerProps {
  recipes: Recipe[];
  selectedId: string | null;
  dayLabel: string;
  slotLabel: string;
  slot: MealSlot;
  /** Calories déjà planifiées sur la journée, hors créneau en cours */
  dayCaloriesSoFar: number;
  dailyTarget: number;
  defaultBreakfastId?: string | null;
  onSelect: (recipeId: string | null) => void;
  onSetDefaultBreakfast?: (recipeId: string | null) => void;
  onClose: () => void;
}

export function MealRecipePicker({
  recipes,
  selectedId,
  dayLabel,
  slotLabel,
  slot,
  dayCaloriesSoFar,
  dailyTarget,
  defaultBreakfastId,
  onSelect,
  onSetDefaultBreakfast,
  onClose,
}: MealRecipePickerProps) {
  const [search, setSearch] = useState("");

  const remaining = Math.max(0, dailyTarget - dayCaloriesSoFar);
  // Journée déjà chargée : on remonte les recettes les plus légères
  const preferLight = dayCaloriesSoFar > dailyTarget * 0.5;

  const list = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = recipes.filter(
      (recipe) => !query || recipe.name.toLowerCase().includes(query)
    );

    return filtered.sort((a, b) => {
      const aMatch = a.category === slot ? 0 : 1;
      const bMatch = b.category === slot ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      if (preferLight) {
        return (a.calories_per_serving ?? 9999) - (b.calories_per_serving ?? 9999);
      }
      return a.name.localeCompare(b.name);
    });
  }, [recipes, search, slot, preferLight]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer"
      />

      <div className="relative w-full max-w-lg bg-background rounded-t-3xl max-h-[85vh] flex flex-col animate-fade-up pb-safe">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">{dayLabel}</p>
            <h3 className="font-handwritten text-2xl text-accent leading-tight">{slotLabel}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full active:bg-surface"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-3 space-y-3">
          {preferLight && (
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-accent/10 text-sm">
              <Flame className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <p className="leading-snug">
                Déjà {Math.round(dayCaloriesSoFar)} kcal aujourd&apos;hui. Il te reste environ{" "}
                <strong>{Math.round(remaining)} kcal</strong> — les recettes les plus légères
                sont en haut.
              </p>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher une recette..."
              className="w-full h-11 pl-10 pr-3 rounded-full bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {list.length === 0 ? (
            <p className="text-center text-muted text-sm py-8">Aucune recette trouvée</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {list.map((recipe) => {
                const isSelected = recipe.id === selectedId;
                const isDefault = recipe.id === defaultBreakfastId;
                return (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => {
                      onSelect(recipe.id);
                      onClose();
                    }}
                    className={cn(
                      "text-left rounded-2xl overflow-hidden border-2 transition-all tap-scale bg-surface",
                      isSelected ? "border-accent shadow-md shadow-accent/20" : "border-border"
                    )}
                  >
                    <div className="relative">
                      <RecipeThumb recipe={recipe} size="lg" className="rounded-none" />
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </span>
                      )}
                      {isDefault && !isSelected && (
                        <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center">
                          <Star className="w-3.5 h-3.5 text-white fill-white" />
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-sm font-medium leading-tight line-clamp-2">
                        {recipe.name}
                      </p>
                      {recipe.calories_per_serving != null && (
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
        </div>

        <div className="px-4 pt-2 pb-3 border-t border-border space-y-2">
          {slot === "petit_dejeuner" && selectedId && onSetDefaultBreakfast && (
            <button
              type="button"
              onClick={() => {
                onSetDefaultBreakfast(defaultBreakfastId === selectedId ? null : selectedId);
                onClose();
              }}
              className="w-full py-3 text-sm rounded-xl bg-surface border border-border flex items-center justify-center gap-2"
            >
              <Star
                className={cn(
                  "w-4 h-4",
                  defaultBreakfastId === selectedId ? "fill-accent text-accent" : "text-muted"
                )}
              />
              {defaultBreakfastId === selectedId
                ? "Ne plus utiliser par défaut"
                : "Mon petit déjeuner habituel"}
            </button>
          )}

          {selectedId && (
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                onClose();
              }}
              className="w-full py-3 text-sm text-muted border border-dashed border-border rounded-xl"
            >
              Retirer ce repas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
