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
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M16.2 4.2C16.2 4.2 18.8 8.6 18.4 12.4C18.2 14.1 17.1 15.2 15.5 15.2C13.9 15.2 12.9 14 13.1 12.3C13.5 8.5 16.2 4.2 16.2 4.2Z"
        fill="#3F8F5A"
      />
      <path
        d="M16.2 5.5C14.4 7.8 12.2 9.2 10.1 9.8"
        stroke="#2F6B44"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16.2 6.2C18.1 8.4 20.4 9.6 22.5 10"
        stroke="#2F6B44"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="11.2" cy="21.2" r="6.2" fill="#C73B4A" />
      <circle cx="12.6" cy="19.4" r="1.7" fill="#fff" opacity="0.35" />
      <circle cx="21.4" cy="22.4" r="5.6" fill="#A82D3C" />
      <circle cx="22.6" cy="20.8" r="1.4" fill="#fff" opacity="0.28" />
    </svg>
  );
}
