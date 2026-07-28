"use client";

import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Recipe } from "@/types";

const SIZES = {
  xs: "w-10 h-10",
  sm: "w-14 h-14",
  md: "w-20 h-20",
  lg: "w-full aspect-[4/3]",
};

export function RecipeThumb({
  recipe,
  size = "md",
  className,
}: {
  recipe: Recipe;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-accent/10 shrink-0",
        SIZES[size],
        className
      )}
    >
      {recipe.photo_url ? (
        recipe.photo_url.startsWith("data:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.photo_url}
            alt={recipe.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={recipe.photo_url}
            alt={recipe.name}
            fill
            loading="lazy"
            className="object-cover"
            sizes="120px"
          />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <UtensilsCrossed
            className={cn("text-accent/50", size === "xs" ? "w-4 h-4" : "w-6 h-6")}
            strokeWidth={1.5}
          />
        </div>
      )}
    </div>
  );
}
