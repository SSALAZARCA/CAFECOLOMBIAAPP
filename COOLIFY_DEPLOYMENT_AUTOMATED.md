# 🚀 Deployment Automático en Coolify - Café Colombia

## ✅ Configuración Completamente Automatizada

Este proyecto está **100% automatizado** para deployment en Coolify. No requiere intervención manual.

## 📋 Scripts Automatizados

### 1. Build Automático
```bash
npm run coolify:build
```
- ✅ Instala dependencias del backend automáticamente
- ✅ Crea build simplificado del frontend
- ✅ Configura archivos estáticos
- ✅ Genera configuración de Coolify
- ✅ Verifica integridad del build

### 2. Start Automático
```bash
npm run coolify:start
```
- ✅ Inicia servidor en modo producción
- ✅ Sirve API y archivos estáticos
- ✅ Configuración automática de CORS
- ✅ Health check disponible en `/api/health`

## 🐳 Dockerfile Automático

El archivo `Dockerfile.coolify` está configurado para:
- ✅ Build completamente automático
- ✅ Optimizado para Node.js 20 LTS
- ✅ Health check integrado
- ✅ Variables de entorno configuradas
- ✅ Puerto 3001 expuesto automáticamente

## 🔧 Configuración en Coolify

### Paso 1: Crear Aplicación
1. En Coolify, crear nueva aplicación
2. Conectar repositorio Git
3. Seleccionar rama principal

### Paso 2: Configuración de Build
```yaml
Build Command: npm run coolify:build
Start Command: npm run coolify:start
Port: 3001
```

### Paso 3: Variables de Entorno
Configurar las siguientes variables en Coolify:

```env
NODE_ENV=production
PORT=3001
MYSQL_HOST=tu_host_mysql
MYSQL_USER=tu_usuario_mysql
MYSQL_PASSWORD=tu_password_mysql
MYSQL_DATABASE=tu_base_datos
JWT_SECRET=tu_jwt_secret_seguro
CORS_ORIGIN=https://tu-dominio.com
```

### Paso 4: Deploy
- ✅ Hacer push al repositorio
- ✅ Coolify ejecutará automáticamente el build
- ✅ La aplicación se desplegará sin intervención manual

## 📁 Estructura de Archivos Generados

Después del build automático:
```
dist/                    # Frontend build
├── index.html          # Página principal
├── favicon.svg         # Favicon
├── icons/              # Iconos de la app
└── *.js, *.css        # Assets compilados

api/                    # Backend
├── server.cjs          # Servidor principal
├── node_modules/       # Dependencias de producción
└── ...                # Archivos del API

coolify-build.json      # Configuración generada
```

## 🔍 Verificación del Deployment

### Health Check
```bash
curl https://tu-dominio.com/api/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-03T18:57:52.237Z",
  "services": {
    "mysql": "connected"
  }
}
```

### Endpoints Disponibles
- `GET /api/health` - Health check
- `GET /api/debug/connection` - Debug de conexión
- `POST /api/auth/login` - Login de usuarios
- `GET /` - Frontend de la aplicación

## 🛠️ Troubleshooting

### Si el build falla:
1. Verificar que todas las variables de entorno estén configuradas
2. Revisar logs de Coolify para errores específicos
3. Ejecutar `npm run coolify:build` localmente para debug

### Si el servidor no inicia:
1. Verificar configuración de base de datos
2. Comprobar que el puerto 3001 esté disponible
3. Revisar logs del contenedor en Coolify

### Si hay errores de conexión:
1. Verificar configuración de CORS_ORIGIN
2. Comprobar conectividad con MySQL
3. Revisar configuración de red en Coolify

## 📊 Monitoreo

El servidor incluye:
- ✅ Health check automático cada 30 segundos
- ✅ Logs detallados de conexiones
- ✅ Métricas de base de datos
- ✅ Manejo de errores automático

## 🎯 Características del Build Automático

- **Sin intervención manual**: Todo el proceso es automático
- **Optimizado para producción**: Dependencias mínimas
- **Compatible con Coolify**: Configuración específica
- **Robusto**: Manejo de errores y verificaciones
- **Escalable**: Preparado para múltiples instancias

## 📞 Soporte

Si necesitas ayuda con el deployment:
1. Revisar este documento
2. Verificar logs de Coolify
3. Comprobar configuración de variables de entorno
4. Ejecutar diagnósticos locales con `npm run coolify:build`

---

**✅ ¡Deployment 100% Automatizado!**
No se requiere configuración manual adicional.