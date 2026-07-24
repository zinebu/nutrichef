"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  RECIPE_CATEGORIES,
  COOKING_TYPES,
  RECIPE_TAGS,
} from "@/lib/constants";
import type { RecipeFilters } from "@/types";

interface RecipeFiltersProps {
  filters: RecipeFilters;
  onChange: (filters: RecipeFilters) => void;
}

export function RecipeFiltersPanel({ filters, onChange }: RecipeFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleTag = (tag: typeof RECIPE_TAGS[number]["value"]) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags });
  };

  const resetFilters = () => {
    onChange({
      search: "",
      category: "",
      tags: [],
      maxCalories: null,
      maxPrepTime: null,
      cookingType: "",
      ingredients: [],
      favoritesOnly: false,
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.tags.length > 0 ||
    filters.maxCalories ||
    filters.maxPrepTime ||
    filters.cookingType ||
    filters.favoritesOnly;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <Input
          placeholder="Rechercher une recette..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-12"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Button
          variant={filters.favoritesOnly ? "primary" : "secondary"}
          size="sm"
          onClick={() =>
            onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })
          }
        >
          ❤️ Favoris
        </Button>
        <Button
          variant={showAdvanced ? "primary" : "secondary"}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="w-4 h-4" />
            Effacer
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div>
            <p className="text-sm font-medium text-muted mb-2">Catégorie</p>
            <div className="flex flex-wrap gap-2">
              {RECIPE_CATEGORIES.map((cat) => (
                <Badge
                  key={cat.value}
                  onClick={() =>
                    onChange({
                      ...filters,
                      category: filters.category === cat.value ? "" : cat.value,
                    })
                  }
                  active={filters.category === cat.value}
                  className="bg-surface-elevated text-foreground border border-border/50"
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted mb-2">Tags</p>
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
      )}
    </div>
  );
}
