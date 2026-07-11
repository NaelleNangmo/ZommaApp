#!/bin/bash
# =============================================================================
# ZOMA SARL — Script de restauration de la base de données
# =============================================================================
# Usage : bash server/scripts/restore_db.sh
#
# Variables d'environnement acceptées :
#   DB_HOST     (défaut: localhost)
#   DB_PORT     (défaut: 5432)
#   DB_NAME     (défaut: zommadb)
#   DB_USER     (défaut: postgres)
#   DB_PASSWORD (défaut: demandé interactivement)
# =============================================================================

set -e

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-zommadb}"
DB_USER="${DB_USER:-postgres}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DUMP_FILE="$SCRIPT_DIR/zommadb_dump.sql"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   ZOMA SARL — Restauration base de données  ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Hôte     : $DB_HOST:$DB_PORT"
echo "  Base     : $DB_NAME"
echo "  Utilisateur : $DB_USER"
echo ""

# Vérifier que le fichier dump existe
if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Fichier introuvable : $DUMP_FILE"
    exit 1
fi

# Demander le mot de passe si non défini
if [ -z "$DB_PASSWORD" ]; then
    read -s -p "Mot de passe PostgreSQL pour '$DB_USER': " DB_PASSWORD
    echo ""
fi

export PGPASSWORD="$DB_PASSWORD"

# Tester la connexion
echo "🔌 Test de connexion..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "\q" 2>/dev/null; then
    echo "❌ Impossible de se connecter à PostgreSQL"
    echo "   Vérifiez l'hôte, le port, l'utilisateur et le mot de passe."
    exit 1
fi
echo "✅ Connexion OK"

# Créer la base si elle n'existe pas
echo "🗄️  Création de la base '$DB_NAME' (si inexistante)..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
    -c "CREATE DATABASE \"$DB_NAME\" ENCODING 'UTF8';" 2>/dev/null \
    && echo "✅ Base créée" \
    || echo "ℹ️  La base existe déjà, on continue"

# Restaurer le dump
echo "📥 Restauration du dump..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --set ON_ERROR_STOP=1 \
    -f "$DUMP_FILE"

echo ""
echo "✅ Restauration terminée avec succès !"
echo ""
echo "   Comptes disponibles (mot de passe : password) :"
echo "   ┌────────────────────────┬──────────────────────┐"
echo "   │ admin@zoma.com         │ Admin Global         │"
echo "   │ depot1@zoma.com        │ Admin Dépôt Yaoundé  │"
echo "   │ depot2@zoma.com        │ Admin Dépôt Douala   │"
echo "   │ vendeur@zoma.com       │ Vendeur              │"
echo "   │ livreur@zoma.com       │ Livreur              │"
echo "   └────────────────────────┴──────────────────────┘"
echo ""
echo "   Pour démarrer le backend :"
echo "   cd server && npm install && npm start"
echo ""
