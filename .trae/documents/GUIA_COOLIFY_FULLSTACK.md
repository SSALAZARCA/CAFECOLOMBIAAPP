# Guía Completa: Configuración Full-Stack en Coolify

## 🎯 Problema Identificado
Tu aplicación tiene frontend (React/Vite) y backend (Node.js/Express) compilando en un solo puerto en Coolify, causando conflictos de conectividad.

## 🏗️ Solución: Servicios Separados

### 1. Arquitectura Recomendada en Coolify

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   React/Vite    │    │  Node.js/Express│
│   Puerto: 80    │◄──►│   Puerto: 3001  │
│   Dominio: app  │    │   Dominio: api  │
└─────────────────┘    └─────────────────┘
```

## 📋 Paso 1: Crear Dos Servicios Separados

### 1.1 Servicio Backend (API)

**En Coolify:**
1. Crear nuevo servicio: `cafe-colombia-api`
2. Tipo: `Node.js Application`
3. Puerto interno: `3001`
4. Dominio: `api.tudominio.com`

**Configuración del servicio:**
```yaml
# Configuración en Coolify
Name: cafe-colombia-api
Source: Tu repositorio Git
Build Pack: Node.js
Port: 3001
Health Check: /api/health
```

### 1.2 Servicio Frontend (React)

**En Coolify:**
1. Crear nuevo servicio: `cafe-colombia-frontend`
2. Tipo: `Static Site` o `Node.js Application`
3. Puerto interno: `80` (para static) o `5173` (para dev)
4. Dominio: `app.tudominio.com` o `tudominio.com`

## 📋 Paso 2: Dockerfiles Específicos

### 2.1 Dockerfile para Backend (`api/Dockerfile`)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json del backend
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código del backend
COPY . .

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "server.cjs"]
```

### 2.2 Dockerfile para Frontend (`Dockerfile.frontend`)

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copiar package.json del frontend
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Variables de entorno para build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build de producción
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar archivos build
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 📋 Paso 3: Variables de Entorno

### 3.1 Backend (cafe-colombia-api)

```env
# Base de datos
DB_HOST=tu-db-host
DB_USER=tu-db-user
DB_PASSWORD=tu-db-password
DB_NAME=tu-db-name

# JWT
JWT_SECRET=tu-jwt-secret

# CORS
CORS_ORIGIN=https://app.tudominio.com

# Puerto
PORT=3001

# URLs
FRONTEND_URL=https://app.tudominio.com
BACKEND_URL=https://api.tudominio.com
```

### 3.2 Frontend (cafe-colombia-frontend)

```env
# API URL - CRÍTICO
VITE_API_URL=https://api.tudominio.com/api

# App URL
VITE_APP_URL=https://app.tudominio.com

# Otras configuraciones
VITE_APP_NAME=Cafe Colombia
```

## 📋 Paso 4: Configuración de Dominios

### 4.1 Subdominios Recomendados

```
Frontend: https://app.tudominio.com
Backend:  https://api.tudominio.com
```

### 4.2 Configuración en Coolify

**Para Backend:**
- Domain: `api.tudominio.com`
- Port: `3001`
- Health Check: `/api/health`

**Para Frontend:**
- Domain: `app.tudominio.com` o `tudominio.com`
- Port: `80`
- Health Check: `/`

## 📋 Paso 5: Configuración Nginx (Frontend)

### 5.1 nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to backend
    location /api/ {
        proxy_pass https://api.tudominio.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

## 📋 Paso 6: Scripts de Build

### 6.1 package.json (Backend)

```json
{
  "scripts": {
    "start": "node server.cjs",
    "dev": "nodemon server.cjs",
    "build": "echo 'Backend build complete'"
  }
}
```

### 6.2 package.json (Frontend)

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "dev": "vite"
  }
}
```

## 📋 Paso 7: Migración Paso a Paso

### 7.1 Preparar Repositorio

1. **Crear estructura separada:**
```
proyecto/
├── api/                 # Backend
│   ├── Dockerfile
│   ├── package.json
│   └── server.cjs
├── Dockerfile.frontend  # Frontend Dockerfile
├── nginx.conf          # Nginx config
├── package.json        # Frontend package.json
└── src/                # Frontend source
```

### 7.2 En Coolify

1. **Eliminar servicio actual** (si existe)
2. **Crear servicio Backend:**
   - Name: `cafe-colombia-api`
   - Source: Tu repo
   - Build Command: `cd api && npm install`
   - Start Command: `cd api && npm start`
   - Port: `3001`
   - Domain: `api.tudominio.com`

3. **Crear servicio Frontend:**
   - Name: `cafe-colombia-frontend`
   - Source: Tu repo
   - Dockerfile: `Dockerfile.frontend`
   - Port: `80`
   - Domain: `app.tudominio.com`
   - Build Args: `VITE_API_URL=https://api.tudominio.com/api`

## 📋 Paso 8: Verificación y Testing

### 8.1 Checklist de Verificación

- [ ] Backend responde en `https://api.tudominio.com/api/health`
- [ ] Frontend carga en `https://app.tudominio.com`
- [ ] Variables de entorno configuradas correctamente
- [ ] CORS configurado para permitir frontend
- [ ] SSL certificados funcionando
- [ ] Health checks pasando en Coolify

### 8.2 Comandos de Testing

```bash
# Probar backend
curl https://api.tudominio.com/api/health

# Probar frontend
curl https://app.tudominio.com

# Verificar conectividad
curl -H "Origin: https://app.tudominio.com" https://api.tudominio.com/api/health
```

## 🔧 Troubleshooting Común

### Problema 1: CORS Errors
**Solución:** Verificar `CORS_ORIGIN` en backend incluye URL del frontend

### Problema 2: 404 en rutas del frontend
**Solución:** Configurar nginx para `try_files $uri $uri/ /index.html`

### Problema 3: API calls fallan
**Solución:** Verificar `VITE_API_URL` apunta al dominio correcto del backend

### Problema 4: Build fails
**Solución:** Verificar Dockerfiles y build commands están correctos

## 🚀 Configuración Alternativa: Un Solo Servicio con Proxy

Si prefieres mantener un solo servicio, puedes usar esta configuración:

### Dockerfile Unificado

```dockerfile
# Build frontend
FROM node:18-alpine as frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Backend
FROM node:18-alpine
WORKDIR /app

# Instalar backend
COPY api/package*.json ./
RUN npm ci --only=production
COPY api/ ./

# Copiar frontend build
COPY --from=frontend-build /app/dist ./public

# Configurar express para servir frontend
# (Requiere modificar server.cjs)

EXPOSE 3001
CMD ["node", "server.cjs"]
```

### Modificar server.cjs para servir frontend

```javascript
// Agregar al final de server.cjs
const path = require('path');

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Manejar rutas del frontend (SPA)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

## 📝 Recomendación Final

**Para producción, recomiendo usar servicios separados** porque:
- ✅ Mejor escalabilidad
- ✅ Deployments independientes
- ✅ Mejor debugging
- ✅ Configuración más clara

**La configuración unificada** es útil para:
- ✅ Desarrollo rápido
- ✅ Proyectos pequeños
- ✅ Menos complejidad de infraestructura

¡Elige la opción que mejor se adapte a tus necesidades!