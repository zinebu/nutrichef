"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/recettes", label: "Recettes", icon: BookOpen },
  { href: "/courses", label: "Courses", icon: ShoppingCart },
  { href: "/profil", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto max-w-lg">
        <div className="mx-3 mb-3 flex items-center justify-around rounded-3xl bg-surface-elevated/95 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/20 px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all min-w-[64px]",
                  isActive
                    ? "text-accent"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("w-6 h-6 transition-transform", isActive && "scale-110")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
