const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno
try {
    const isProduction = (process.env.NODE_ENV || 'development') === 'production';
    if (!isProduction) {
        const envPath = path.join(__dirname, '../../.env');
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
        } else {
            dotenv.config();
        }
    }
} catch (e) {
    console.warn('dotenv load skipped in db config:', e?.message);
}

const dbConfig = {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'srv1196.hstgr.io',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306'),
    user: process.env.DB_USER || process.env.MYSQL_USER || 'u689528678_SSALAZARCA',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'u689528678_CAFECOLOMBIA',
    charset: 'utf8mb4',
    timezone: '+00:00',
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

module.exports = {
    pool,
    dbConfig
};
