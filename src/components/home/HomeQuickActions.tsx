"use client";

import Link from "next/link";
import { PenLine, ShoppingCart, Sparkles } from "lucide-react";

export function HomeQuickActions() {
  return (
    <section className="grid grid-cols-2 gap-3 animate-fade-up stagger-4">
      <Link
        href="/recettes/nouvelle"
        className="tap-scale col-span-2 relative overflow-hidden rounded-3xl bg-accent p-5 text-white shadow-lg shadow-accent/25"
      >
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" aria-hidden />
        <div className="absolute right-8 bottom-0 w-16 h-16 rounded-full bg-white/5" aria-hidden />
        <Sparkles className="w-5 h-5 opacity-80 mb-2" />
        <p className="font-handwritten text-3xl leading-tight">Nouvelle recette</p>
        <p className="text-sm opacity-80 mt-1">Photo + analyse nutrition IA</p>
      </Link>

      <Link
        href="/courses"
        className="tap-scale flex flex-col gap-2 p-4 rounded-2xl bg-surface border border-border"
      >
        <ShoppingCart className="w-5 h-5 text-accent" />
        <span className="text-sm font-medium">Courses</span>
      </Link>

      <Link
        href="/recettes"
        className="tap-scale flex flex-col gap-2 p-4 rounded-2xl bg-surface border border-border"
      >
        <PenLine className="w-5 h-5 text-accent" />
        <span className="text-sm font-medium">Mes recettes</span>
      </Link>
    </section>
  );
}
