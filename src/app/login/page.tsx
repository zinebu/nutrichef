"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CherryLogo } from "@/components/layout/CherryLogo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured()) {
      router.push("/");
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center animate-logo-in">
          <CherryLogo size="xl" className="justify-center" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4 animate-fade-up stagger-2">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@email.com"
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "..." : "Connexion"}
          </Button>
        </form>

        <div className="space-y-3 animate-fade-up stagger-3">
          <Button variant="ghost" className="w-full" onClick={() => router.push("/")}>
            Continuer sans compte
          </Button>
          <p className="text-center text-sm text-muted">
            <Link href="/signup" className="text-accent">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
