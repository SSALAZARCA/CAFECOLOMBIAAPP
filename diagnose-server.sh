#!/bin/bash

# 🔍 Script de Diagnóstico - Café Colombia App
# Verifica la configuración completa del servidor y Traefik

echo "🔍 DIAGNÓSTICO COMPLETO DEL SERVIDOR - CAFÉ COLOMBIA"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar archivos de configuración
echo "1. 📁 VERIFICANDO ARCHIVOS DE CONFIGURACIÓN"
echo "============================================"

files_to_check=(
    "docker-compose.yml"
    "docker-compose.traefik.yml"
    ".env.docker"
    "deploy-traefik.sh"
    "server/server.cjs"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        log_success "✅ $file existe"
        if [ "$file" == ".env.docker" ]; then
            echo "   Contenido de .env.docker:"
            cat .env.docker | grep -E "(DOMAIN|SSL_EMAIL|PORT)" || log_warning "   No se encontraron variables DOMAIN/SSL_EMAIL/PORT"
        fi
    else
        log_error "❌ $file NO EXISTE"
    fi
done

echo ""

# 2. Verificar puertos en configuraciones
echo "2. 🔌 VERIFICANDO CONFIGURACIÓN DE PUERTOS"
echo "=========================================="

log_info "Buscando referencias de puerto en archivos..."

# Verificar server.cjs
if [ -f "server/server.cjs" ]; then
    port_in_server=$(grep -n "PORT\|port\|3000\|3001" server/server.cjs)
    if [ ! -z "$port_in_server" ]; then
        echo "📄 server/server.cjs:"
        echo "$port_in_server"
    fi
fi

# Verificar docker-compose.traefik.yml
if [ -f "docker-compose.traefik.yml" ]; then
    echo ""
    echo "📄 docker-compose.traefik.yml - Referencias de puerto:"
    grep -n "3000\|3001" docker-compose.traefik.yml || log_info "No se encontraron referencias directas de puerto"
    
    echo ""
    echo "📄 Traefik labels en docker-compose.traefik.yml:"
    grep -n "traefik.http.services.*loadbalancer.server.port" docker-compose.traefik.yml || log_warning "No se encontraron labels de loadbalancer"
fi

echo ""

# 3. Verificar estado de Docker
echo "3. 🐳 VERIFICANDO ESTADO DE DOCKER"
echo "=================================="

if command -v docker &> /dev/null; then
    log_success "Docker está instalado"
    
    # Verificar contenedores en ejecución
    echo ""
    log_info "Contenedores en ejecución:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    log_info "Redes de Docker:"
    docker network ls | grep -E "(cafe|traefik)" || log_warning "No se encontraron redes específicas"
    
    echo ""
    log_info "Volúmenes de Docker:"
    docker volume ls | grep -E "(cafe|traefik)" || log_warning "No se encontraron volúmenes específicos"
    
else
    log_error "Docker NO está instalado"
fi

echo ""

# 4. Verificar conectividad
echo "4. 🌐 VERIFICANDO CONECTIVIDAD"
echo "=============================="

# Verificar puertos locales
log_info "Verificando puertos en uso:"
if command -v netstat &> /dev/null; then
    netstat -tlnp | grep -E ":80|:443|:3000|:3001|:8080" || log_info "No se encontraron puertos específicos en uso"
elif command -v ss &> /dev/null; then
    ss -tlnp | grep -E ":80|:443|:3000|:3001|:8080" || log_info "No se encontraron puertos específicos en uso"
else
    log_warning "netstat/ss no disponible para verificar puertos"
fi

echo ""

# 5. Verificar logs de Traefik
echo "5. 📋 VERIFICANDO LOGS DE TRAEFIK"
echo "================================="

if docker ps | grep -q traefik; then
    log_info "Últimos logs de Traefik:"
    docker logs traefik --tail 20 2>/dev/null || log_warning "No se pudieron obtener logs de Traefik"
else
    log_warning "Contenedor de Traefik no está ejecutándose"
fi

echo ""

# 6. Verificar logs de la API
echo "6. 📋 VERIFICANDO LOGS DE LA API"
echo "==============================="

api_container=$(docker ps --format "{{.Names}}" | grep -E "(api|cafe.*api)" | head -1)
if [ ! -z "$api_container" ]; then
    log_info "Últimos logs de $api_container:"
    docker logs "$api_container" --tail 20 2>/dev/null || log_warning "No se pudieron obtener logs de la API"
else
    log_warning "Contenedor de API no encontrado"
fi

echo ""

# 7. Verificar configuración de Traefik
echo "7. ⚙️  VERIFICANDO CONFIGURACIÓN DE TRAEFIK"
echo "=========================================="

if docker ps | grep -q traefik; then
    log_info "Configuración actual de Traefik:"
    docker exec traefik cat /etc/traefik/traefik.yml 2>/dev/null || log_warning "No se pudo acceder a la configuración de Traefik"
    
    echo ""
    log_info "Verificando API de Traefik (si está habilitada):"
    curl -s http://localhost:8080/api/rawdata 2>/dev/null | jq '.http.services' 2>/dev/null || log_warning "API de Traefik no accesible o jq no instalado"
else
    log_warning "Traefik no está ejecutándose"
fi

echo ""

# 8. Resumen y recomendaciones
echo "8. 📊 RESUMEN Y RECOMENDACIONES"
echo "==============================="

log_info "Diagnóstico completado. Revisa los resultados anteriores."
echo ""
log_warning "ACCIONES RECOMENDADAS:"
echo "1. Verificar que el puerto en server.cjs sea 3001"
echo "2. Verificar que las labels de Traefik apunten al puerto 3001"
echo "3. Reiniciar los servicios con: docker-compose down && docker-compose -f docker-compose.traefik.yml up -d"
echo "4. Verificar logs después del reinicio"

echo ""
echo "🔍 Diagnóstico completado - $(date)"