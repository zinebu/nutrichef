"use client";

import Link from "next/link";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import { CherryIcon } from "@/components/layout/CherryIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export type RecipeView = "mosaic" | "list";

interface RecipeHeaderProps {
  total: number;
  shown: number;
  search: string;
  view: RecipeView;
  onSearch: (value: string) => void;
  onViewChange: (view: RecipeView) => void;
}

export function RecipeHeader({
  total,
  shown,
  search,
  view,
  onSearch,
  onViewChange,
}: RecipeHeaderProps) {
  const subtitle =
    total === 0
      ? "Ton carnet est vide"
      : shown === total
        ? `${total} recette${total > 1 ? "s" : ""} dans ton carnet`
        : `${shown} sur ${total} recette${total > 1 ? "s" : ""}`;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 home-hero-bg" aria-hidden />
      <div
        className="absolute -top-10 right-4 w-36 h-36 rounded-full bg-accent/10 blur-2xl home-float"
        aria-hidden
      />

      <div className="relative px-4 pt-safe pb-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2 text-accent">
            <CherryIcon size={24} />
            <h1 className="font-handwritten text-3xl leading-none">Mes recettes</h1>
          </div>
          <Link href="/recettes/nouvelle">
            <Button size="sm" className="rounded-full w-9 h-9 p-0 shadow-md shadow-accent/20">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted mt-1">{subtitle}</p>

        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Chercher une recette, un plat..."
              className="w-full h-11 pl-10 pr-3 rounded-full bg-surface/85 backdrop-blur-sm border border-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          <div className="flex shrink-0 rounded-full bg-surface/85 backdrop-blur-sm border border-border/80 p-0.5">
            <ViewButton
              active={view === "mosaic"}
              onClick={() => onViewChange("mosaic")}
              label="Mosaïque"
            >
              <LayoutGrid className="w-4 h-4" />
            </ViewButton>
            <ViewButton
              active={view === "list"}
              onClick={() => onViewChange("list")}
              label="Liste"
            >
              <List className="w-4 h-4" />
            </ViewButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "w-9 h-10 rounded-full flex items-center justify-center transition-colors",
        active ? "bg-accent text-white" : "text-muted"
      )}
    >
      {children}
    </button>
  );
}
