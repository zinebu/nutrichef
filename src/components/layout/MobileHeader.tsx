"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { CherryLogo } from "./CherryLogo";

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
  handwritten?: boolean;
  showBack?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function MobileHeader({
  title,
  showLogo,
  handwritten,
  showBack,
  action,
  className,
}: MobileHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 pt-safe",
        className
      )}
    >
      <div className="flex items-center justify-between h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg active:bg-surface transition-colors shrink-0"
              aria-label="Retour"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {showLogo ? (
            <CherryLogo size="md" animate />
          ) : title ? (
            <h1
              className={cn(
                "truncate",
                handwritten
                  ? "font-handwritten text-3xl text-accent"
                  : "text-base font-medium"
              )}
            >
              {title}
            </h1>
          ) : null}
        </div>
        {action && <div className="shrink-0 ml-2">{action}</div>}
      </div>
    </header>
  );
}
