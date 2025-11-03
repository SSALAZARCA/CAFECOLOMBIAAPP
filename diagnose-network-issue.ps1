# 🔍 DIAGNÓSTICO COMPLETO DE CONECTIVIDAD - CAFÉ COLOMBIA APP
# Script para identificar problemas de red entre frontend y backend

Write-Host "🔍 INICIANDO DIAGNÓSTICO DE CONECTIVIDAD" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Función para logs con colores
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Blue }

# 1. VERIFICAR BACKEND LOCAL
Write-Host "1. 🖥️  VERIFICANDO BACKEND LOCAL" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Backend responde en localhost:3001"
        $healthData = $response.Content | ConvertFrom-Json
        Write-Info "Status: $($healthData.status)"
        Write-Info "Environment: $($healthData.environment)"
        Write-Info "Version: $($healthData.version)"
    }
} catch {
    Write-Error "Backend NO responde en localhost:3001"
    Write-Error "Error: $($_.Exception.Message)"
}

Write-Host ""

# 2. VERIFICAR CONFIGURACIONES DE ENTORNO
Write-Host "2. ⚙️  VERIFICANDO CONFIGURACIONES" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

# Verificar .env.production
if (Test-Path ".env.production") {
    Write-Success "Archivo .env.production encontrado"
    $envContent = Get-Content ".env.production" | Where-Object { $_ -match "VITE_API_URL|CORS_ORIGIN|BACKEND_URL" }
    foreach ($line in $envContent) {
        Write-Info "  $line"
    }
} else {
    Write-Error "Archivo .env.production NO encontrado"
}

# Verificar api/.env.production
if (Test-Path "api/.env.production") {
    Write-Success "Archivo api/.env.production encontrado"
    $apiEnvContent = Get-Content "api/.env.production" | Where-Object { $_ -match "CORS_ORIGIN|PORT|HOST" }
    foreach ($line in $apiEnvContent) {
        Write-Info "  $line"
    }
} else {
    Write-Error "Archivo api/.env.production NO encontrado"
}

Write-Host ""

# 3. VERIFICAR PROCESOS ACTIVOS
Write-Host "3. 🔄 VERIFICANDO PROCESOS ACTIVOS" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

# Verificar si hay procesos Node.js corriendo
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Success "Procesos Node.js activos:"
    foreach ($proc in $nodeProcesses) {
        Write-Info "  PID: $($proc.Id) - Memoria: $([math]::Round($proc.WorkingSet64/1MB, 2)) MB"
    }
} else {
    Write-Warning "No se encontraron procesos Node.js activos"
}

# Verificar puertos en uso
Write-Info "Verificando puertos 3000 y 3001..."
try {
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    $port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
    
    if ($port3000) { Write-Success "Puerto 3000 está en uso" } else { Write-Warning "Puerto 3000 libre" }
    if ($port3001) { Write-Success "Puerto 3001 está en uso" } else { Write-Warning "Puerto 3001 libre" }
} catch {
    Write-Warning "No se pudo verificar el estado de los puertos"
}

Write-Host ""

# 4. PROBAR DIFERENTES ENDPOINTS
Write-Host "4. 🌐 PROBANDO ENDPOINTS DE API" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow

$endpoints = @(
    "http://localhost:3001/api/health",
    "http://localhost:3001/api/auth/status",
    "http://127.0.0.1:3001/api/health",
    "http://0.0.0.0:3001/api/health"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint -Method GET -TimeoutSec 5
        Write-Success "$endpoint - Status: $($response.StatusCode)"
    } catch {
        Write-Error "$endpoint - Error: $($_.Exception.Message)"
    }
}

Write-Host ""

# 5. VERIFICAR CONFIGURACIÓN DE DOCKER (si existe)
Write-Host "5. 🐳 VERIFICANDO CONFIGURACIÓN DOCKER" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow

if (Test-Path "docker-compose.yml") {
    Write-Success "docker-compose.yml encontrado"
    
    # Verificar si Docker está corriendo
    try {
        $dockerInfo = docker info 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker está corriendo"
            
            # Verificar contenedores activos
            $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
            if ($containers) {
                Write-Info "Contenedores activos:"
                Write-Host $containers
            } else {
                Write-Warning "No hay contenedores activos"
            }
        } else {
            Write-Warning "Docker no está corriendo o no está instalado"
        }
    } catch {
        Write-Warning "No se pudo verificar el estado de Docker"
    }
} else {
    Write-Info "No se encontró docker-compose.yml"
}

Write-Host ""

# 6. VERIFICAR LOGS DEL BACKEND
Write-Host "6. 📋 VERIFICANDO LOGS RECIENTES" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Buscar archivos de log
$logFiles = @("api/logs/*.log", "logs/*.log", "*.log") | ForEach-Object { Get-ChildItem $_ -ErrorAction SilentlyContinue }

if ($logFiles) {
    Write-Success "Archivos de log encontrados:"
    foreach ($log in $logFiles | Select-Object -First 3) {
        Write-Info "  $($log.FullName) - Modificado: $($log.LastWriteTime)"
        # Mostrar últimas 5 líneas del log
        $lastLines = Get-Content $log.FullName -Tail 5 -ErrorAction SilentlyContinue
        if ($lastLines) {
            foreach ($line in $lastLines) {
                Write-Host "    $line" -ForegroundColor Gray
            }
        }
        Write-Host ""
    }
} else {
    Write-Warning "No se encontraron archivos de log"
}

Write-Host ""

# 7. RECOMENDACIONES
Write-Host "7. 💡 RECOMENDACIONES" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow

Write-Info "Para solucionar el problema:"
Write-Info "1. Verificar que el backend esté corriendo en puerto 3001"
Write-Info "2. Comprobar que CORS_ORIGIN esté configurado correctamente"
Write-Info "3. Asegurar que las URLs en .env.production sean correctas"
Write-Info "4. Verificar que no haya conflictos de puertos"
Write-Info "5. Revisar logs del backend para errores específicos"

Write-Host ""
Write-Host "🔍 DIAGNÓSTICO COMPLETADO" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan