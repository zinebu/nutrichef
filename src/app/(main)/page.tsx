"use client";

import Link from "next/link";
import { Plus, BookOpen, ShoppingCart, PenLine } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/Button";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { useRecipes } from "@/hooks/useAppData";

const quickLinks = [
  { href: "/recettes", label: "Recettes", icon: BookOpen },
  { href: "/recettes/nouvelle", label: "Nouvelle", icon: PenLine },
  { href: "/courses", label: "Courses", icon: ShoppingCart },
];

export default function DashboardPage() {
  const { recipes, loading, toggleFavorite } = useRecipes();
  const recent = recipes.slice(0, 5);

  return (
    <>
      <MobileHeader
        showLogo
        action={
          <Link href="/recettes/nouvelle">
            <Button size="sm" className="rounded-full w-9 h-9 p-0">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        }
      />

      <main className="px-4 py-5 space-y-6 max-w-lg mx-auto">
        <div className="flex gap-2 animate-fade-up">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="tap-scale flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl bg-surface border border-border"
              >
                <Icon className="w-5 h-5 text-accent" strokeWidth={1.75} />
                <span className="text-xs text-muted">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <section className="animate-fade-up stagger-2">
          <h2 className="font-handwritten text-2xl text-accent mb-3">Récentes</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-surface animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          ) : recent.length > 0 ? (
            <div className="space-y-2">
              {recent.map((recipe, i) => (
                <div
                  key={recipe.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
                >
                  <RecipeCard recipe={recipe} onToggleFavorite={toggleFavorite} />
                </div>
              ))}
            </div>
          ) : (
            <Link
              href="/recettes/nouvelle"
              className="tap-scale flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed border-accent/30"
            >
              <PenLine className="w-8 h-8 text-accent mb-2" strokeWidth={1.5} />
              <p className="font-handwritten text-2xl text-accent">Ta première recette</p>
            </Link>
          )}
        </section>
      </main>
    </>
  );
}
