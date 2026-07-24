import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/constants";

interface CherryLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

const sizes = {
  sm: { icon: "text-xl", text: "text-2xl" },
  md: { icon: "text-2xl", text: "text-3xl" },
  lg: { icon: "text-3xl", text: "text-4xl" },
  xl: { icon: "text-4xl", text: "text-5xl" },
};

export function CherryLogo({ size = "md", className, animate = false }: CherryLogoProps) {
  const s = sizes[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 leading-none",
        animate && "animate-logo-in",
        className
      )}
    >
      <span className={cn(s.icon, "select-none")} role="img" aria-hidden>
        🍒
      </span>
      <span className={cn(s.text, "font-handwritten text-accent tracking-tight")}>
        {APP_NAME}
      </span>
    </div>
  );
}
