const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'srv1196.hstgr.io',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'u689528678_SSALAZARCA',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u689528678_CAFECOLOMBIA',
    ssl: { rejectUnauthorized: false }
};

async function createTable() {
    let connection;
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected.');

        console.log('🛠️ Creating coffee_growers table...');

        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS coffee_growers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                identification_number VARCHAR(50),
                identification_type VARCHAR(20) DEFAULT 'cedula',
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255),
                phone VARCHAR(50),
                department VARCHAR(100),
                municipality VARCHAR(100),
                total_farm_area DECIMAL(10,2) DEFAULT 0,
                coffee_area DECIMAL(10,2) DEFAULT 0,
                preferred_varieties TEXT,
                status VARCHAR(20) DEFAULT 'active',
                created_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.execute(createTableSQL);
        console.log('✅ Table coffee_growers created successfully.');

    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        if (connection) await connection.end();
    }
}

createTable();
