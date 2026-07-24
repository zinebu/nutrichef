import { cn } from "@/lib/utils/cn";

interface CherryIconProps {
  className?: string;
  size?: number;
}

export function CherryIcon({ className, size = 24 }: CherryIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M12 3C12 3 14 6 14 9C14 10.1 13.1 11 12 11C10.9 11 10 10.1 10 9C10 6 12 3 12 3Z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="8.5" cy="16" r="4" fill="currentColor" />
      <circle cx="15.5" cy="17" r="3.5" fill="currentColor" opacity="0.85" />
      <path
        d="M12 3V8M12 8C10 8 7 9 6 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
