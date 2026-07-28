"use client";

import { useState } from "react";
import { Cookie, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RecipeThumb } from "./RecipeThumb";
import type { QuickNutrition, Recipe } from "@/types";

interface SnackSheetProps {
  dayLabel: string;
  savedSnacks: Recipe[];
  onQuickAdd: (name: string, quantity?: string) => Promise<QuickNutrition>;
  onPickSaved: (recipeId: string) => void;
  onClose: () => void;
}

export function SnackSheet({
  dayLabel,
  savedSnacks,
  onQuickAdd,
  onPickSaved,
  onClose,
}: SnackSheetProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuickNutrition | null>(null);

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
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">{dayLabel}</p>
            <h3 className="font-handwritten text-2xl text-accent leading-tight">
              Ajouter un snack
            </h3>
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

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Tape ce que tu as acheté, l&apos;IA calcule l&apos;apport</span>
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Kinder Bueno, chips paprika, pomme..."
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
                  Analyse en cours...
                </span>
              ) : (
                "Estimer et ajouter"
              )}
            </Button>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {result && (
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 space-y-3 animate-fade-up">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="font-medium">{result.name}</p>
                  <p className="text-xs text-muted">{result.servingDescription}</p>
                </div>
                <p className="font-handwritten text-3xl text-accent leading-none">
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

              {result.tips && <p className="text-xs text-muted leading-snug">{result.tips}</p>}
              <p className="text-xs text-accent">
                Ajouté à {dayLabel.toLowerCase()} et enregistré dans tes snacks.
              </p>
            </div>
          )}

          {savedSnacks.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted">Déjà enregistrés</p>
              <div className="space-y-2">
                {savedSnacks.map((snack) => (
                  <button
                    key={snack.id}
                    type="button"
                    onClick={() => {
                      onPickSaved(snack.id);
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
                      <span className="block text-sm font-medium truncate">{snack.name}</span>
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
      </div>
    </div>
  );
}
