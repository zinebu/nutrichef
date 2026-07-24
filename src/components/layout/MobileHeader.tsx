"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function MobileHeader({
  title,
  subtitle,
  showBack,
  action,
  className,
}: MobileHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30 px-4 pt-safe",
        className
      )}
    >
      <div className="flex items-center justify-between h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl hover:bg-surface-elevated transition-colors shrink-0"
              aria-label="Retour"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0 ml-2">{action}</div>}
      </div>
    </header>
  );
}
