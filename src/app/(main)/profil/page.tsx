"use client";

import { useEffect, useState } from "react";
import { LogOut, Moon, User } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { disableDemoMode, isDemoModeClient } from "@/lib/demo";
import { useRouter } from "next/navigation";

export default function ProfilPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const supabaseEnabled = isSupabaseConfigured();

  useEffect(() => {
    const demo = isDemoModeClient();
    setIsDemo(demo);

    if (supabaseEnabled && !demo) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setEmail(data.user?.email ?? null);
      });
    } else {
      setEmail("Mode démo");
    }
  }, [supabaseEnabled]);

  const handleLogout = async () => {
    if (isDemo) {
      disableDemoMode();
      router.push("/login");
      router.refresh();
      return;
    }
    if (supabaseEnabled) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    disableDemoMode();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <MobileHeader title="Profil" handwritten />

      <main className="px-4 py-4 space-y-4">
        <Card className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <User className="w-8 h-8 text-accent" />
          </div>
          <div>
            <p className="font-semibold">{email ?? "Utilisateur"}</p>
            <p className="text-sm text-muted">
              {isDemo ? "Données sur cet appareil" : "Compte Cherry"}
            </p>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted" />
              <span className="text-sm">Mode sombre</span>
            </div>
            <span className="text-xs text-muted">Automatique</span>
          </div>
        </Card>

        {isDemo && (
          <Card className="bg-accent/5 border-accent/20">
            <p className="text-sm text-muted">
              Mode démo — tes recettes restent sur cet appareil. Connecte-toi pour les synchroniser.
            </p>
          </Card>
        )}

        <Button variant={isDemo ? "secondary" : "danger"} className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          {isDemo ? "Se connecter" : "Déconnexion"}
        </Button>
      </main>
    </>
  );
}
