import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function Badge({ children, className, onClick, active }: BadgeProps) {
  const Component = onClick ? "button" : "span";
  return (
    <Component
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all",
        active && "ring-2 ring-accent ring-offset-1 ring-offset-background",
        onClick && "cursor-pointer active:scale-95",
        className
      )}
    >
      {children}
    </Component>
  );
}
