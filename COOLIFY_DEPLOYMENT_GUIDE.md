# 🚀 Guía de Deployment en Coolify - Café Colombia App

## 📋 Configuración Paso a Paso

### 1. Preparación del Repositorio

Asegúrate de que todos los cambios estén committeados y pusheados:

```bash
git add .
git commit -m "feat: configuración para Coolify deployment"
git push origin main
```

### 2. Configuración en Coolify

#### 2.1 Crear Nuevo Servicio

1. **Ir a Coolify Dashboard**
2. **Crear nuevo servicio**: `cafe-colombia-fullstack`
3. **Tipo**: `Node.js Application`
4. **Repositorio**: Tu repositorio Git
5. **Branch**: `main`

#### 2.2 Configuración del Servicio

```yaml
# Configuración en Coolify
Name: cafe-colombia-fullstack
Source: tu-repositorio-git
Build Pack: Node.js
Root Directory: /
Build Command: npm run coolify:build
Start Command: npm run coolify:start
Port: 3001
Health Check Path: /api/health
Domain: tu-dominio.com
```

### 3. Variables de Entorno

Copiar y pegar estas variables en **Coolify > Environment Variables**:

```env
# CONFIGURACIÓN BÁSICA
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# BASE DE DATOS (⚠️ CAMBIAR POR TUS VALORES REALES)
DB_HOST=tu-db-host-coolify
DB_PORT=3306
DB_USER=tu-db-user
DB_PASSWORD=tu-db-password-seguro
DB_NAME=cafe_colombia_app

# JWT (⚠️ GENERAR UN SECRET SEGURO)
JWT_SECRET=tu-jwt-secret-muy-seguro-minimo-32-caracteres-aqui
JWT_EXPIRES_IN=7d

# URLs (⚠️ CAMBIAR tu-dominio.com POR TU DOMINIO REAL)
VITE_API_URL=/api
VITE_APP_URL=https://tu-dominio.com
FRONTEND_URL=https://tu-dominio.com
BACKEND_URL=https://tu-dominio.com/api
CORS_ORIGIN=https://tu-dominio.com

# APLICACIÓN
APP_NAME=Café Colombia App
VITE_APP_NAME=Café Colombia

# WOMPI PAGOS (⚠️ CAMBIAR POR TUS CLAVES REALES)
WOMPI_PUBLIC_KEY=pub_prod_TU_CLAVE_PUBLICA_AQUI
WOMPI_PRIVATE_KEY=prv_prod_TU_CLAVE_PRIVADA_AQUI
WOMPI_ENVIRONMENT=production

# EMAIL (⚠️ CONFIGURAR CON TU PROVEEDOR)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
EMAIL_FROM=noreply@tu-dominio.com

# SEGURIDAD
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
RATE_LIMIT_MAX_REQUESTS=100

# ARCHIVOS
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760

# LOGS
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log
```

### 4. Configuración de Dominio

1. **En Coolify > Domains**:
   - Agregar tu dominio: `tu-dominio.com`
   - Activar **SSL automático**
   - Configurar **redirects** si es necesario

### 5. Deployment

1. **Hacer el primer deploy**:
   - Ir a **Deployments**
   - Hacer clic en **Deploy**
   - Monitorear los logs

2. **Verificar el build**:
   ```
   ✅ npm install (dependencias raíz)
   ✅ npm run build (build del frontend)
   ✅ cd api && npm install (dependencias backend)
   ✅ Servidor iniciado en puerto 3001
   ```

### 6. Verificación Post-Deployment

#### 6.1 Health Checks

```bash
# Verificar backend
curl https://tu-dominio.com/api/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "...",
  "mysql": "connected"
}
```

#### 6.2 Frontend

1. **Abrir**: `https://tu-dominio.com`
2. **Verificar**:
   - ✅ Página carga correctamente
   - ✅ No hay errores en consola
   - ✅ Login/registro funciona
   - ✅ API calls funcionan

#### 6.3 Logs en Coolify

Monitorear los logs para verificar:
- ✅ Servidor iniciado correctamente
- ✅ Conexión a MySQL exitosa
- ✅ No hay errores críticos

## 🔧 Troubleshooting

### Problema 1: Build Fails

**Error**: `npm run build failed`

**Solución**:
1. Verificar que todas las dependencias estén en `package.json`
2. Revisar logs de build en Coolify
3. Probar build localmente: `npm run coolify:build`

### Problema 2: Database Connection Error

**Error**: `Error connecting to MySQL`

**Solución**:
1. Verificar variables de entorno de DB
2. Confirmar que la base de datos esté accesible
3. Revisar configuración de red en Coolify

### Problema 3: Frontend No Carga

**Error**: `Cannot GET /`

**Solución**:
1. Verificar que el build del frontend se generó correctamente
2. Confirmar que `server.cjs` está sirviendo archivos estáticos
3. Revisar logs del servidor

### Problema 4: API Calls Fail

**Error**: `Network Error` o `CORS Error`

**Solución**:
1. Verificar `VITE_API_URL=/api`
2. Confirmar `CORS_ORIGIN` incluye tu dominio
3. Probar endpoints directamente: `curl https://tu-dominio.com/api/health`

## 📊 Monitoreo

### Métricas a Vigilar

1. **Health Check**: Debe responder `200 OK`
2. **Response Time**: < 2 segundos
3. **Memory Usage**: < 512MB
4. **CPU Usage**: < 80%

### Logs Importantes

```bash
# Logs de inicio exitoso
✅ Servidor corriendo en puerto 3001
✅ Conexión a MySQL exitosa
✅ Health check: /api/health

# Logs de error a vigilar
❌ Error connecting to MySQL
❌ JWT secret not configured
❌ CORS error
```

## 🚀 Optimizaciones

### Performance

1. **Gzip Compression**: Ya configurado en Express
2. **Static File Caching**: Configurado automáticamente
3. **Database Connection Pooling**: Implementado

### Seguridad

1. **HTTPS**: Activado automáticamente por Coolify
2. **Rate Limiting**: Configurado en Express
3. **CORS**: Configurado correctamente
4. **JWT**: Tokens seguros con expiración

## 📝 Checklist Final

- [ ] Repositorio actualizado y pusheado
- [ ] Servicio creado en Coolify
- [ ] Variables de entorno configuradas
- [ ] Dominio configurado con SSL
- [ ] Primer deployment exitoso
- [ ] Health check respondiendo
- [ ] Frontend cargando correctamente
- [ ] Login/registro funcionando
- [ ] API calls funcionando
- [ ] Logs sin errores críticos

¡Tu aplicación Café Colombia está lista para producción! 🎉