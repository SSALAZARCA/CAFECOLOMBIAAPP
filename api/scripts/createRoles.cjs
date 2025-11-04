const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno desde api/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function createRolesTable() {
  let connection;
  try {
    const dbConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      timezone: '+00:00',
      ssl: { rejectUnauthorized: false }
    };

    console.log('🔌 Conectando a MySQL para crear tabla roles...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión establecida');

    const createSQL = `
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log('📋 Creando tabla roles si no existe...');
    await connection.execute(createSQL);
    console.log('✅ Tabla roles verificada/creada');

    // Insertar roles por defecto si no existen
    const defaultRoles = [
      { name: 'admin', description: 'Administrador del sistema', is_default: true },
      { name: 'manager', description: 'Gestor con permisos extendidos', is_default: false },
      { name: 'viewer', description: 'Usuario con permisos de solo lectura', is_default: false }
    ];

    for (const role of defaultRoles) {
      await connection.execute(
        `INSERT INTO roles (name, description, is_default)
         SELECT ?, ?, ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = ?)`,
        [role.name, role.description, role.is_default, role.name]
      );
    }

    console.log('🎉 Roles por defecto insertados/verificados');
  } catch (error) {
    console.error('❌ Error creando tabla roles:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

createRolesTable();