#!/bin/bash

# 🚀 SCRIPT DE DEPLOYMENT CON TRAEFIK - CAFÉ COLOMBIA APP
# Este script automatiza el deployment con Traefik para producción

set -e  # Salir si hay algún error

echo "🚀 Iniciando deployment con Traefik de Café Colombia App..."

# ========================================
# CONFIGURACIÓN
# ========================================
APP_NAME="Café Colombia App"
DOCKER_COMPOSE_FILE="docker-compose.traefik.yml"
ENV_FILE=".env.docker"

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

# Verificar que el archivo docker-compose.traefik.yml existe
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    log_error "El archivo $DOCKER_COMPOSE_FILE no existe."
fi

# Verificar que el archivo .env.docker existe
if [ ! -f "$ENV_FILE" ]; then
    log_error "El archivo $ENV_FILE no existe. Cópialo desde .env.example y configúralo."
fi

# Verificar variables críticas para Traefik
log_info "Verificando configuración de Traefik..."
if ! grep -q "DOMAIN=" "$ENV_FILE" || [ -z "$(grep DOMAIN $ENV_FILE | cut -d'=' -f2)" ]; then
    log_error "La variable DOMAIN no está configurada en $ENV_FILE"
fi

if ! grep -q "SSL_EMAIL=" "$ENV_FILE" || [ -z "$(grep SSL_EMAIL $ENV_FILE | cut -d'=' -f2)" ]; then
    log_error "La variable SSL_EMAIL no está configurada en $ENV_FILE"
fi

DOMAIN=$(grep DOMAIN $ENV_FILE | cut -d'=' -f2)
SSL_EMAIL=$(grep SSL_EMAIL $ENV_FILE | cut -d'=' -f2)

log_success "Configuración verificada:"
log_info "  • Dominio: $DOMAIN"
log_info "  • Email SSL: $SSL_EMAIL"

# ========================================
# DETENER SERVICIOS EXISTENTES
# ========================================
log_info "Deteniendo servicios existentes..."
docker-compose -f "$DOCKER_COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans || true
log_success "Servicios detenidos"

# ========================================
# LIMPIAR RECURSOS DOCKER
# ========================================
log_info "Limpiando recursos Docker no utilizados..."
docker system prune -f
log_success "Limpieza completada"

# ========================================
# CONSTRUIR E INICIAR SERVICIOS
# ========================================
log_info "Construyendo e iniciando servicios con Traefik..."
docker-compose -f "$DOCKER_COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

log_success "Servicios iniciados"

# ========================================
# VERIFICAR ESTADO DE LOS SERVICIOS
# ========================================
log_info "Verificando estado de los servicios..."
sleep 10

# Verificar que los contenedores estén corriendo
if ! docker-compose -f "$DOCKER_COMPOSE_FILE" --env-file "$ENV_FILE" ps | grep -q "Up"; then
    log_error "Algunos servicios no están corriendo correctamente"
fi

log_success "Todos los servicios están corriendo"

# ========================================
# VERIFICAR CONECTIVIDAD
# ========================================
log_info "Verificando conectividad..."

# Verificar health check local
if curl -f http://localhost/health > /dev/null 2>&1; then
    log_success "Health check local: OK"
else
    log_warning "Health check local: FALLO - Verificar configuración"
fi

# ========================================
# MOSTRAR INFORMACIÓN FINAL
# ========================================
echo ""
echo "🎉 ¡Deployment con Traefik completado exitosamente!"
echo ""
echo "📋 Información del deployment:"
echo "   • Aplicación: $APP_NAME"
echo "   • Configuración: Traefik Proxy con SSL automático"
echo "   • URL: https://$DOMAIN"
echo "   • API: https://$DOMAIN/api"
echo "   • Health Check: http://localhost/health"
echo "   • Traefik Dashboard: http://localhost:8080"
echo ""
echo "📊 Estado de los contenedores:"
docker-compose -f "$DOCKER_COMPOSE_FILE" --env-file "$ENV_FILE" ps
echo ""
echo "🔧 Información importante:"
echo "   • El certificado SSL se generará automáticamente"
echo "   • Puede tomar unos minutos en la primera ejecución"
echo "   • Dashboard de Traefik disponible en: http://localhost:8080"
echo "   • Los logs están disponibles con: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
echo ""
echo "🌐 URLs de acceso:"
echo "   • Aplicación: https://$DOMAIN"
echo "   • API: https://$DOMAIN/api"
echo "   • Health: https://$DOMAIN/health"
echo ""
echo "📝 Para ver los logs:"
echo "   docker-compose -f $DOCKER_COMPOSE_FILE --env-file $ENV_FILE logs -f"
echo ""
echo "🛑 Para detener:"
echo "   docker-compose -f $DOCKER_COMPOSE_FILE --env-file $ENV_FILE down"