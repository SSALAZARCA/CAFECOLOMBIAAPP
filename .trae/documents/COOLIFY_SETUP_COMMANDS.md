# Comandos Específicos para Configurar Coolify

## 🚀 Opción 1: Servicios Separados (Recomendado)

### Paso 1: Preparar Variables de Entorno

**Backend (.env.production para API):**
```env
# Copiar y pegar en Coolify > cafe-colombia-api > Environment Variables
DB_HOST=tu-db-host
DB_USER=tu-db-user  
DB_PASSWORD=tu-db-password
DB_NAME=tu-db-name
JWT_SECRET=tu-jwt-secret-muy-seguro
PORT=3001
CORS_ORIGIN=https://app.tudominio.com
FRONTEND_URL=https://app.tudominio.com
BACKEND_URL=https://api.tudominio.com
```

**Frontend (.env.production para React):**
```env
# Copiar y pegar en Coolify > cafe-colombia-frontend > Environment Variables
VITE_API_URL=https://api.tudominio.com/api
VITE_APP_URL=https://app.tudominio.com
VITE_APP_NAME=Cafe Colombia
```

### Paso 2: Configuración en Coolify UI

**Servicio Backend:**
```
Name: cafe-colombia-api
Repository: tu-repositorio-git
Branch: main
Build Pack: Node.js
Root Directory: /api
Build Command: npm install
Start Command: node server.cjs
Port: 3001
Health Check Path: /api/health
Domain: api.tudominio.com
```

**Servicio Frontend:**
```
Name: cafe-colombia-frontend  
Repository: tu-repositorio-git
Branch: main
Build Pack: Static Site (Vite)
Root Directory: /
Build Command: npm install && npm run build
Port: 80
Health Check Path: /
Domain: app.tudominio.com
```

## 🔧 Opción 2: Servicio Único (Más Simple)

### Configuración Unificada en Coolify

```
Name: cafe-colombia-fullstack
Repository: tu-repositorio-git
Branch: main
Build Pack: Node.js
Root Directory: /
Build Command: npm install && npm run build:all
Start Command: npm run start:production
Port: 3001
Health Check Path: /api/health
Domain: tudominio.com
```

### Scripts necesarios en package.json (raíz)

```json
{
  "scripts": {
    "build:all": "npm run build && cd api && npm install",
    "start:production": "cd api && node server.cjs"
  }
}
```

### Variables de Entorno (Servicio Único)

```env
# En Coolify > Environment Variables
DB_HOST=tu-db-host
DB_USER=tu-db-user
DB_PASSWORD=tu-db-password  
DB_NAME=tu-db-name
JWT_SECRET=tu-jwt-secret-muy-seguro
PORT=3001
CORS_ORIGIN=https://tudominio.com
VITE_API_URL=/api
VITE_APP_URL=https://tudominio.com
```

## 📋 Checklist de Implementación

### Antes de Configurar en Coolify:

- [ ] Commit y push todos los cambios al repositorio
- [ ] Verificar que package.json tiene los scripts correctos
- [ ] Confirmar que .env.example está actualizado
- [ ] Probar build localmente: `npm run build`

### En Coolify:

- [ ] Crear servicio(s) con configuración correcta
- [ ] Agregar variables de entorno
- [ ] Configurar dominio(s)
- [ ] Activar SSL automático
- [ ] Configurar health checks
- [ ] Hacer primer deploy

### Después del Deploy:

- [ ] Verificar health check: `curl https://api.tudominio.com/api/health`
- [ ] Probar frontend: abrir `https://app.tudominio.com`
- [ ] Verificar logs en Coolify
- [ ] Probar login/registro
- [ ] Verificar conectividad frontend-backend

## 🔍 Comandos de Debugging

```bash
# Verificar backend
curl -v https://api.tudominio.com/api/health

# Verificar CORS
curl -H "Origin: https://app.tudominio.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.tudominio.com/api/auth/login

# Probar endpoint específico
curl -X POST https://api.tudominio.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123"}'
```

## ⚡ Solución Rápida: Si Ya Tienes Un Servicio

Si ya tienes un servicio en Coolify y quieres arreglarlo rápidamente:

### 1. Actualizar Variables de Entorno

```env
# Agregar/modificar estas variables en tu servicio actual
VITE_API_URL=/api
CORS_ORIGIN=https://tudominio.com
PORT=3001
```

### 2. Modificar server.cjs para servir frontend

Agregar al final de `api/server.cjs`:

```javascript
const path = require('path');

// Servir archivos estáticos del frontend (después de todas las rutas API)
app.use(express.static(path.join(__dirname, '../dist')));

// Manejar rutas SPA (debe ser la última ruta)
app.get('*', (req, res) => {
  // No interceptar rutas de API
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Servir index.html para todas las demás rutas
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});
```

### 3. Actualizar Build Command en Coolify

```bash
# Build Command
npm install && npm run build && cd api && npm install

# Start Command  
cd api && node server.cjs
```

## 🎯 Resultado Esperado

Después de seguir esta guía:

✅ **Backend funcionando** en `https://api.tudominio.com/api/health`
✅ **Frontend cargando** en `https://app.tudominio.com`
✅ **Sin errores CORS**
✅ **Login/registro funcionando**
✅ **SSL automático activado**
✅ **Health checks pasando**

¡Tu aplicación estará completamente funcional en Coolify!