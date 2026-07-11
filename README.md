# ZOMA SARL — Système de Gestion des Dépôts

Application complète de gestion des dépôts de boissons pour ZOMA SARL (Cameroun).

## Structure du projet

```
ZommaApp/
├── server/          # Backend Node.js + Express + PostgreSQL
└── ZomaApp/         # Frontend Next.js 13 + TypeScript + Tailwind CSS
```

## Stack technique

### Backend (`/server`)
- **Node.js** + **Express** — API REST
- **PostgreSQL** — Base de données
- **JWT** — Authentification
- **bcryptjs** — Hachage des mots de passe

### Frontend (`/ZomaApp`)
- **Next.js 13** — Framework React
- **TypeScript** — Typage statique
- **Tailwind CSS** + **shadcn/ui** — Interface
- **Sonner** — Notifications toast

## Installation & démarrage

### 1. Prérequis
- Node.js ≥ 18
- PostgreSQL ≥ 14

### 2. Configuration backend
```bash
cd server
cp .env.example .env
# Remplir DATABASE_URL, JWT_SECRET, etc.
npm install
node scripts/init-database.js   # Créer les tables + données initiales
npm start                        # Démarrer sur le port 3001
```

### 3. Configuration frontend
```bash
cd ZomaApp
# Créer .env.local avec :
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm install
npm run dev                      # Démarrer sur le port 3000
```

## Comptes de démonstration

| Email               | Mot de passe | Rôle          |
|---------------------|-------------|---------------|
| admin@zoma.com      | password    | Admin Global  |
| depot1@zoma.com     | password    | Admin Dépôt   |
| vendeur@zoma.com    | password    | Vendeur       |
| livreur@zoma.com    | password    | Livreur       |

## Fonctionnalités

- 🔐 Authentification JWT avec rôles (admin_global, admin_depot, vendeur, livreur)
- 📦 Gestion produits, stocks, dépôts, fournisseurs
- 💰 Enregistrement et suivi des ventes
- 🚚 Gestion des livraisons fournisseurs
- 👥 Gestion des utilisateurs et livreurs
- 📊 Rapports & analyses avec export CSV
- 🌙 Mode sombre / clair
