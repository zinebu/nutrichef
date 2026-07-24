"use client";

import { useState } from "react";
import { Camera, Loader2, Sparkles } from "lucide-react";
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
import type { CreateRecipeInput, Ingredient, NutritionData, RecipeCategory, RecipeTag, CookingType } from "@/types";

interface RecipeFormProps {
  onSubmit: (data: CreateRecipeInput) => Promise<void>;
}

export function RecipeForm({ onSubmit }: RecipeFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<RecipeCategory>("dejeuner");
  const [tags, setTags] = useState<RecipeTag[]>([]);
  const [cookingType, setCookingType] = useState<CookingType>("four");
  const [prepTime, setPrepTime] = useState<number>(30);
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

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
          ingredients,
          cookingType,
          servings,
          recipeName: name,
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
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-8">
      <label className="block">
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-surface-elevated border-2 border-dashed border-border/50 cursor-pointer">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
              <Camera className="w-10 h-10 mb-2" />
              <span className="text-sm">Ajouter une photo</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </label>

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
          Ajoutez une photo et/ou des ingrédients, puis lancez l&apos;analyse nutritionnelle OpenAI.
        </p>
      </Card>

      {nutrition && <NutritionPanel nutrition={nutrition} />}

      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer la recette"}
      </Button>
    </form>
  );
}
