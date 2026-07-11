# ZOMA SARL - Système de Gestion des Dépôts de Boissons

## 📋 Description

ZOMA SARL est une application web complète de gestion des dépôts de boissons développée avec Next.js 14 et Node.js. Le système permet de gérer efficacement les opérations d'un réseau de dépôts de boissons avec une interface moderne et responsive.

## 🚀 Fonctionnalités Principales

### 🔐 Système d'Authentification
- Connexion sécurisée avec gestion des rôles
- 4 types d'utilisateurs : Admin Global, Admin Dépôt, Vendeur, Livreur
- Sessions persistantes avec JWT

### 📊 Tableaux de Bord Personnalisés
- **Admin Global** : Vue d'ensemble de tous les dépôts
- **Admin Dépôt** : Gestion d'un dépôt spécifique
- **Vendeur** : Suivi des ventes personnelles
- **Livreur** : Gestion des tâches de livraison

### 🏪 Gestion des Dépôts
- CRUD complet des dépôts
- Attribution d'administrateurs locaux
- Suivi du statut (actif/inactif)

### 📦 Gestion des Produits
- Catalogue complet des produits
- Gestion des prix d'achat et de vente
- Seuils de stock configurables
- Association avec les fournisseurs

### 🚚 Gestion des Fournisseurs
- Base de données des fournisseurs
- Informations de contact complètes
- Suivi des livraisons par fournisseur

### 📈 Gestion des Stocks
- Suivi en temps réel des niveaux de stock
- Alertes automatiques pour stock faible
- Historique des mouvements
- Valorisation des stocks

### 💰 Gestion des Ventes
- Enregistrement des ventes
- Historique détaillé
- Statistiques par vendeur et période
- Calculs automatiques des totaux

### 🚛 Gestion des Livraisons
- Planification des livraisons fournisseurs
- Affectation des livreurs
- Suivi du statut (en attente → en cours → terminée)
- Gestion multi-produits

### 👥 Gestion des Utilisateurs
- Création et gestion des comptes
- Attribution des rôles et permissions
- Association aux dépôts
- Activation/désactivation des comptes

### 🔄 Transferts Inter-Dépôts
- Demandes de transfert entre dépôts
- Workflow d'approbation
- Suivi des mouvements de stock

### 📋 Gestion des Retours
- Types de retours (défectueux, expiré, client, surstock)
- Workflow d'approbation
- Calcul des remboursements

### 📊 Rapports et Analyses
- Rapports de ventes détaillés
- Analyses de stock
- Rapports de livraisons
- **Fonction d'impression** pour tous les rapports
- Export de données

## 🛠️ Technologies Utilisées

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **shadcn/ui** - Composants UI modernes
- **Lucide React** - Icônes
- **React Hook Form** - Gestion des formulaires

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification
- **bcryptjs** - Hachage des mots de passe

### Sécurité
- **Helmet** - Sécurisation des en-têtes HTTP
- **CORS** - Gestion des origines croisées
- **Rate Limiting** - Protection contre les attaques
- **Validation des données** - Côté client et serveur

## 📁 Structure du Projet

```
zoma-depot-management/
├── app/                    # Pages Next.js (App Router)
├── components/            # Composants React réutilisables
│   ├── auth/             # Composants d'authentification
│   ├── dashboard/        # Tableaux de bord
│   ├── layout/           # Composants de mise en page
│   ├── ui/               # Composants UI de base
│   └── [modules]/        # Modules métier
├── data/                 # Fichiers JSON de données statiques
├── lib/                  # Utilitaires et services
│   └── services/         # Services API
├── server/               # Backend Node.js
│   ├── config/           # Configuration base de données
│   ├── routes/           # Routes API
│   └── scripts/          # Scripts d'initialisation
└── public/               # Assets statiques
```

## 🚀 Installation et Configuration

### Prérequis
- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

### 1. Cloner le Projet
```bash
git clone <repository-url>
cd zoma-depot-management
```

### 2. Installation des Dépendances

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd server
npm install
```

### 3. Configuration de la Base de Données

#### Variables d'Environnement Backend
Créer un fichier `.env` dans le dossier `server/` :
```env
DATABASE_URL=postgresql://postgres:POhhoYgfLWNwkMdpIwKkVAwkpEqRqJwU@shuttle.proxy.rlwy.net:24405/railway
PORT=3001
NODE_ENV=development
JWT_SECRET=zoma_sarl_jwt_secret_key_2024
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
```

#### Initialisation de la Base de Données
```bash
cd server
npm run init-db
```

Cette commande va :
- Créer toutes les tables nécessaires
- Insérer des données de démonstration
- Configurer les index pour les performances

### 4. Variables d'Environnement Frontend
Créer un fichier `.env.local` à la racine :
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🏃‍♂️ Démarrage de l'Application

### Mode Développement

#### 1. Démarrer le Backend
```bash
cd server
npm run dev
```
Le backend sera accessible sur `http://localhost:3001`

#### 2. Démarrer le Frontend
```bash
npm run dev
```
Le frontend sera accessible sur `http://localhost:3000`

### Mode Production

#### 1. Build du Frontend
```bash
npm run build
```

#### 2. Démarrage du Backend
```bash
cd server
npm start
```

## 👤 Comptes de Démonstration

| Rôle | Email | Mot de passe | Description |
|------|-------|--------------|-------------|
| Admin Global | admin@zoma.com | password | Accès complet à tous les modules |
| Admin Dépôt | depot1@zoma.com | password | Gestion du Dépôt Central Yaoundé |
| Vendeur | vendeur@zoma.com | password | Ventes et retours |
| Livreur | livreur@zoma.com | password | Tâches de livraison |

## 🔄 Architecture des Services

### Système Hybride Backend/JSON
L'application utilise un système intelligent qui :
1. **Tente de se connecter au backend** PostgreSQL
2. **Bascule automatiquement** vers les fichiers JSON si le backend n'est pas disponible
3. **Maintient la même interface** utilisateur dans les deux cas

### Services API
- `ApiService` : Gestion des appels API avec fallback JSON
- `DataService` : Interface unifiée pour toutes les opérations CRUD
- Gestion automatique des erreurs et reconnexion

## 📊 Base de Données

### Tables Principales
- `users` - Utilisateurs et authentification
- `depots` - Dépôts de stockage
- `fournisseurs` - Fournisseurs de produits
- `products` - Catalogue des produits
- `stocks` - Niveaux de stock par dépôt
- `sales` - Historique des ventes
- `livreurs` - Équipe de livraison
- `livraisons` - Livraisons fournisseurs
- `livraison_items` - Détails des livraisons

### Sécurité Base de Données
- Contraintes de clés étrangères
- Index optimisés pour les performances
- Validation des types de données
- Gestion des transactions

## 🎨 Design et UX

### Système de Design
- **Couleur principale** : Orange (#EA580C) et ses nuances
- **Typographie** : Inter avec hiérarchie claire
- **Espacement** : Système 8px cohérent
- **Animations** : Micro-interactions subtiles

### Responsive Design
- **Mobile First** : Navigation hamburger sur petits écrans
- **Breakpoints** : sm, md, lg, xl
- **Composants adaptatifs** : Tableaux, cartes, formulaires

### Accessibilité
- Contraste des couleurs conforme WCAG
- Navigation au clavier
- Textes alternatifs pour les icônes
- Focus visible

## 📱 Fonctionnalités Mobiles

### Navigation Mobile
- Menu hamburger avec sidebar
- Gestion tactile optimisée
- Composants adaptés aux petits écrans

### Performance Mobile
- Lazy loading des composants
- Optimisation des images
- Bundle splitting automatique

## 🔒 Sécurité

### Authentification
- JWT avec expiration configurable
- Hachage bcrypt pour les mots de passe
- Sessions sécurisées

### Protection API
- Rate limiting (100 req/15min)
- Validation des entrées
- Gestion des erreurs sécurisée
- Headers de sécurité (Helmet)

### Permissions
- Contrôle d'accès basé sur les rôles (RBAC)
- Filtrage des données par dépôt
- Validation côté client et serveur

## 📈 Performance

### Optimisations Frontend
- Code splitting automatique (Next.js)
- Lazy loading des composants
- Optimisation des images
- Cache des requêtes API

### Optimisations Backend
- Index de base de données optimisés
- Requêtes SQL efficaces
- Gestion des connexions pool
- Compression des réponses

## 🧪 Tests et Qualité

### Validation des Données
- Validation côté client (React Hook Form + Zod)
- Validation côté serveur (Express validators)
- Gestion des erreurs centralisée

### Monitoring
- Logs structurés
- Health checks automatiques
- Métriques de performance

## 🚀 Déploiement

### Environnements
- **Développement** : Local avec hot reload
- **Production** : Build optimisé avec cache

### Variables d'Environnement
Toutes les configurations sensibles sont externalisées dans des variables d'environnement.

## 📚 Documentation API

### Endpoints Principaux
- `GET /api/health` - Vérification de l'état du serveur
- `POST /api/auth/login` - Authentification
- `GET /api/depots` - Liste des dépôts
- `GET /api/products` - Catalogue des produits
- `GET /api/stocks` - État des stocks
- `POST /api/sales` - Enregistrement des ventes

### Format des Réponses
```json
{
  "data": [...],
  "status": "success",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## 🤝 Contribution

### Standards de Code
- TypeScript strict
- ESLint + Prettier
- Conventions de nommage cohérentes
- Documentation des fonctions complexes

### Git Workflow
- Branches feature pour les nouvelles fonctionnalités
- Pull requests avec review
- Tests avant merge

## 📞 Support

### Contacts
- **Développement** : Équipe technique ZOMA SARL
- **Support** : support@zoma.cm
- **Documentation** : Voir README et commentaires de code

### Résolution de Problèmes
1. Vérifier les logs du serveur
2. Contrôler la connexion base de données
3. Valider les variables d'environnement
4. Consulter la documentation API

## 📄 Licence

Ce projet est la propriété de ZOMA SARL. Tous droits réservés.

---

**ZOMA SARL** - Système de Gestion des Dépôts de Boissons
Version 1.0.0 - 2025