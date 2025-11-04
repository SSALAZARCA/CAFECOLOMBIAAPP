# Guía de Despliegue en Coolify - Cafe Colombia

## 1. Preparación del Repositorio

### 1.1 Archivos Necesarios
Asegúrate de que tu repositorio contenga estos archivos esenciales:

```
├── .gitignore
├── coolify.json
├── coolify-build.json
├── package.json
├── vite.config.ts
├── Dockerfile.coolify
├── api/
│   ├── package.json
│   ├── server.cjs
│   └── .env.production
└── src/
    └── (código frontend)
```

### 1.2 .gitignore Actualizado
```gitignore
# Dependencies
node_modules/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Production builds
dist
dist-ssr
*.local

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Database
*.sqlite
*.db

# Uploads
uploads/*
!uploads/.gitkeep

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/

# Build outputs
build/
out/

# Backup files
backups/
```

### 1.3 Archivos de Configuración Coolify

**coolify.json:**
```json
{
  "name": "cafe-colombia-fullstack",
  "build": {
    "pack": "node",
    "buildCommand": "npm run build:coolify",
    "startCommand": "npm run start:coolify",
    "publishDirectory": "dist"
  },
  "env": {
    "NODE_ENV": "production",
    "PORT": "3001"
  },
  "healthcheck": {
    "path": "/api/health",
    "interval": "30s",
    "timeout": "10s",
    "retries": 3
  },
  "ports": [
    {
      "internal": 3001,
      "external": 3001
    }
  ],
  "volumes": [
    {
      "source": "./uploads",
      "destination": "/app/uploads"
    },
    {
      "source": "./logs",
      "destination": "/app/logs"
    }
  ]
}
```

**coolify-build.json:**
```json
{
  "name": "cafe-colombia-build",
  "build": {
    "pack": "node",
    "buildCommand": "npm install && npm run build",
    "startCommand": "npm run preview",
    "publishDirectory": "dist"
  },
  "env": {
    "NODE_ENV": "production"
  },
  "ports": [
    {
      "internal": 4173,
      "external": 4173
    }
  ]
}
```

### 1.4 Scripts en package.json
```json
{
  "scripts": {
    "build:coolify": "npm install && npm run build",
    "start:coolify": "node api/server.cjs",
    "build": "tsc && vite build",
    "preview": "vite preview --host 0.0.0.0 --port 4173"
  }
}
```

## 2. Variables de Entorno en Coolify

### 2.1 Configuración de Base de Datos

**Opción A: Base de datos externa (recomendado)**
```bash
# MySQL Externo
MYSQL_HOST=tu-servidor-mysql.com
MYSQL_PORT=3306
MYSQL_USER=u689528678_CAFECOLOMBIA
MYSQL_PASSWORD=tu-contraseña-segura
MYSQL_NAME=u689528678_cafecolombia
MYSQL_ROOT_PASSWORD=tu-root-password

# Variables de aplicación (usar las mismas valores)
DB_HOST=tu-servidor-mysql.com
DB_PORT=3306
DB_USER=u689528678_CAFECOLOMBIA
DB_PASSWORD=tu-contraseña-segura
DB_NAME=u689528678_cafecolombia
```

**Opción B: Base de datos interna (Docker Compose)**
```bash
# Usar servicio MySQL interno
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword
MYSQL_NAME=cafecolombia
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=cafecolombia
```

### 2.2 Variables de Aplicación
```bash
# Entorno
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# URLs de la aplicación
VITE_API_URL=http://127.0.0.1:3001
VITE_APP_URL=http://127.0.0.1:4173
FRONTEND_URL=http://127.0.0.1:4173
BACKEND_URL=http://127.0.0.1:3001

# Seguridad
JWT_SECRET=tu-jwt-secret-muy-seguro-aqui
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
SESSION_SECRET=tu-session-secret-muy-seguro

# CORS
CORS_ORIGIN=http://127.0.0.1:4173,http://localhost:4173,http://localhost:3001

# Email (configurar según tu proveedor)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-password-app
EMAIL_FROM=Cafe Colombia <tu-email@gmail.com>

# Almacenamiento
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Wompi (opcional - para pagos)
WOMPI_PUBLIC_KEY=tu-wompi-public-key
WOMPI_PRIVATE_KEY=tu-wompi-private-key
WOMPI_WEBHOOK_SECRET=tu-webhook-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### 2.3 Plantilla de Variables (.env.coolify)
```bash
# === CONFIGURACIÓN DE BASE DE DATOS ===
# IMPORTANTE: Configura tanto MYSQL_* como DB_* con los mismos valores
MYSQL_HOST=193.203.175.58
MYSQL_PORT=3306
MYSQL_USER=u689528678_CAFECOLOMBIA
MYSQL_PASSWORD=CAMBIAR_A_TU_PASSWORD
MYSQL_NAME=u689528678_cafecolombia

DB_HOST=193.203.175.58
DB_PORT=3306
DB_USER=u689528678_CAFECOLOMBIA
DB_PASSWORD=CAMBIAR_A_TU_PASSWORD
DB_NAME=u689528678_cafecolombia

# === CONFIGURACIÓN DE LA APLICACIÓN ===
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# === URLS ===
VITE_API_URL=http://127.0.0.1:3001
VITE_APP_URL=http://127.0.0.1:4173
FRONTEND_URL=http://127.0.0.1:4173
BACKEND_URL=http://127.0.0.1:3001

# === SEGURIDAD ===
JWT_SECRET=CAMBIAR_A_UN_SECRET_MUY_SEGURO
SESSION_SECRET=CAMBIAR_A_OTRO_SECRET_MUY_SEGURO

# === CORS ===
CORS_ORIGIN=http://127.0.0.1:4173,http://localhost:4173

# === EMAIL (Configura con tu proveedor) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-password-de-app
EMAIL_FROM=Cafe Colombia <tu-email@gmail.com>

# === WOMPI (Opcional) ===
WOMPI_PUBLIC_KEY=tu-public-key
WOMPI_PRIVATE_KEY=tu-private-key
```

## 3. Pasos de Despliegue en Coolify

### 3.1 Preparación Inicial
1. **Accede a tu instancia de Coolify**
2. **Crea un nuevo proyecto** o selecciona uno existente
3. **Configura el proveedor de Git** (GitHub, GitLab, etc.)

### 3.2 Crear Recurso de Aplicación
1. Click en **"New Resource"**
2. Selecciona **"Docker Compose"** o **"Dockerfile"**
3. **Docker Compose (Recomendado)**:
   ```yaml
   version: '3.8'
   services:
     app:
       build:
         context: .
         dockerfile: Dockerfile.coolify
       ports:
         - "3001:3001"
       environment:
         - NODE_ENV=production
         - PORT=3001
       env_file:
         - .env.coolify
       volumes:
         - ./uploads:/app/uploads
         - ./logs:/app/logs
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

### 3.3 Configuración del Recurso
1. **Nombre del recurso**: `cafe-colombia-prod`
2. **Repositorio**: Selecciona tu repositorio de Git
3. **Rama**: `main` o `master`
4. **Ruta del Dockerfile**: `Dockerfile.coolify`
5. **Puerto**: `3001`

### 3.4 Configurar Variables de Entorno
1. Ve a la pestaña **"Environment Variables"**
2. **Copia todas las variables** de la sección 2.2
3. **Asegúrate de cambiar los valores** marcados como `CAMBIAR_A...`
4. **Verifica que tanto MYSQL_* como DB_* tengan los mismos valores**

### 3.5 Configuración de Dominio
1. Ve a **"Domains"**
2. **Agrega tu dominio** (ejemplo: `cafe-colombia.com`)
3. **Activa SSL** con Let's Encrypt
4. **Configura el proxy inverso** si es necesario

### 3.6 Iniciar Despliegue
1. Click en **"Deploy"**
2. **Monitorea los logs** del despliegue
3. **Verifica que no haya errores**

## 4. Verificación Post-Despliegue

### 4.1 Verificar Health Check
```bash
# Desde tu terminal local
curl -f https://tu-dominio.com/api/health
# Debería retornar: {"status":"ok","timestamp":"2025-01-..."}
```

### 4.2 Verificar Base de Datos
```bash
# Conectarse a MySQL
mysql -h tu-servidor -u u689528678_CAFECOLOMBIA -p

# Verificar tablas
USE u689528678_cafecolombia;
SHOW TABLES;

# Verificar roles
SELECT * FROM roles;
```

### 4.3 Verificar Login
1. **Accede a**: `https://tu-dominio.com/login`
2. **Prueba login con**:
   - Email: `admin@cafecolombia.com`
   - Password: `admin123`
3. **Verifica acceso al panel de administración**

### 4.4 Verificar Subida de Archivos
1. **Prueba subir una imagen** desde el panel admin
2. **Verifica que se guarde** en `/uploads`
3. **Confirma que la imagen sea accesible** públicamente

## 5. Solución de Problemas Comunes

### 5.1 Error de Conexión a Base de Datos
```bash
# Error típico: Access denied for user
# Solución: Verificar credenciales
# Asegúrate de que ambas familias de variables estén configuradas:
MYSQL_USER=u689528678_CAFECOLOMBIA
DB_USER=u689528678_CAFECOLOMBIA
```

### 5.2 Error de Puerto 3001 Ocupado
```bash
# Verificar qué proceso usa el puerto
sudo lsof -i :3001
# Matar proceso si es necesario
sudo kill -9 [PID]
```

### 5.3 Error de CORS
```bash
# Verificar variable CORS_ORIGIN
CORS_ORIGIN=https://tu-dominio.com,https://www.tu-dominio.com
```

### 5.4 Error de Permisos de Archivos
```bash
# Asegurar permisos correctos
sudo chown -R www-data:www-data uploads/
sudo chmod -R 755 uploads/
```

### 5.5 Error de Health Check
```bash
# Verificar que el endpoint responda
curl -v http://localhost:3001/api/health
# Si falla, revisar logs de la aplicación
docker logs cafe-colombia-prod-app-1
```

## 6. Configuración de Base de Datos

### 6.1 Base de Datos Externa (Recomendado)
```bash
# Crear base de datos
CREATE DATABASE u689528678_cafecolombia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crear usuario
CREATE USER 'u689528678_CAFECOLOMBIA'@'%' IDENTIFIED BY 'tu-contraseña-segura';
GRANT ALL PRIVILEGES ON u689528678_cafecolombia.* TO 'u689528678_CAFECOLOMBIA'@'%';
FLUSH PRIVILEGES;
```

### 6.2 Ejecutar Migraciones
```bash
# Después del despliegue, ejecutar:
npm run migrate:prod
# o
node api/runMigrations.cjs
```

### 6.3 Crear Usuario Admin
```bash
# Si necesitas crear admin manualmente
node api/create_test_admin.cjs
```

## 7. Configuración de Dominio y SSL

### 7.1 Configuración DNS
```
A     @     tu-ip-coolify
A     www   tu-ip-coolify
CNAME api   tu-ip-coolify
```

### 7.2 Configuración SSL
1. **Coolify genera automáticamente** certificados Let's Encrypt
2. **Verifica la renovación automática**
3. **Configura redirect HTTP → HTTPS**

### 7.3 Configuración de Proxy Inverso
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /uploads/ {
        alias /app/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 8. Mantenimiento y Monitoreo

### 8.1 Scripts de Mantenimiento
```bash
# Backup de base de datos
npm run backup

# Limpiar logs antiguos
npm run maintenance:cleanup

# Verificar salud del sistema
npm run health:check
```

### 8.2 Monitoreo
- **Configura alertas** en Coolify
- **Monitorea logs** de errores
- **Verifica uso de recursos** (CPU, memoria, disco)
- **Revisa logs de acceso** regularmente

### 8.3 Actualizaciones
```bash
# Para actualizar la aplicación
1. Actualiza código en Git
2. Coolify detecta cambios automáticamente
3. Monitorea el nuevo despliegue
4. Verifica que todo funcione correctamente
```

## 9. Comandos Útiles

```bash
# Ver logs de Docker
docker logs -f cafe-colombia-prod-app-1

# Reiniciar servicio
docker-compose restart app

# Ver estadísticas
docker stats

# Backup manual
docker exec cafe-colombia-prod-app-1 npm run backup

# Acceder al contenedor
docker exec -it cafe-colombia-prod-app-1 bash
```

## 10. Checklist Final

- [ ] Repositorio subido con todos los archivos necesarios
- [ ] Variables de entorno configuradas en Coolify
- [ ] Base de datos accesible y configurada
- [ ] Dominio configurado y apuntando a Coolify
- [ ] SSL activado y funcionando
- [ ] Health check respondiendo correctamente
- [ ] Login de admin funcionando
- [ ] Subida de archivos funcionando
- [ ] CORS configurado correctamente
- [ ] Backups configurados
- [ ] Monitoreo activado
- [ ] Documentación actualizada

## Soporte

Si encuentras problemas durante el despliegue:

1. **Revisa los logs** de Coolify y Docker
2. **Verifica las variables de entorno** (especialmente las de DB)
3. **Asegúrate de que ambas familias MYSQL_* y DB_* estén configuradas**
4. **Comprueba que el puerto 3001 esté disponible**
5. **Verifica la conectividad a la base de datos**

Para más ayuda, consulta:
- [