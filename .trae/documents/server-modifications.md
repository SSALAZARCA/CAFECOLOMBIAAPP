# Modificaciones Necesarias para server.cjs

## 🔧 Para Servicio Unificado (Frontend + Backend)

Si decides usar un solo servicio en Coolify, necesitas modificar tu `api/server.cjs` para servir también el frontend.

### Agregar al final de server.cjs:

```javascript
// ========================================
// CONFIGURACIÓN PARA SERVIR FRONTEND
// ========================================

const path = require('path');

// Middleware para servir archivos estáticos del frontend
// IMPORTANTE: Esto debe ir DESPUÉS de todas las rutas de API
app.use(express.static(path.join(__dirname, 'public')));

// Manejar rutas del frontend (SPA - Single Page Application)
// IMPORTANTE: Esta debe ser la ÚLTIMA ruta definida
app.get('*', (req, res) => {
  // No interceptar rutas de API
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  }
  
  // Servir index.html para todas las demás rutas (React Router)
  const indexPath = path.join(__dirname, 'public', 'index.html');
  
  // Verificar que el archivo existe
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend not found. Make sure the build files are in the public directory.' 
    });
  }
});

// ========================================
// MANEJO DE ERRORES GLOBAL
// ========================================

// Middleware de manejo de errores (debe ir al final)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // No enviar stack trace en producción
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Manejar rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});
```

## 🔧 Para Servicios Separados

Si usas servicios separados, NO necesitas modificar server.cjs. Solo asegúrate de que:

### 1. CORS esté configurado correctamente:

```javascript
// En server.cjs, verificar configuración CORS
const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### 2. Variables de entorno estén definidas:

```javascript
// Al inicio de server.cjs
require('dotenv').config();

// Verificar variables críticas
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🌐 CORS Origin:', process.env.CORS_ORIGIN);
console.log('🔌 Port:', process.env.PORT || 3001);
```

## 📋 Checklist de Verificación

### Para Servicio Unificado:
- [ ] Modificar server.cjs con el código de arriba
- [ ] Verificar que `public/` directory existe después del build
- [ ] Probar que `/api/health` funciona
- [ ] Probar que `/` sirve el frontend
- [ ] Verificar que rutas de React Router funcionan

### Para Servicios Separados:
- [ ] CORS configurado correctamente
- [ ] Variables de entorno definidas
- [ ] Backend responde en puerto 3001
- [ ] Frontend se conecta al backend correcto

## 🚨 Problemas Comunes y Soluciones

### Problema: "Cannot GET /" en servicio unificado
**Solución:** Verificar que:
1. El build del frontend se copió a `public/`
2. La ruta `app.get('*', ...)` está al final
3. No hay conflictos con otras rutas

### Problema: CORS errors en servicios separados
**Solución:** Verificar que:
1. `CORS_ORIGIN` incluye la URL del frontend
2. Credentials están habilitados si es necesario
3. Headers permitidos incluyen los que usa el frontend

### Problema: API routes no funcionan
**Solución:** Verificar que:
1. Las rutas API están definidas ANTES de `app.use(express.static(...))`
2. Las rutas API tienen el prefijo `/api/`
3. No hay conflictos de nombres

## 🎯 Configuración Recomendada para Coolify

### Opción A: Servicio Unificado (Más Simple)
```
Build Command: npm install && npm run build && cd api && npm install
Start Command: cd api && node server.cjs
Port: 3001
Health Check: /api/health
```

### Opción B: Servicios Separados (Más Escalable)
**Backend:**
```
Build Command: npm install
Start Command: node server.cjs
Port: 3001
Health Check: /api/health
```

**Frontend:**
```
Build Command: npm install && npm run build
Port: 80
Health Check: /health
```

¡Elige la opción que mejor se adapte a tu caso!