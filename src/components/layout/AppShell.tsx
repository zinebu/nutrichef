import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="mx-auto max-w-lg">{children}</div>
      <BottomNav />
    </div>
  );
}
