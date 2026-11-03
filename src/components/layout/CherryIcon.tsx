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
      <rect x="3" y="3" width="18" height="18" rx="6" fill="currentColor" opacity="0.09" />
      <path
        d="M9 7.5V16.5M9 7.5H13.2C15.4 7.5 16.8 8.8 16.8 10.8C16.8 12.9 15.4 14.2 13.2 14.2H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4 14.2L17.5 16.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
