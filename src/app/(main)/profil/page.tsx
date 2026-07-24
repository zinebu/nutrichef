"use client";

import { useEffect, useState } from "react";
import { LogOut, Moon, User } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const supabaseEnabled = isSupabaseConfigured();

  useEffect(() => {
    if (supabaseEnabled) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setEmail(data.user?.email ?? null);
      });
    } else {
      setEmail("Mode démo (local)");
    }
  }, [supabaseEnabled]);

  const handleLogout = async () => {
    if (supabaseEnabled) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/login");
  };

  return (
    <>
      <MobileHeader title="Profil" handwritten />

      <main className="px-4 py-4 space-y-4">
        <Card elevated className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <User className="w-8 h-8 text-accent" />
          </div>
          <div>
            <p className="font-semibold">{email ?? "Utilisateur"}</p>
            <p className="text-sm text-muted">Compte Cherry</p>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted" />
              <span className="text-sm">Mode sombre</span>
            </div>
            <span className="text-xs text-muted">Automatique (système)</span>
          </div>
        </Card>

        {!supabaseEnabled && (
          <Card className="bg-amber-500/10 border-amber-500/20">
            <p className="text-sm text-amber-400">
              Mode démo actif. Configurez Supabase dans .env.local pour la synchronisation cloud.
            </p>
          </Card>
        )}

        {supabaseEnabled ? (
          <Button variant="danger" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        ) : (
          <Button variant="secondary" className="w-full" onClick={() => router.push("/login")}>
            Configurer un compte
          </Button>
        )}
      </main>
    </>
  );
}
