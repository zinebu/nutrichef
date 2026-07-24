"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CherryLogo } from "@/components/layout/CherryLogo";
import { Mail } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { disableDemoMode } from "@/lib/demo";

const ERROR_MESSAGES: Record<string, string> = {
  "User already registered": "Cet email est déjà utilisé. Connecte-toi.",
  "Password should be at least 6 characters": "Mot de passe : minimum 6 caractères.",
  "Unable to validate email address: invalid format": "Adresse email invalide.",
  "Signup requires a valid password": "Mot de passe invalide.",
};

function translateError(message: string): string {
  return ERROR_MESSAGES[message] ?? message;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured()) {
      setError("Supabase non configuré sur le serveur. Vérifie les variables Vercel.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(translateError(authError.message));
      setLoading(false);
      return;
    }

    // Connexion directe si confirmation email désactivée
    if (data.session) {
      disableDemoMode();
      router.push("/");
      router.refresh();
      return;
    }

    // Sinon : email de confirmation envoyé
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <Mail className="w-12 h-12 text-accent mx-auto" strokeWidth={1.5} />
          <h1 className="font-handwritten text-3xl text-accent">Presque !</h1>
          <p className="text-muted text-sm">
            Un email de confirmation a été envoyé à <strong>{email}</strong>.
            Clique sur le lien, puis connecte-toi.
          </p>
          <Link href="/login">
            <Button className="w-full rounded-full">Aller à la connexion</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center animate-logo-in">
          <CherryLogo size="lg" className="justify-center" />
          <p className="text-sm text-muted mt-3">Créer un compte</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Nom complet"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jean Dupont"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@email.com"
            required
          />
          <Input
            label="Mot de passe (min. 6 caractères)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Création..." : "S'inscrire"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-accent">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
