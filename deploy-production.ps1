# 🚀 SCRIPT DE DEPLOYMENT PARA PRODUCCIÓN - CAFÉ COLOMBIA APP (PowerShell)
# Este script automatiza el deployment completo en el servidor Windows

param(
    [switch]$SkipBuild = $false,
    [switch]$SkipTests = $false,
    [string]$EnvFile = ".env.docker"
)

# Configuración
$APP_NAME = "Café Colombia App"
$DOCKER_COMPOSE_FILE = "docker-compose.yml"

# Funciones auxiliares
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
    exit 1
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Configurar ErrorActionPreference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando deployment de Café Colombia App..." -ForegroundColor Magenta

# ========================================
# VERIFICACIONES PREVIAS
# ========================================
Write-Info "Verificando requisitos previos..."

# Verificar Docker
try {
    docker --version | Out-Null
    Write-Success "Docker está instalado"
} catch {
    Write-Error "Docker no está instalado. Por favor instala Docker Desktop primero."
}

# Verificar Docker Compose
try {
    docker-compose --version | Out-Null
    Write-Success "Docker Compose está instalado"
} catch {
    Write-Error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
}

# Verificar Node.js
try {
    node --version | Out-Null
    Write-Success "Node.js está instalado"
} catch {
    Write-Error "Node.js no está instalado. Por favor instala Node.js primero."
}

# Verificar npm
try {
    npm --version | Out-Null
    Write-Success "npm está instalado"
} catch {
    Write-Error "npm no está instalado. Por favor instala npm primero."
}

# ========================================
# VERIFICAR ARCHIVOS DE CONFIGURACIÓN
# ========================================
Write-Info "Verificando archivos de configuración..."

if (-not (Test-Path $EnvFile)) {
    Write-Error "Archivo $EnvFile no encontrado. Por favor copia .env.example a $EnvFile y configúralo."
}

if (-not (Test-Path $DOCKER_COMPOSE_FILE)) {
    Write-Error "Archivo $DOCKER_COMPOSE_FILE no encontrado."
}

Write-Success "Archivos de configuración encontrados"

# ========================================
# CONSTRUIR FRONTEND
# ========================================
if (-not $SkipBuild) {
    Write-Info "Construyendo frontend para producción..."

    # Instalar dependencias si no existen
    if (-not (Test-Path "node_modules")) {
        Write-Info "Instalando dependencias del frontend..."
        npm ci
    }

    # Construir el frontend
    Write-Info "Ejecutando build del frontend..."
    npm run build

    # Verificar que el directorio dist se haya creado
    if (-not (Test-Path "dist")) {
        Write-Error "El build del frontend falló. Directorio 'dist' no encontrado."
    }

    Write-Success "Frontend construido exitosamente"
} else {
    Write-Warning "Saltando build del frontend (--SkipBuild especificado)"
}

# ========================================
# DETENER SERVICIOS EXISTENTES
# ========================================
Write-Info "Deteniendo servicios existentes..."

try {
    docker-compose --env-file $EnvFile down --remove-orphans
} catch {
    Write-Warning "No se pudieron detener los servicios existentes (puede que no estuvieran corriendo)"
}

Write-Success "Servicios detenidos"

# ========================================
# CONSTRUIR IMÁGENES
# ========================================
Write-Info "Construyendo imágenes de Docker..."

docker-compose --env-file $EnvFile build --no-cache

Write-Success "Imágenes construidas"

# ========================================
# INICIAR SERVICIOS
# ========================================
Write-Info "Iniciando servicios..."

docker-compose --env-file $EnvFile up -d

Write-Success "Servicios iniciados"

# ========================================
# VERIFICAR ESTADO DE LOS SERVICIOS
# ========================================
Write-Info "Verificando estado de los servicios..."

Start-Sleep -Seconds 10  # Esperar a que los servicios se inicien

# Verificar que los contenedores estén corriendo
$containers = docker-compose --env-file $EnvFile ps
if ($containers -notmatch "Up") {
    Write-Error "Algunos servicios no están corriendo correctamente"
}

Write-Success "Todos los servicios están corriendo"

# ========================================
# VERIFICAR CONECTIVIDAD
# ========================================
Write-Info "Verificando conectividad..."

# Verificar que nginx responda
try {
    $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Nginx está respondiendo correctamente"
    }
} catch {
    Write-Warning "Nginx no está respondiendo en /health"
}

# Verificar que la API responda
try {
    $response = Invoke-WebRequest -Uri "http://localhost/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "API está respondiendo correctamente"
    }
} catch {
    Write-Warning "API no está respondiendo en /api/health"
}

# ========================================
# MOSTRAR INFORMACIÓN FINAL
# ========================================
Write-Host ""
Write-Host "🎉 ¡Deployment completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Información del deployment:" -ForegroundColor Cyan
Write-Host "   • Aplicación: $APP_NAME"
Write-Host "   • URL: http://localhost"
Write-Host "   • API: http://localhost/api"
Write-Host "   • Health Check: http://localhost/health"
Write-Host ""
Write-Host "📊 Estado de los contenedores:" -ForegroundColor Cyan
docker-compose --env-file $EnvFile ps
Write-Host ""
Write-Host "📝 Para ver los logs:" -ForegroundColor Yellow
Write-Host "   docker-compose --env-file $EnvFile logs -f"
Write-Host ""
Write-Host "🛑 Para detener la aplicación:" -ForegroundColor Yellow
Write-Host "   docker-compose --env-file $EnvFile down"
Write-Host ""

Write-Success "Deployment finalizado"