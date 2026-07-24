"use client";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <>
      <MobileHeader title="Hors ligne" />
      <main className="px-4 py-12 text-center space-y-4">
        <div className="text-5xl">📡</div>
        <p className="text-muted">Vous êtes hors ligne. Reconnectez-vous pour synchroniser.</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </main>
    </>
  );
}
