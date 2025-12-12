const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno (solo desde archivo en desarrollo)
try {
  const isProduction = (process.env.NODE_ENV || 'development') === 'production';
  if (!isProduction) {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    } else {
      dotenv.config();
    }
  }
} catch (e) {
  console.warn('dotenv load skipped:', e?.message);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de la base de datos (acepta ambas familias DB_* y MYSQL_*)
const { dbConfig, pool } = require('./config/database.cjs');

// Configuración de CORS
const defaultOrigins = [
  'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176',
  'http://localhost', 'http://localhost:80',
  'http://127.0.0.1:5173', 'http://127.0.0.1:3001', // Add IP based origins
  'http://192.168.1.13:5173' // Common local IP
];
const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean) : [];
const allowedOrigins = [...defaultOrigins, ...envOrigins];
const corsOptions = {
  // En desarrollo, permitir cualquier origen temporalmente si falla el match
  origin: function (origin, callback) {
    // Permitir requests sin origen (como curl o apps móviles)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('🚫 Bloqueado por CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/api/ping-test', (req, res) => res.send('SERVER IS UPDATED'));

// Función para probar conexión a MySQL
async function testMySQLConnection() {
  try {
    const [rows] = await pool.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('Error conectando a MySQL:', error.message);
    return false;
  }
}

// Ruta de health check
app.get('/api/health', async (req, res) => {
  try {
    const mysqlConnected = await testMySQLConnection();

    const healthStatus = {
      status: mysqlConnected ? 'healthy' : 'degraded',
      message: 'Café Colombia API Server',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        mysql: mysqlConnected ? 'connected' : 'disconnected',
        database: process.env.DB_NAME
      }
    };

    res.status(mysqlConnected ? 200 : 503).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error checking health',
      error: error.message
    });
  }
});

// Ruta de ping simple
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de diagnóstico completo
app.get('/api/debug/connection', (req, res) => {
  const debugInfo = {
    server: {
      status: 'running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      baseUrl: `http://0.0.0.0:${PORT}/api`
    },
    network: {
      hostname: require('os').hostname(),
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage()
    },
    configuration: {
      corsOrigin: process.env.CORS_ORIGIN || '*',
      dbHost: process.env.DB_HOST || 'localhost',
      dbName: process.env.DB_NAME || 'cafe_colombia',
      redisHost: process.env.REDIS_HOST || 'localhost'
    },
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: '/api/admin',
      dashboard: '/api/dashboard',
      alerts: '/api/alerts',
      ai: '/api/ai'
    },
    request: {
      method: req.method,
      url: req.url,
      headers: {
        host: req.get('host'),
        userAgent: req.get('user-agent'),
        origin: req.get('origin'),
        referer: req.get('referer')
      },
      ip: req.ip || req.connection.remoteAddress
    }
  };

  res.json({
    success: true,
    message: 'Información de diagnóstico del servidor',
    data: debugInfo
  });
});

// Ruta principal de la API
app.get('/api', (req, res) => {
  res.json({
    message: 'Café Colombia API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: '/api/admin',
      dashboard: '/api/dashboard',
      alerts: '/api/alerts',
      ai: '/api/ai'
    },
    features: {
      smartAlerts: '/api/alerts/smart',
      aiAnalysis: '/api/ai/analysis/results',
      aiStatus: '/api/ai/status',
      alertsStats: '/api/alerts/stats'
    }
  });
});

// Rutas de autenticación básicas
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos'
      });
    }

    try {
      // Buscar usuario en la tabla users
      const [users] = await pool.execute(
        'SELECT id, email, password, firstName, lastName, role, isActive FROM users WHERE email = ? AND isActive = true',
        [email]
      );

      if (users.length === 0) {
        const fs = require('fs');
        try {
          fs.appendFileSync('backend-errors.log', new Date().toISOString() + ` LOGIN FAIL: User not found for email ${email}\n`);
        } catch (e) { }
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      const user = users[0];

      // Verificar contraseña con bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        const fs = require('fs');
        try {
          fs.appendFileSync('backend-errors.log', new Date().toISOString() + ` LOGIN FAIL: Invalid password for ${email}\n`);
        } catch (e) { }
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Login exitoso

      // Generar token compatible con rutas de caficultor si es necesario
      let token;
      if (user.role === 'coffee_grower' || user.role === 'TRABAJADOR') {
        // Usar formato grower-token para compatibilidad con workers.cjs y dashboard
        token = 'grower-token-' + user.email;
      } else {
        token = 'user-token-' + user.id + '-' + Date.now();
      }

      return res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
          },
          token: token
        }
      });

    } catch (dbError) {
      console.error('Database error during login:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('Login error:', error);
    const fs = require('fs');
    try {
      fs.appendFileSync('backend-errors.log', new Date().toISOString() + ' LOGIN ERROR: ' + error.message + '\n');
    } catch (e) { }
    res.status(500).json({
      error: 'Error en el servidor durante el inicio de sesión'
    });
  }
});

// Ruta de login para administradores
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos'
      });
    }

    try {
      // Buscar en admin_users
      const [adminUsers] = await pool.execute(
        'SELECT id, email, password_hash, name, is_super_admin, is_active FROM admin_users WHERE email = ? AND is_active = true',
        [email]
      );

      if (adminUsers.length > 0) {
        const user = adminUsers[0];
        // Para admin, verificar credenciales hardcodeadas por ahora
        if (email === 'admin@cafecolombiaapp.com' && password === 'admin123') {
          return res.json({
            message: 'Login exitoso',
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.is_super_admin ? 'super_admin' : 'admin'
            },
            token: 'admin-token-' + Date.now()
          });
        }
      }

      return res.status(401).json({
        error: 'Credenciales inválidas'
      });

    } catch (dbError) {
      throw dbError;
    }

  } catch (error) {
    console.error('Error en admin login:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Ruta de registro para caficultores
// Ruta de registro para caficultores
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      farmName,
      location,
      farmSize,
      altitude,
      coffeeVariety,
      phone
    } = req.body;

    // Validaciones básicas
    if (!name || !email || !password || !farmName) {
      return res.status(400).json({
        error: 'Nombre, email, contraseña y nombre de finca son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Formato de email inválido'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    try {
      // Verificar si el email ya existe
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          error: 'El email ya está registrado'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userId = uuidv4();
      const firstName = name.split(' ')[0];
      const lastName = name.split(' ').slice(1).join(' ') || '';

      // Insertar nuevo usuario (caficultor)
      await pool.execute(
        `INSERT INTO users (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, 'coffee_grower', true, NOW(), NOW())`,
        [userId, email, hashedPassword, firstName, lastName]
      );

      // Crear finca asociada
      if (farmName) {
        const farmId = uuidv4();
        await pool.execute(
          `INSERT INTO farms 
           (id, ownerId, name, location, area, altitude, isActive, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
          [
            farmId,
            userId,
            farmName,
            location || 'No especificado',
            farmSize || 0,
            altitude || 0
          ]
        );
      }

      res.status(201).json({
        success: true,
        message: 'Caficultor registrado exitosamente',
        user: {
          id: userId,
          name,
          email,
          farmName
        }
      });

    } catch (dbError) {
      throw dbError;
    }

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: error.message
  });
});

const { authenticateToken } = require('./middleware/auth.cjs');

// Ruta del dashboard delegada al router externo
app.use('/api/dashboard', require('./routes/dashboard.cjs'));

// Ruta para obtener información del administrador autenticado
app.get('/api/admin/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');

    // Verificar token JWT
    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin-secret-key');

    // Buscar sesión activa y admin
    const [sessionRows] = await pool.execute(`
      SELECT s.*, a.* FROM admin_sessions s
      JOIN admin_users a ON s.admin_user_id = a.id
      WHERE s.expires_at > NOW() AND a.is_active = true
    `);

    // Verificar el token hash
    let validSession = null;
    for (const session of sessionRows) {
      if (await bcrypt.compare(token, session.token_hash)) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      return res.status(401).json({
        success: false,
        message: 'Sesión inválida o expirada'
      });
    }

    const admin = validSession;

    // Preparar respuesta sin datos sensibles
    const { password_hash, two_factor_secret, ...safeAdmin } = admin;

    res.json({
      success: true,
      admin: safeAdmin
    });

  } catch (error) {
    console.error('Error obteniendo información del administrador:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

// Importar y configurar rutas adicionales
const alertsRoutes = require('./routes/alerts.cjs');
const aiRoutes = require('./routes/ai.cjs');
const adminRoutes = require('./routes/admin.cjs');
const adminDashboardRoutes = require('./routes/admin/dashboard.cjs');
const adminReportsRoutes = require('./routes/admin/reports.cjs');
const adminSecurityRoutes = require('./routes/admin/security.cjs');
const adminUsersRoutes = require('./routes/admin/users.cjs');
const adminCoffeeGrowersRoutes = require('./routes/admin/coffee-growers.cjs');
const adminFarmsRoutes = require('./routes/admin/farms.cjs');
const adminSubscriptionsRoutes = require('./routes/admin/subscriptions.cjs');
const adminSubscriptionPlansRoutes = require('./routes/admin/subscription-plans.cjs');
const adminPaymentsRoutes = require('./routes/admin/payments.cjs');
const adminAnalyticsRoutes = require('./routes/admin/analytics.cjs');
const adminAuditRoutes = require('./routes/admin/audit.cjs');
const adminProfileRoutes = require('./routes/admin/profile.cjs');
const workersRoutes = require('./routes/workers.cjs');
const dashboardRoutes = require('./routes/dashboard.cjs');

// Configurar rutas de alertas, AI y admin
app.use('/api/alerts', alertsRoutes);
app.use('/api/ai', aiRoutes);
// Montar dashboard router ANTES de admin router para que tenga prioridad
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/reports', adminReportsRoutes);
app.use('/api/admin/security', adminSecurityRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/coffee-growers', adminCoffeeGrowersRoutes);
app.use('/api/admin/farms', adminFarmsRoutes);
app.use('/api/admin/subscriptions', adminSubscriptionsRoutes);
app.use('/api/admin/subscription-plans', adminSubscriptionPlansRoutes);
app.use('/api/admin/payments', adminPaymentsRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/audit', adminAuditRoutes);
app.use('/api/admin/profile', adminProfileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workers', authenticateToken, workersRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Servir archivos estáticos del frontend (build de Vite)
const frontendPath = path.join(__dirname, '..', 'dist');
app.use(express.static(frontendPath));

// Fallback para SPA - servir index.html para todas las rutas que no sean API
app.get('*', (req, res) => {
  // Si la ruta comienza con /api, devolver error 404 para API
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'Ruta de API no encontrada',
      path: req.originalUrl
    });
  }

  // Para todas las demás rutas, servir el index.html (SPA fallback)
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Iniciar servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor Café Colombia...');

    // Probar conexión a MySQL
    console.log('🔌 Probando conexión a MySQL...');
    const mysqlConnected = await testMySQLConnection();

    if (mysqlConnected) {
      console.log('✅ Conexión a MySQL exitosa');
    } else {
      console.log('⚠️  Advertencia: No se pudo conectar a MySQL');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🎉 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Health check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`📍 API base: http://0.0.0.0:${PORT}/api`);
      console.log('');
      console.log('📋 Configuración de base de datos:');
      console.log(`   Host: ${dbConfig.host}`);
      console.log(`   Usuario: ${dbConfig.user}`);
      console.log(`   Base de datos: ${dbConfig.database}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();