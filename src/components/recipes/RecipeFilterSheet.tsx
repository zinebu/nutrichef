"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { COOKING_TYPES, RECIPE_TAGS } from "@/lib/constants";
import type { RecipeFilters, RecipeTag } from "@/types";

interface RecipeFilterSheetProps {
  filters: RecipeFilters;
  onChange: (filters: RecipeFilters) => void;
  onClose: () => void;
  onReset: () => void;
  resultCount: number;
}

export function RecipeFilterSheet({
  filters,
  onChange,
  onClose,
  onReset,
  resultCount,
}: RecipeFilterSheetProps) {
  const toggleTag = (tag: RecipeTag) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer"
      />

      <div className="relative w-full max-w-lg bg-background rounded-t-3xl max-h-[85vh] flex flex-col animate-fade-up pb-safe">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h2 className="font-handwritten text-2xl text-accent">Affiner</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl active:bg-surface"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <div>
            <p className="text-sm font-medium text-muted mb-2">Envie de...</p>
            <div className="flex flex-wrap gap-2">
              {RECIPE_TAGS.map((tag) => (
                <Badge
                  key={tag.value}
                  onClick={() => toggleTag(tag.value)}
                  active={filters.tags.includes(tag.value)}
                  className={tag.color}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted mb-2">Type de cuisson</p>
            <div className="flex flex-wrap gap-2">
              {COOKING_TYPES.map((type) => (
                <Badge
                  key={type.value}
                  onClick={() =>
                    onChange({
                      ...filters,
                      cookingType:
                        filters.cookingType === type.value ? "" : type.value,
                    })
                  }
                  active={filters.cookingType === type.value}
                  className="bg-surface-elevated text-foreground border border-border/50"
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Calories max"
              type="number"
              placeholder="500"
              value={filters.maxCalories ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxCalories: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
            <Input
              label="Temps max (min)"
              type="number"
              placeholder="30"
              value={filters.maxPrepTime ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxPrepTime: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-border">
          <Button variant="secondary" className="flex-1" onClick={onReset}>
            Réinitialiser
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Voir {resultCount} recette{resultCount > 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}
