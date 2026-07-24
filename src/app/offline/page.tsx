"use client";

import { WifiOff } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <>
      <MobileHeader title="Hors ligne" handwritten />
      <main className="px-4 py-12 text-center space-y-4">
        <WifiOff className="w-12 h-12 text-muted mx-auto" strokeWidth={1.5} />
        <p className="text-muted text-sm">Hors ligne. Reconnectez-vous pour synchroniser.</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </main>
    </>
  );
}
