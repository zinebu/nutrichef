"use client";

import { useEffect, useState } from "react";
import { Download, Share, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallAppCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIOS());
    setReady(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  if (!ready) return null;

  if (installed) {
    return (
      <Card className="flex items-center gap-3 bg-accent/5 border-accent/20">
        <Smartphone className="w-5 h-5 text-accent shrink-0" />
        <p className="text-sm">Cherry est installée sur cet appareil.</p>
      </Card>
    );
  }

  if (deferredPrompt) {
    return (
      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Installer Cherry</p>
            <p className="text-sm text-muted mt-1">
              Accède à tes recettes directement depuis l&apos;écran d&apos;accueil, comme une vraie app.
            </p>
          </div>
        </div>
        <Button className="w-full" onClick={handleInstall}>
          <Download className="w-4 h-4" />
          Installer l&apos;application
        </Button>
      </Card>
    );
  }

  if (ios) {
    return (
      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <Share className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Installer sur iPhone</p>
            <p className="text-sm text-muted mt-1">
              Safari ne propose pas de bouton automatique. Suis ces étapes :
            </p>
          </div>
        </div>
        <ol className="text-sm text-muted space-y-2 pl-1 list-decimal list-inside">
          <li>Ouvre Cherry dans <strong className="text-foreground">Safari</strong> (pas Chrome)</li>
          <li>Appuie sur <strong className="text-foreground">Partager</strong> (icône carré avec flèche)</li>
          <li>Choisis <strong className="text-foreground">Sur l&apos;écran d&apos;accueil</strong></li>
          <li>Appuie sur <strong className="text-foreground">Ajouter</strong></li>
        </ol>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">Installer Cherry</p>
          <p className="text-sm text-muted mt-1">
            Ouvre l&apos;app dans Chrome, puis utilise le menu du navigateur →{" "}
            <strong className="text-foreground">Installer l&apos;application</strong> ou{" "}
            <strong className="text-foreground">Ajouter à l&apos;écran d&apos;accueil</strong>.
          </p>
        </div>
      </div>
    </Card>
  );
}
