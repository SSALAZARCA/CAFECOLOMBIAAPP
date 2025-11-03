# 🚀 Deployment con Traefik - Café Colombia App

## 📋 Descripción

Esta guía describe cómo desplegar la aplicación Café Colombia utilizando Traefik como reverse proxy con SSL automático mediante Let's Encrypt.

## 🔧 Prerrequisitos

- **Docker** y **Docker Compose** instalados
- **Dominio** configurado apuntando al servidor
- **Puertos** 80, 443 y 8080 disponibles
- **Email válido** para certificados SSL

## ⚙️ Configuración

### 1. Variables de Entorno

Configura el archivo `.env.docker` con tus datos:

```bash
# Dominio principal
DOMAIN=tu-dominio.com

# Email para certificados SSL
SSL_EMAIL=tu-email@ejemplo.com

# Base de datos
DB_HOST=mysql
DB_PORT=3306
DB_USER=cafe_user
DB_PASSWORD=tu_password_seguro
DB_NAME=cafe_colombia

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# Configuración de la aplicación
NODE_ENV=production
PORT=3001
```

### 2. Configuración DNS

Asegúrate de que tu dominio apunte al servidor:

```bash
# Verificar DNS
nslookup tu-dominio.com
dig tu-dominio.com
```

## 🚀 Despliegue

### Opción 1: Script Automático (Recomendado)

```bash
# Hacer ejecutable
chmod +x deploy-traefik.sh

# Ejecutar despliegue
./deploy-traefik.sh
```

### Opción 2: Script de Corrección Completa

Si tienes problemas con "Bad Gateway":

```bash
# Hacer ejecutable
chmod +x fix-bad-gateway.sh

# Ejecutar corrección completa
./fix-bad-gateway.sh
```

### Opción 3: Manual

```bash
# 1. Construir imágenes
docker-compose -f docker-compose.traefik.yml build

# 2. Iniciar servicios
docker-compose -f docker-compose.traefik.yml up -d

# 3. Verificar estado
docker-compose -f docker-compose.traefik.yml ps
```

## 🏗️ Servicios Incluidos

### 🔀 Traefik (Reverse Proxy)
- **Puerto**: 80, 443, 8080
- **Dashboard**: http://localhost:8080
- **SSL**: Automático con Let's Encrypt
- **Funciones**: Routing, SSL, Load Balancing

### 🖥️ API (Backend)
- **Puerto interno**: 3001
- **Endpoint**: `/api/*`
- **Health check**: `/api/health`
- **Base de datos**: MySQL + Redis

### 🌐 Nginx (Frontend)
- **Puerto interno**: 80
- **Función**: Servir archivos estáticos
- **Endpoint**: `/` (raíz)

### 🗄️ MySQL (Base de Datos)
- **Puerto**: 3306
- **Volumen persistente**: `mysql_data`
- **Configuración**: UTF8MB4, timezone UTC

### 🔄 Redis (Cache)
- **Puerto**: 6379
- **Volumen persistente**: `redis_data`
- **Función**: Cache y sesiones

## 🌍 URLs de Acceso

Después del despliegue exitoso:

- **Sitio web**: `https://tu-dominio.com`
- **API**: `https://tu-dominio.com/api/health`
- **Dashboard Traefik**: `http://localhost:8080`

## 📊 Monitoreo

### Verificar Estado de Servicios

```bash
# Estado general
docker-compose -f docker-compose.traefik.yml ps

# Logs en tiempo real
docker-compose -f docker-compose.traefik.yml logs -f

# Logs específicos
docker logs traefik
docker logs cafe-api
docker logs cafe-nginx
```

### Health Checks

```bash
# API directa
curl http://localhost:3001/api/health

# A través de Traefik
curl https://tu-dominio.com/api/health

# Dashboard Traefik
curl http://localhost:8080
```

## 🔧 Troubleshooting

### Problema: Bad Gateway (502)

1. **Verificar configuración de puertos**:
   ```bash
   ./diagnose-server.sh
   ```

2. **Ejecutar corrección completa**:
   ```bash
   ./fix-bad-gateway.sh
   ```

3. **Verificar logs**:
   ```bash
   docker logs traefik --tail 50
   docker logs cafe-api --tail 50
   ```

### Problema: Certificados SSL

1. **Verificar email y dominio** en `.env.docker`
2. **Esperar** 2-5 minutos para generación automática
3. **Verificar logs** de Traefik:
   ```bash
   docker logs traefik | grep -i "certificate"
   ```

### Problema: Servicios no inician

1. **Verificar puertos** disponibles:
   ```bash
   netstat -tlnp | grep -E ":80|:443|:8080"
   ```

2. **Limpiar configuración anterior**:
   ```bash
   docker-compose -f docker-compose.traefik.yml down --remove-orphans
   docker system prune -f
   ```

## 🔄 Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar
docker-compose -f docker-compose.traefik.yml up -d

# Parar
docker-compose -f docker-compose.traefik.yml down

# Reiniciar
docker-compose -f docker-compose.traefik.yml restart

# Reconstruir
docker-compose -f docker-compose.traefik.yml build --no-cache
```

### Mantenimiento

```bash
# Backup de base de datos
docker exec mysql mysqldump -u cafe_user -p cafe_colombia > backup.sql

# Limpiar logs
docker system prune -f

# Actualizar imágenes
docker-compose -f docker-compose.traefik.yml pull
```

## 📈 Actualizaciones

### Actualizar Código

```bash
# 1. Obtener cambios
git pull origin main

# 2. Reconstruir y reiniciar
docker-compose -f docker-compose.traefik.yml build --no-cache
docker-compose -f docker-compose.traefik.yml up -d
```

### Actualizar Configuración

```bash
# 1. Modificar .env.docker
nano .env.docker

# 2. Reiniciar servicios
docker-compose -f docker-compose.traefik.yml restart
```

## ⚠️ Notas Importantes

### Seguridad

- **Cambiar contraseñas** por defecto en `.env.docker`
- **Configurar firewall** para puertos 80, 443, 8080
- **Mantener actualizado** Docker y las imágenes
- **Backup regular** de la base de datos

### Rendimiento

- **Monitorear recursos** del servidor
- **Configurar límites** de memoria en Docker
- **Optimizar consultas** de base de datos
- **Usar CDN** para archivos estáticos

### Certificados SSL

- **Renovación automática** cada 90 días
- **Backup de certificados** en volumen `traefik_data`
- **Rate limits** de Let's Encrypt (50 por semana)

## 📞 Soporte

Si encuentras problemas:

1. **Ejecutar diagnóstico**: `./diagnose-server.sh`
2. **Revisar logs**: `docker-compose -f docker-compose.traefik.yml logs`
3. **Verificar configuración**: Revisar `.env.docker`
4. **Reiniciar servicios**: `./fix-bad-gateway.sh`

---

**Última actualización**: $(date)
**Versión**: 1.0.0