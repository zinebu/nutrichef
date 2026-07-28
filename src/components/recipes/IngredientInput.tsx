"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { normalizeIngredientName } from "@/lib/utils/ingredient-normalize";
import { describeGrams, normalizeUnit, toGrams } from "@/lib/utils/unit-convert";
import type { Ingredient } from "@/types";

const UNITS = [
  "g",
  "kg",
  "ml",
  "cl",
  "L",
  "c. à soupe",
  "c. à café",
  "verre",
  "pièce",
  "tranche",
  "gousse",
  "pincée",
];

interface IngredientInputProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

export function IngredientInput({ ingredients, onChange }: IngredientInputProps) {
  const addIngredient = () => {
    onChange([...ingredients, { name: "", quantity: 0, unit: "g" }]);
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const normalizeAt = (index: number) => {
    const ing = ingredients[index];
    if (!ing?.name.trim()) return;
    const normalized = normalizeIngredientName(ing.name);
    if (normalized !== ing.name) {
      updateIngredient(index, "name", normalized);
    }
  };

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Ingrédients</h3>
        <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      {ingredients.length === 0 && (
        <p className="text-sm text-muted text-center py-4">
          Aucun ingrédient. Ajoutez-en ou laissez l&apos;IA les détecter.
        </p>
      )}

      {ingredients.map((ing, index) => {
        const grams = ing.name.trim()
          ? toGrams(ing.name, ing.quantity, ing.unit)
          : null;
        const isAlreadyGrams = normalizeUnit(ing.unit) === "g";
        const equivalence = isAlreadyGrams ? null : describeGrams(grams);
        const unknownWeight = ing.name.trim() && ing.quantity > 0 && grams == null;

        return (
          <div
            key={index}
            className="space-y-2 p-3 rounded-2xl bg-surface border border-border/60"
          >
            <div className="flex gap-2 items-start">
              <Input
                placeholder="Nom"
                value={ing.name}
                onChange={(e) => updateIngredient(index, "name", e.target.value)}
                onBlur={() => normalizeAt(index)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Qté"
                value={ing.quantity || ""}
                onChange={(e) =>
                  updateIngredient(index, "quantity", Number(e.target.value))
                }
                className="w-20"
              />
              <select
                value={ing.unit}
                onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                className="h-12 px-2 rounded-2xl bg-surface-elevated border border-border/50 text-sm"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
                aria-label="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <input
              value={ing.note ?? ""}
              onChange={(e) => updateIngredient(index, "note", e.target.value)}
              placeholder="Type ou marque (ex : emmental 28%, lait demi-écrémé)"
              className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border/40 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
            />

            {equivalence && <p className="text-xs text-accent px-1">{equivalence}</p>}
            {unknownWeight && (
              <p className="text-xs text-muted px-1">
                Poids inconnu — l&apos;IA l&apos;estimera pour la liste de courses.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
