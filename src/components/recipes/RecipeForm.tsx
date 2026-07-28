"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { PhotoPicker } from "@/components/recipes/PhotoPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { IngredientInput } from "@/components/recipes/IngredientInput";
import { NutritionPanel } from "@/components/recipes/NutritionPanel";
import {
  RECIPE_CATEGORIES,
  COOKING_TYPES,
  RECIPE_TAGS,
} from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { toGrams } from "@/lib/utils/unit-convert";
import type {
  CreateRecipeInput,
  Ingredient,
  NutritionData,
  Recipe,
  RecipeCategory,
  RecipeTag,
  CookingType,
} from "@/types";

const FAT_TYPES = [
  "Aucune",
  "Huile d'olive",
  "Huile de tournesol",
  "Beurre",
  "Margarine",
  "Huile de coco",
];

const FAT_UNITS = ["g", "ml", "c. à soupe", "c. à café"];

/** Reconstitue l'analyse affichée dans le formulaire depuis une recette enregistrée */
function nutritionFromRecipe(recipe?: Recipe | null): NutritionData | null {
  if (!recipe || recipe.calories_total == null) return null;
  return {
    detectedFoods: recipe.ai_detected_foods ?? [],
    caloriesTotal: recipe.calories_total,
    caloriesPerServing: recipe.calories_per_serving ?? 0,
    proteinsG: recipe.proteins_g ?? 0,
    carbsG: recipe.carbs_g ?? 0,
    fatsG: recipe.fats_g ?? 0,
    sugarG: recipe.sugar_g ?? 0,
    fiberG: recipe.fiber_g ?? 0,
    tips: recipe.nutrition_tips ?? "",
  };
}

interface RecipeFormProps {
  onSubmit: (data: CreateRecipeInput) => Promise<void>;
  /** Recette à modifier : le formulaire repart de ses valeurs */
  initialRecipe?: Recipe | null;
  submitLabel?: string;
}

export function RecipeForm({ onSubmit, initialRecipe, submitLabel }: RecipeFormProps) {
  const [name, setName] = useState(initialRecipe?.name ?? "");
  const [description, setDescription] = useState(initialRecipe?.description ?? "");
  const [category, setCategory] = useState<RecipeCategory>(
    initialRecipe?.category ?? "dejeuner"
  );
  const [tags, setTags] = useState<RecipeTag[]>(initialRecipe?.tags ?? []);
  const [cookingType, setCookingType] = useState<CookingType>(
    initialRecipe?.cooking_type ?? "four"
  );
  const [prepTime, setPrepTime] = useState<number>(
    initialRecipe?.prep_time_minutes ?? 30
  );
  const [servings, setServings] = useState(initialRecipe?.servings ?? 2);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients ?? []
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialRecipe?.photo_url ?? null
  );
  const [nutrition, setNutrition] = useState<NutritionData | null>(
    nutritionFromRecipe(initialRecipe)
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Seul le poids en grammes est enregistré, l'unité repart donc de « g »
  const [fatType, setFatType] = useState(
    initialRecipe?.cooking_fat_type ?? FAT_TYPES[0]
  );
  const [fatQuantity, setFatQuantity] = useState(
    initialRecipe?.cooking_fat_grams ?? 0
  );
  const [fatUnit, setFatUnit] = useState(
    initialRecipe?.cooking_fat_grams ? "g" : FAT_UNITS[0]
  );
  const [cookedWeight, setCookedWeight] = useState(
    initialRecipe?.total_cooked_weight_g ?? 0
  );
  const [extras, setExtras] = useState(initialRecipe?.extras ?? "");

  const cookingFat =
    fatType !== "Aucune" && fatQuantity > 0
      ? { type: fatType, quantity: fatQuantity, unit: fatUnit }
      : null;

  const handlePhoto = (dataUrl: string) => setPhotoPreview(dataUrl);

  const toggleTag = (tag: RecipeTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const analyzeNutrition = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/nutrition/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: photoPreview,
          ingredients: ingredients.map((ing) => ({
            ...ing,
            grams: ing.grams ?? toGrams(ing.name, ing.quantity, ing.unit) ?? undefined,
          })),
          cookingType,
          servings,
          recipeName: name,
          cookingFat,
          totalCookedWeightG: cookedWeight > 0 ? cookedWeight : null,
          extras,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNutrition(data);
        if (data.estimatedIngredients?.length && ingredients.length === 0) {
          setIngredients(data.estimatedIngredients);
        }
      } else {
        const err = await res.json();
        alert(err.error ?? "Erreur d'analyse");
      }
    } catch {
      alert("Impossible de contacter le serveur d'analyse");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        description,
        photo_url: photoPreview ?? undefined,
        category,
        tags,
        cooking_type: cookingType,
        prep_time_minutes: prepTime,
        servings,
        ingredients,
        nutrition: nutrition ?? undefined,
        cooking_fat_type: cookingFat?.type,
        cooking_fat_grams: cookingFat
          ? toGrams(cookingFat.type, cookingFat.quantity, cookingFat.unit) ?? undefined
          : undefined,
        total_cooked_weight_g: cookedWeight > 0 ? cookedWeight : undefined,
        extras: extras.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-8">
      <PhotoPicker preview={photoPreview} onChange={handlePhoto} />

      <Input label="Nom de la recette" value={name} onChange={(e) => setName(e.target.value)} required />

      <div>
        <label className="text-sm font-medium text-muted">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1.5 w-full px-4 py-3 rounded-2xl bg-surface-elevated border border-border/50 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          placeholder="Décrivez votre recette..."
        />
      </div>

      <div>
        <p className="text-sm font-medium text-muted mb-2">Catégorie</p>
        <div className="flex flex-wrap gap-2">
          {RECIPE_CATEGORIES.map((cat) => (
            <Badge
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              active={category === cat.value}
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
              active={tags.includes(tag.value)}
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
              onClick={() => setCookingType(type.value)}
              active={cookingType === type.value}
              className="bg-surface-elevated text-foreground border border-border/50"
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Temps (min)"
          type="number"
          value={prepTime}
          onChange={(e) => setPrepTime(Number(e.target.value))}
        />
        <Input
          label="Portions"
          type="number"
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
        />
      </div>

      <IngredientInput ingredients={ingredients} onChange={setIngredients} />

      <Card className="space-y-4">
        <div>
          <h3 className="font-medium text-sm">Précision de l&apos;analyse</h3>
          <p className="text-xs text-muted mt-1">
            Ces détails changent beaucoup le résultat calorique.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted mb-2">
            Matière grasse de cuisson
          </p>
          <div className="flex gap-2">
            <select
              value={fatType}
              onChange={(e) => setFatType(e.target.value)}
              className="flex-1 h-12 px-3 rounded-2xl bg-surface-elevated border border-border/50 text-sm"
            >
              {FAT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {fatType !== "Aucune" && (
              <>
                <Input
                  type="number"
                  placeholder="Qté"
                  value={fatQuantity || ""}
                  onChange={(e) => setFatQuantity(Number(e.target.value))}
                  className="w-20"
                />
                <select
                  value={fatUnit}
                  onChange={(e) => setFatUnit(e.target.value)}
                  className="h-12 px-2 rounded-2xl bg-surface-elevated border border-border/50 text-sm"
                >
                  {FAT_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
          <p className="text-xs text-muted mt-1.5">
            Compte aussi l&apos;huile ou le beurre qui sert juste à graisser le plat.
          </p>
        </div>

        <Input
          label="Poids total après cuisson (g, optionnel)"
          type="number"
          value={cookedWeight || ""}
          onChange={(e) => setCookedWeight(Number(e.target.value))}
        />

        <div>
          <label className="text-sm font-medium text-muted">
            Ajouts et garnitures
          </label>
          <textarea
            value={extras}
            onChange={(e) => setExtras(e.target.value)}
            rows={2}
            className="mt-1.5 w-full px-4 py-3 rounded-2xl bg-surface-elevated border border-border/50 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none text-sm"
            placeholder="Sauce, fromage sur le dessus, sucre, noix, chocolat..."
          />
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Analyse IA
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={analyzeNutrition}
            disabled={analyzing || (!photoPreview && ingredients.length === 0)}
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Analyser"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted">
          {initialRecipe
            ? "Relance l'analyse si tu as changé les ingrédients, les quantités ou le nombre de portions."
            : "Ajoutez une photo et/ou des ingrédients, puis lancez l'analyse nutritionnelle OpenAI."}
        </p>
      </Card>

      {nutrition && <NutritionPanel nutrition={nutrition} />}

      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          (submitLabel ?? "Enregistrer la recette")
        )}
      </Button>
    </form>
  );
}
