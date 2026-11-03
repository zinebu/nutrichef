import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/constants";
import { CherryIcon } from "./CherryIcon";

interface CherryLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

const sizes = {
  sm: { icon: 22, text: "text-xl" },
  md: { icon: 28, text: "text-2xl" },
  lg: { icon: 36, text: "text-3xl" },
  xl: { icon: 44, text: "text-4xl" },
};

export function CherryLogo({ size = "md", className, animate = false }: CherryLogoProps) {
  const s = sizes[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 leading-none text-foreground",
        animate && "animate-logo-in",
        className
      )}
    >
      <CherryIcon size={s.icon} />
      <span
        className={cn(
          s.text,
          "font-display font-semibold tracking-[-0.03em] text-accent"
        )}
      >
        {APP_NAME}
      </span>
    </div>
  );
}
