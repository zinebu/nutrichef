"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Ingredient } from "@/types";

const UNITS = ["g", "ml", "cl", "L", "cuillère", "pièce", "pincée", "tranche"];

interface IngredientInputProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

export function IngredientInput({ ingredients, onChange }: IngredientInputProps) {
  const addIngredient = () => {
    onChange([...ingredients, { name: "", quantity: 0, unit: "g" }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
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

      {ingredients.map((ing, index) => (
        <div key={index} className="flex gap-2 items-start">
          <Input
            placeholder="Nom"
            value={ing.name}
            onChange={(e) => updateIngredient(index, "name", e.target.value)}
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
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
