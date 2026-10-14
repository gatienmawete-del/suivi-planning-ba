# BA Tracker

Plateforme web moderne de suivi hebdomadaire des activités, livrables et objectifs d'une équipe de Business Analysts.

> Remplace le fichier Excel « Planning BA » par une app temps-réel avec authentification, kanban, analytics et workflow de validation.

---

## ✨ Fonctionnalités

### Côté BA
- 🗓️ **Planning hebdomadaire** : saisie des projets avec % d'allocation, livrables en kanban (À faire / En cours / Bloqué / Terminé), bench, commentaires.
- 📋 **Livrables** : titre, description, priorité (basse → critique), échéance dans la semaine, affectation à un projet.
- 🎯 **Objectifs personnels** : OKRs avec progression visuelle (slider 0-100 %) et échéance.
- 🏖️ **Demandes de congés** : dates, intérim, workflow validation admin.
- 📊 **Dashboard** : vue d'ensemble de la semaine (KPIs, livrables en cours, objectifs, prochains congés).
- 📁 **Historique** : navigation hebdomadaire, consultation de tout l'historique.

### Côté Admin
- 👥 **Gestion utilisateurs** : création avec affectation initiale aux projets, modification des attributions, réinitialisation mdp, activation/désactivation.
- 📂 **Catalogue projets** : code, nom, description, couleur, archivage.
- 👁️ **Vue équipe hebdomadaire** : qui a soumis / qui n'a pas, livrables en cours/bloqués par BA, allocation totale.
- ✅ **Validation plannings** et **approbation congés** en un clic.
- 📈 **Analytique** : évolution livrables, top projets, top BAs, bench moyen (graphiques Recharts).

### Transverses
- 🔐 Authentification Supabase (email/password), Row Level Security partout.
- 🌙 Mode clair/sombre automatique selon l'OS.
- 📱 Responsive mobile (sidebar collapsible).
- ⚡ Server Actions Next.js 15 (pas d'API routes à maintenir).

---

## 🛠️ Stack technique

- **[Next.js 15](https://nextjs.org)** (App Router, Server Actions, React 18)
- **[Supabase](https://supabase.com)** (Postgres + Auth + Row Level Security)
- **[TypeScript](https://www.typescriptlang.org)**
- **[Tailwind CSS](https://tailwindcss.com)** + composants Radix UI
- **[Recharts](https://recharts.org)** pour l'analytique
- **[Zod](https://zod.dev)** pour la validation
- **[Lucide](https://lucide.dev)** pour les icônes

---

## 🚀 Démarrage rapide

### 1 — Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**.
2. Récupère depuis **Settings → API** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secret, jamais côté client)

### 2 — Appliquer le schéma

Ouvre le **SQL Editor** de Supabase, colle le contenu de `supabase/migrations/001_initial_schema.sql` et exécute. Cela crée toutes les tables, triggers, RLS policies.

### 3 — Installer et configurer en local

```bash
# Installer les dépendances
npm install

# Copier l'env et le remplir avec tes clés Supabase
cp .env.example .env.local
# (édite .env.local)

# (Optionnel) Créer les 18 utilisateurs du fichier Excel initial
node scripts/seed-users.mjs

# (Optionnel) Charger l'historique des semaines + projets dans Supabase :
# Ouvre le SQL Editor et exécute le contenu de supabase/seed.sql
```

> 💡 Si tu ne veux pas des données du fichier Excel, saute les deux dernières étapes et crée ton premier admin via l'interface Supabase (`Authentication → Users → Add user`), puis passe son `role` à `admin` dans la table `profiles`.

### 4 — Lancer en dev

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Les comptes seedés utilisent le mot de passe par défaut `ChangeMe123!`. Chaque utilisateur doit le changer à sa première connexion (Settings → Paramètres).

**Admin par défaut (si seedé)** :
- `audrey.mabiala@ba-tracker.local`
- `karhyt.mboungou@ba-tracker.local`

---

## ☁️ Déploiement sur Vercel

### Via l'interface Vercel

1. Push ce repo sur GitHub.
2. Sur [vercel.com](https://vercel.com) → **Import Project** → sélectionne le repo.
3. **Environment Variables** : ajoute les 3 variables de `.env.example`.
4. **Deploy** 🚀

### Via la CLI

```bash
npm i -g vercel
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel deploy --prod
```

### Après le déploiement

1. Dans **Supabase → Authentication → URL Configuration**, ajoute l'URL Vercel :
   - **Site URL** : `https://ton-projet.vercel.app`
   - **Redirect URLs** : `https://ton-projet.vercel.app/**`

---

## 📁 Structure du projet

```
ba-tracker/
├── app/
│   ├── (app)/                  # Zone authentifiée (groupe de routes)
│   │   ├── layout.tsx          # Sidebar + check auth
│   │   ├── dashboard/          # Accueil
│   │   ├── planning/           # Saisie semaine courante / historique via ?week=
│   │   ├── history/            # Liste des semaines passées
│   │   ├── objectives/         # OKRs personnels
│   │   ├── vacations/          # Demandes de congés
│   │   ├── settings/           # Profil + mot de passe
│   │   └── admin/
│   │       ├── team/           # Vue équipe hebdomadaire
│   │       ├── users/          # CRUD utilisateurs
│   │       ├── projects/       # Catalogue projets
│   │       └── analytics/      # Graphiques
│   ├── login/                  # Page de connexion
│   ├── auth/signout/           # Route handler déconnexion
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # Composants réutilisables (shadcn-like)
│   └── sidebar.tsx             # Navigation principale
├── lib/
│   ├── actions/                # Server Actions (planning, vacations, admin)
│   ├── supabase/               # Clients browser / server / middleware
│   ├── types.ts                # Types partagés
│   └── utils.ts                # Helpers (dates, initiales, couleurs)
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql                # Données historiques du fichier Excel
├── scripts/
│   ├── extract_excel.py        # Parse l'Excel → data.json
│   ├── generate_seed.py        # data.json → seed.sql
│   ├── users-data.json         # Users extraits de l'Excel
│   └── seed-users.mjs          # Crée les users via Supabase admin API
├── middleware.ts               # Rafraîchit la session Supabase
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## 🧩 Modèle de données

- `profiles` — données utilisateur (lié à `auth.users`), rôle (`admin` ou `ba`), service.
- `projects` — catalogue, code court, couleur.
- `assignments` — affectations fixes BA ↔ projet (gérées par l'admin).
- `weekly_plans` — un plan par (user, semaine) avec statut `draft/submitted/validated`.
- `plan_projects` — répartition projets de la semaine avec allocation en %.
- `deliverables` — tâches/livrables (kanban 4 colonnes, priorités, échéance).
- `objectives` — OKRs personnels avec progression 0-100 %.
- `vacations` — demandes de congés avec workflow d'approbation.
- `activity_log` — audit léger (hook futur).

Toutes les tables sont protégées par **Row Level Security** :
- Les BAs voient/éditent uniquement leurs propres données.
- Les admins voient/éditent tout.
- Les projets et profils sont **lisibles** par tous les authentifiés (pour affichage des noms d'auteurs, intérims, etc.).

---

## 🔒 Sécurité

- La `SUPABASE_SERVICE_ROLE_KEY` n'est **jamais** exposée côté client. Elle sert uniquement aux Server Actions admin (`createUser`, `resetUserPassword`, etc.) dans `lib/actions/admin.ts`.
- Chaque Server Action admin vérifie `requireAdmin()` côté serveur avant toute opération privilégiée.
- Row Level Security forcée sur toutes les tables publiques, avec policies explicites.

---

## 🧪 Idées d'évolutions

- Notifications Slack/Email quand un planning est soumis ou qu'un congé est demandé.
- Export Excel/PDF du planning hebdo (bibliothèque ExcelJS côté serveur).
- Drag & drop réel du kanban (bibliothèque dnd-kit).
- Capacity planning sur plusieurs semaines (vue timeline).
- Intégration Jira/Linear pour auto-créer les livrables depuis les tickets.
- Templates récurrents (ex: standup hebdo, dailys à cocher).

---

## 📄 Licence

Projet privé — tous droits réservés.
