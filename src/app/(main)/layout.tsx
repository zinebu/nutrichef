import { AppShell } from "@/components/layout/AppShell";
import { AppDataProvider } from "@/contexts/AppDataContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppDataProvider>
      <AppShell>{children}</AppShell>
    </AppDataProvider>
  );
}
