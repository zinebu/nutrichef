import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/constants";
import { CherryIcon } from "./CherryIcon";

interface CherryLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

const sizes = {
  sm: { icon: 20, text: "text-2xl" },
  md: { icon: 26, text: "text-3xl" },
  lg: { icon: 32, text: "text-4xl" },
  xl: { icon: 40, text: "text-5xl" },
};

export function CherryLogo({ size = "md", className, animate = false }: CherryLogoProps) {
  const s = sizes[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 leading-none text-accent",
        animate && "animate-logo-in",
        className
      )}
    >
      <CherryIcon size={s.icon} />
      <span className={cn(s.text, "font-handwritten tracking-tight")}>{APP_NAME}</span>
    </div>
  );
}
