# =============================================================================
# ZOMA SARL — Script de restauration (Windows PowerShell)
# =============================================================================
# Usage : .\server\scripts\restore_db.ps1
#
# Paramètres optionnels :
#   -DbHost     (défaut: localhost)
#   -DbPort     (défaut: 5432)
#   -DbName     (défaut: zommadb)
#   -DbUser     (défaut: postgres)
#   -DbPassword (défaut: demandé interactivement)
# =============================================================================

param(
    [string]$DbHost     = "localhost",
    [int]   $DbPort     = 5432,
    [string]$DbName     = "zommadb",
    [string]$DbUser     = "postgres",
    [string]$DbPassword = ""
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DumpFile  = Join-Path $ScriptDir "zommadb_dump.sql"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ZOMA SARL — Restauration base de données  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Hôte        : ${DbHost}:${DbPort}"
Write-Host "  Base        : $DbName"
Write-Host "  Utilisateur : $DbUser"
Write-Host ""

# Vérifier que le fichier dump existe
if (-not (Test-Path $DumpFile)) {
    Write-Host "❌ Fichier introuvable : $DumpFile" -ForegroundColor Red
    exit 1
}

# Demander le mot de passe si non fourni
if ([string]::IsNullOrEmpty($DbPassword)) {
    $SecurePwd = Read-Host "Mot de passe PostgreSQL pour '$DbUser'" -AsSecureString
    $DbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePwd)
    )
}

$env:PGPASSWORD = $DbPassword

# Tester la connexion
Write-Host "🔌 Test de connexion..." -ForegroundColor Yellow
$testResult = psql -h $DbHost -p $DbPort -U $DbUser -c "\q" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Impossible de se connecter à PostgreSQL" -ForegroundColor Red
    Write-Host "   Vérifiez l'hôte, le port, l'utilisateur et le mot de passe."
    exit 1
}
Write-Host "✅ Connexion OK" -ForegroundColor Green

# Créer la base si inexistante
Write-Host "🗄️  Création de la base '$DbName' (si inexistante)..." -ForegroundColor Yellow
$createResult = psql -h $DbHost -p $DbPort -U $DbUser -c "CREATE DATABASE `"$DbName`" ENCODING 'UTF8';" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base créée" -ForegroundColor Green
} else {
    Write-Host "ℹ️  La base existe déjà, on continue" -ForegroundColor Gray
}

# Restaurer le dump
Write-Host "📥 Restauration du dump..." -ForegroundColor Yellow
psql -h $DbHost -p $DbPort -U $DbUser -d $DbName --set ON_ERROR_STOP=1 -f $DumpFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Restauration terminée avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Comptes disponibles (mot de passe : password) :"
    Write-Host "   ┌────────────────────────┬──────────────────────┐"
    Write-Host "   │ admin@zoma.com         │ Admin Global         │"
    Write-Host "   │ depot1@zoma.com        │ Admin Dépôt Yaoundé  │"
    Write-Host "   │ depot2@zoma.com        │ Admin Dépôt Douala   │"
    Write-Host "   │ vendeur@zoma.com       │ Vendeur              │"
    Write-Host "   │ livreur@zoma.com       │ Livreur              │"
    Write-Host "   └────────────────────────┴──────────────────────┘"
    Write-Host ""
    Write-Host "   Pour démarrer le backend :"
    Write-Host "   cd server ; npm install ; npm start"
    Write-Host ""
} else {
    Write-Host "❌ Erreur lors de la restauration" -ForegroundColor Red
    exit 1
}
