"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, UtensilsCrossed, ChevronRight } from "lucide-react";
import { CherryLogo } from "@/components/layout/CherryLogo";
import { Button } from "@/components/ui/Button";
import { getGreeting, formatTodayDate } from "@/lib/utils/date";

interface HomeHeroProps {
  recipeCount: number;
  favoriteCount: number;
  shoppingLeft: number;
}

export function HomeHero({ recipeCount, favoriteCount, shoppingLeft }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 home-hero-bg" aria-hidden />
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-accent/10 blur-2xl home-float" aria-hidden />
      <div className="absolute top-24 -left-10 w-32 h-32 rounded-full bg-accent/5 blur-xl home-float-delayed" aria-hidden />

      <div className="relative px-4 pt-safe pb-5 max-w-lg mx-auto">
        <div className="flex items-center justify-between h-14">
          <CherryLogo size="md" animate />
          <Link href="/recettes/nouvelle">
            <Button size="sm" className="rounded-full w-9 h-9 p-0 shadow-md shadow-accent/20">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="mt-2 animate-fade-up">
          <p className="text-sm text-muted capitalize">{formatTodayDate()}</p>
          <h1 className="font-handwritten text-[2.75rem] leading-tight text-accent mt-1">
            {getGreeting()} !
          </h1>
          <p className="text-sm text-muted mt-1">Qu&apos;est-ce qu&apos;on cuisine aujourd&apos;hui ?</p>
        </div>

        <div className="flex gap-2 mt-5 overflow-x-auto scrollbar-hide animate-fade-up stagger-1">
          <StatPill label="Recettes" value={recipeCount} href="/recettes" />
          <StatPill label="Favoris" value={favoriteCount} href="/recettes" />
          <StatPill
            label="Courses"
            value={shoppingLeft > 0 ? shoppingLeft : "OK"}
            href="/courses"
            highlight={shoppingLeft > 0}
          />
        </div>
      </div>
    </section>
  );
}

function StatPill({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number | string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="tap-scale shrink-0 flex items-center gap-2 pl-3 pr-2 py-2 rounded-full bg-surface/80 backdrop-blur-sm border border-border/80 shadow-sm"
    >
      <div>
        <p className="text-[10px] text-muted uppercase tracking-wide leading-none">{label}</p>
        <p className={`text-lg font-semibold leading-tight ${highlight ? "text-accent" : ""}`}>
          {value}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted/60" />
    </Link>
  );
}

export function RecipePhoto({
  recipe,
  className,
  sizes = "200px",
}: {
  recipe: { name: string; photo_url: string | null };
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-accent/10 ${className ?? ""}`}>
      {recipe.photo_url ? (
        recipe.photo_url.startsWith("data:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.photo_url} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <Image src={recipe.photo_url} alt={recipe.name} fill className="object-cover" sizes={sizes} />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <UtensilsCrossed className="w-10 h-10 text-accent/40" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
