# NutriChef 🥗

Application PWA mobile-first pour gérer vos recettes, analyser la nutrition avec l'IA, planifier vos repas et générer des listes de courses.

## Fonctionnalités

- **Dashboard** — résumé calories, favoris, repas récents
- **Recettes** — CRUD complet avec photo, tags, ingrédients
- **Analyse IA** — OpenAI Vision pour calories, macros et conseils
- **Filtres dynamiques** — catégorie, tags, calories, cuisson
- **Favoris** — ajout/retrait en un tap
- **Planning hebdomadaire** — choisir une recette par jour
- **Liste de courses** — génération auto avec regroupement par catégorie
- **PWA** — installable sur iPhone via Safari

## Démarrage rapide

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). Sans configuration Supabase, l'app fonctionne en **mode démo** (données locales).

## Configuration

### Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Exécutez `supabase/migrations/001_initial_schema.sql` dans l'éditeur SQL
3. Créez un bucket Storage `recipe-photos` (public)
4. Copiez URL et anon key dans `.env.local`

### OpenAI

Ajoutez votre clé dans `.env.local` :

```
OPENAI_API_KEY=sk-...
```

### Installation PWA sur iPhone

1. Déployez l'app (Vercel recommandé)
2. Ouvrez dans Safari
3. Partager → **Sur l'écran d'accueil**

## Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # ESLint
```

## Déploiement

Recommandé : [Vercel](https://vercel.com)

Variables d'environnement à configurer :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Architecture

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour l'arborescence complète, les choix techniques et le schéma de base de données.
