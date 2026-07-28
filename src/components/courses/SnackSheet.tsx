"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChefHat,
  ChevronLeft,
  Cookie,
  Loader2,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RecipeThumb } from "./RecipeThumb";
import type { QuickNutrition, Recipe } from "@/types";

type Step = "choice" | "homemade" | "bought";

interface SnackSheetProps {
  dayLabel: string;
  /** Recettes maison, snacks achetés exclus */
  homemadeRecipes: Recipe[];
  /** Produits déjà identifiés par l'IA, réutilisables en un appui */
  savedProducts: Recipe[];
  onQuickAdd: (name: string, quantity?: string) => Promise<QuickNutrition>;
  onManualAdd: (name: string, calories: number) => Promise<void>;
  onPickRecipe: (recipeId: string) => void;
  onClose: () => void;
}

export function SnackSheet({
  dayLabel,
  homemadeRecipes,
  savedProducts,
  onQuickAdd,
  onManualAdd,
  onPickRecipe,
  onClose,
}: SnackSheetProps) {
  const [step, setStep] = useState<Step>("choice");
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [calories, setCalories] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuickNutrition | null>(null);

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return homemadeRecipes;
    return homemadeRecipes.filter((r) => r.name.toLowerCase().includes(query));
  }, [homemadeRecipes, search]);

  const handleAdd = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const nutrition = await onQuickAdd(name.trim(), quantity.trim() || undefined);
      setResult(nutrition);
      setName("");
      setQuantity("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analyse impossible");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async () => {
    const kcal = Number(calories);
    if (!name.trim() || !Number.isFinite(kcal) || kcal <= 0 || loading) return;
    setLoading(true);
    try {
      await onManualAdd(name.trim(), kcal);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const title =
    step === "homemade"
      ? "Recette maison"
      : step === "bought"
        ? "Produit acheté"
        : "Ajouter un snack";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer"
      />

      <div className="relative w-full max-w-lg bg-background rounded-t-3xl max-h-[88vh] flex flex-col animate-fade-up pb-safe">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center gap-1 min-w-0">
            {step !== "choice" && (
              <button
                type="button"
                onClick={() => {
                  setStep("choice");
                  setError(null);
                  setResult(null);
                }}
                className="p-2 -ml-2 rounded-full active:bg-surface shrink-0"
                aria-label="Retour"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <p className="text-xs text-muted uppercase tracking-wide">{dayLabel}</p>
              <h3 className="font-handwritten text-2xl text-accent leading-tight truncate">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full active:bg-surface shrink-0"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {step === "choice" && (
            <div className="space-y-3">
              <p className="text-sm text-muted">D&apos;où vient ce snack ?</p>

              <button
                type="button"
                onClick={() => setStep("homemade")}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border text-left tap-scale"
              >
                <span className="w-11 h-11 rounded-2xl bg-accent/12 flex items-center justify-center shrink-0">
                  <ChefHat className="w-5 h-5 text-accent" strokeWidth={1.75} />
                </span>
                <span className="flex-1">
                  <span className="block font-medium">Recette maison</span>
                  <span className="block text-xs text-muted mt-0.5">
                    Une de tes recettes, avec ses calories déjà calculées
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStep("bought")}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border text-left tap-scale"
              >
                <span className="w-11 h-11 rounded-2xl bg-accent/12 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-accent" strokeWidth={1.75} />
                </span>
                <span className="flex-1">
                  <span className="block font-medium">Produit acheté</span>
                  <span className="block text-xs text-muted mt-0.5">
                    Tape la marque ou le biscuit, l&apos;IA le reconnaît, calcule
                    l&apos;apport et crée l&apos;image
                  </span>
                </span>
              </button>
            </div>
          )}

          {step === "homemade" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Chercher dans mes recettes..."
                  className="w-full h-11 pl-10 pr-3 rounded-full bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  autoFocus
                />
              </div>

              {filteredRecipes.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm text-muted">Aucune recette maison trouvée.</p>
                  <Link href="/recettes/nouvelle" onClick={onClose}>
                    <Button variant="secondary" size="sm">
                      <Plus className="w-4 h-4" />
                      Créer une recette
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => {
                        onPickRecipe(recipe.id);
                        onClose();
                      }}
                      className="text-left rounded-2xl overflow-hidden border border-border bg-surface tap-scale"
                    >
                      <RecipeThumb recipe={recipe} size="lg" className="rounded-none" />
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
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "bought" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted">
                  <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    Écris simplement la marque ou le nom du biscuit. L&apos;IA identifie
                    le produit, son apport et son illustration.
                  </span>
                </div>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Bueno, prince choco, chips paprika..."
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  autoFocus
                />
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Quantité (facultatif) : 1 barre, 30 g, 2 pièces..."
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                />

                <Button className="w-full" onClick={handleAdd} disabled={!name.trim() || loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Identification du produit...
                    </span>
                  ) : (
                    "Identifier et ajouter"
                  )}
                </Button>

                {error && (
                  <div className="space-y-2 rounded-2xl border border-red-500/30 bg-red-500/5 p-3">
                    <p className="text-sm text-red-500 leading-snug">{error}</p>
                    <p className="text-xs text-muted">
                      Tu peux saisir les calories lues sur l&apos;emballage.
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleManualAdd()}
                        type="number"
                        inputMode="numeric"
                        placeholder="kcal"
                        className="w-24 h-11 px-3 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                      />
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={handleManualAdd}
                        disabled={!name.trim() || !calories || loading}
                      >
                        Ajouter sans l&apos;IA
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {result && (
                <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 space-y-3 animate-fade-up">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{result.name}</p>
                      <p className="text-xs text-muted">
                        {[result.brand, result.productType, result.servingDescription]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <p className="font-handwritten text-3xl text-accent leading-none shrink-0">
                      {Math.round(result.caloriesPerServing)}
                      <span className="text-sm font-sans ml-1">kcal</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "Prot.", value: result.proteinsG },
                      { label: "Gluc.", value: result.carbsG },
                      { label: "Lip.", value: result.fatsG },
                      { label: "Sucres", value: result.sugarG },
                    ].map((macro) => (
                      <div key={macro.label} className="rounded-xl bg-surface py-2">
                        <p className="text-sm font-medium">{Math.round(macro.value)}g</p>
                        <p className="text-[10px] text-muted">{macro.label}</p>
                      </div>
                    ))}
                  </div>

                  {result.tips && (
                    <p className="text-xs text-muted leading-snug">{result.tips}</p>
                  )}
                  <p className="text-xs text-accent">
                    Ajouté à {dayLabel.toLowerCase()}. L&apos;illustration apparaît dans
                    quelques secondes.
                  </p>
                </div>
              )}

              {savedProducts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted">Déjà identifiés</p>
                  <div className="space-y-2">
                    {savedProducts.map((snack) => (
                      <button
                        key={snack.id}
                        type="button"
                        onClick={() => {
                          onPickRecipe(snack.id);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-2xl bg-surface border border-border text-left tap-scale"
                      >
                        {snack.photo_url ? (
                          <RecipeThumb recipe={snack} size="sm" />
                        ) : (
                          <span className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                            <Cookie className="w-5 h-5 text-accent/60" strokeWidth={1.5} />
                          </span>
                        )}
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">
                            {snack.name}
                          </span>
                          {snack.calories_per_serving != null && (
                            <span className="block text-xs text-muted">
                              {Math.round(snack.calories_per_serving)} kcal
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
