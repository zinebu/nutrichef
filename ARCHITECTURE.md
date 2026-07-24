# NutriChef — Architecture

Application PWA mobile-first de gestion alimentaire.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend | Next.js API Routes (server-side) |
| Base de données | Supabase PostgreSQL + Auth + Storage |
| IA | OpenAI GPT-4o Vision (API route sécurisée) |
| PWA | @ducanh2912/next-pwa |

## Arborescence

```
mon_app/
├── public/
│   ├── icons/              # Icônes PWA (192, 512)
│   └── manifest.json       # Manifest PWA
├── src/
│   ├── app/
│   │   ├── (main)/         # Routes protégées avec navigation
│   │   │   ├── layout.tsx  # AppShell + BottomNav
│   │   │   ├── page.tsx    # Dashboard
│   │   │   ├── recettes/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nouvelle/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── courses/page.tsx
│   │   │   └── profil/page.tsx
│   │   ├── api/
│   │   │   ├── nutrition/analyze/route.ts
│   │   │   ├── recipes/route.ts
│   │   │   ├── recipes/[id]/route.ts
│   │   │   ├── recipes/[id]/favorite/route.ts
│   │   │   ├── meal-plans/route.ts
│   │   │   └── shopping-lists/route.ts
│   │   ├── auth/callback/route.ts
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── offline/page.tsx
│   ├── components/
│   │   ├── layout/         # BottomNav, MobileHeader, AppShell
│   │   ├── recipes/        # RecipeCard, RecipeForm, Filters...
│   │   ├── courses/        # WeeklyPlanner, ShoppingListView
│   │   └── ui/             # Button, Card, Input, Badge...
│   ├── hooks/
│   │   └── useAppData.ts   # Hooks données + fallback localStorage
│   ├── lib/
│   │   ├── supabase/       # Client browser, server, middleware
│   │   ├── openai/         # Analyse nutritionnelle
│   │   ├── utils/          # cn, shopping-list
│   │   └── constants.ts
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts       # Auth Supabase
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

## Choix techniques

### App Router + Route Groups
- `(main)` regroupe les pages avec navigation bottom sans impacter les URLs
- API Routes pour toute la logique serveur (OpenAI, Supabase)

### Mode démo / Production
- Sans `.env.local` : données en localStorage, pas d'auth requise
- Avec Supabase : auth obligatoire, sync cloud, RLS

### OpenAI côté serveur uniquement
- Route `POST /api/nutrition/analyze` — clé `OPENAI_API_KEY` jamais exposée
- GPT-4o Vision pour photo + ingrédients + type de cuisson

### PWA iPhone
- `manifest.json` + meta Apple
- `viewport-fit=cover` + safe areas
- Installable via Safari → Partager → Sur l'écran d'accueil

## Modèle de données

```
profiles          → extension auth.users
recipes           → recettes (+ nutrition JSON-like columns)
ingredients       → ingrédients liés aux recettes
meal_plans        → planning hebdomadaire (week_start)
meal_plan_items   → recette par jour
shopping_lists    → listes générées
shopping_list_items → produits avec catégorie et état coché
```

## API Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST | `/api/recipes` | Liste / créer recette |
| GET/DELETE | `/api/recipes/[id]` | Détail / supprimer |
| PATCH | `/api/recipes/[id]/favorite` | Toggle favori |
| POST | `/api/nutrition/analyze` | Analyse OpenAI Vision |
| GET/POST | `/api/meal-plans?week=YYYY-MM-DD` | Planning semaine |
| GET/POST | `/api/shopping-lists` | Liste de courses |

## Sécurité

- Row Level Security (RLS) sur toutes les tables Supabase
- Middleware Next.js pour redirection auth
- Variables d'environnement pour clés API
- Validation Zod sur réponses OpenAI
