#!/bin/bash

# 🚀 SCRIPT DE DEPLOYMENT PARA PRODUCCIÓN - CAFÉ COLOMBIA APP
# Este script automatiza el deployment completo en el servidor

set -e  # Salir si hay algún error

echo "🚀 Iniciando deployment de Café Colombia App..."

# ========================================
# CONFIGURACIÓN
# ========================================
APP_NAME="Café Colombia App"
DOCKER_COMPOSE_FILE="docker-compose.yml"
TRAEFIK_COMPOSE_FILE="docker-compose.traefik.yml"
ENV_FILE=".env.docker"

# Detectar si se debe usar Traefik
USE_TRAEFIK=false
if [ -f "$TRAEFIK_COMPOSE_FILE" ] && [ "$1" = "--traefik" ]; then
    USE_TRAEFIK=true
    DOCKER_COMPOSE_FILE="$TRAEFIK_COMPOSE_FILE"
    log_info "Usando configuración con Traefik: $TRAEFIK_COMPOSE_FILE"
fi

# ========================================
# FUNCIONES AUXILIARES
# ========================================
log_info() {
    echo "ℹ️  $1"
}

log_success() {
    echo "✅ $1"
}

log_error() {
    echo "❌ $1"
    exit 1
}

log_warning() {
    echo "⚠️  $1"
}

# ========================================
# VERIFICACIONES PREVIAS
# ========================================
log_info "Verificando requisitos previos..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado. Por favor instala Docker primero."
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
fi

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    log_error "Node.js no está instalado. Por favor instala Node.js primero."
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    log_error "npm no está instalado. Por favor instala npm primero."
fi

log_success "Todos los requisitos están instalados"

# ========================================
# VERIFICAR ARCHIVOS DE CONFIGURACIÓN
# ========================================
log_info "Verificando archivos de configuración..."

if [ ! -f "$ENV_FILE" ]; then
    log_error "Archivo $ENV_FILE no encontrado. Por favor copia .env.example a $ENV_FILE y configúralo."
fi

if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    log_error "Archivo $DOCKER_COMPOSE_FILE no encontrado."
fi

log_success "Archivos de configuración encontrados"

# ========================================
# CONSTRUIR FRONTEND
# ========================================
log_info "Construyendo frontend para producción..."

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependencias del frontend..."
    npm ci
fi

# Construir el frontend
log_info "Ejecutando build del frontend..."
npm run build

# Verificar que el directorio dist se haya creado
if [ ! -d "dist" ]; then
    log_error "El build del frontend falló. Directorio 'dist' no encontrado."
fi

log_success "Frontend construido exitosamente"

# ========================================
# DETENER SERVICIOS EXISTENTES
# ========================================
log_info "Deteniendo servicios existentes..."

docker-compose --env-file "$ENV_FILE" down --remove-orphans || true

log_success "Servicios detenidos"

# ========================================
# CONSTRUIR IMÁGENES
# ========================================
log_info "Construyendo imágenes de Docker..."

docker-compose --env-file "$ENV_FILE" build --no-cache

log_success "Imágenes construidas"

# ========================================
# INICIAR SERVICIOS
# ========================================
log_info "Iniciando servicios..."

docker-compose --env-file "$ENV_FILE" up -d

log_success "Servicios iniciados"

# ========================================
# VERIFICAR ESTADO DE LOS SERVICIOS
# ========================================
log_info "Verificando estado de los servicios..."

sleep 10  # Esperar a que los servicios se inicien

# Verificar que los contenedores estén corriendo
if ! docker-compose --env-file "$ENV_FILE" ps | grep -q "Up"; then
    log_error "Algunos servicios no están corriendo correctamente"
fi

log_success "Todos los servicios están corriendo"

# ========================================
# VERIFICAR CONECTIVIDAD
# ========================================
log_info "Verificando conectividad..."

# Verificar que nginx responda
if curl -f http://localhost/health > /dev/null 2>&1; then
    log_success "Nginx está respondiendo correctamente"
else
    log_warning "Nginx no está respondiendo en /health"
fi

# Verificar que la API responda
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    log_success "API está respondiendo correctamente"
else
    log_warning "API no está respondiendo en /api/health"
fi

# ========================================
# MOSTRAR INFORMACIÓN FINAL
# ========================================
echo ""
echo "🎉 ¡Deployment completado exitosamente!"
echo ""
echo "📋 Información del deployment:"
echo "   • Aplicación: $APP_NAME"
if [ "$USE_TRAEFIK" = true ]; then
    echo "   • Configuración: Traefik Proxy con SSL automático"
    echo "   • URL: https://$(grep DOMAIN $ENV_FILE | cut -d'=' -f2)"
    echo "   • API: https://$(grep DOMAIN $ENV_FILE | cut -d'=' -f2)/api"
    echo "   • Traefik Dashboard: http://localhost:8080"
else
    echo "   • URL: http://localhost"
    echo "   • API: http://localhost/api"
fi
echo "   • Health Check: http://localhost/health"
echo ""
echo "📊 Estado de los contenedores:"
docker-compose -f "$DOCKER_COMPOSE_FILE" --env-file "$ENV_FILE" ps
echo ""
if [ "$USE_TRAEFIK" = true ]; then
    echo "🔧 Para usar Traefik:"
    echo "   • Asegúrate de configurar DOMAIN y SSL_EMAIL en $ENV_FILE"
    echo "   • El certificado SSL se generará automáticamente"
    echo "   • Dashboard de Traefik disponible en: http://localhost:8080"
else
    echo "💡 Para usar con Traefik (recomendado para producción):"
    echo "   ./deploy-production.sh --traefik"
fi
echo ""
echo "📝 Para ver los logs:"
echo "   docker-compose --env-file $ENV_FILE logs -f"
echo ""
echo "🛑 Para detener la aplicación:"
echo "   docker-compose --env-file $ENV_FILE down"
echo ""

log_success "Deployment finalizado"