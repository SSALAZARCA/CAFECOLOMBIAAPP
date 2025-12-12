const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'srv1196.hstgr.io',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306'),
    user: process.env.DB_USER || process.env.MYSQL_USER || 'u689528678_SSALAZARCA',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'u689528678_CAFECOLOMBIA',
    ssl: { rejectUnauthorized: false }
};

async function createAdmin() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Check if admin exists
        const [existing] = await connection.execute(
            "SELECT id FROM users WHERE email = 'admin@cafecolombia.com'"
        );

        if (existing.length === 0) {
            await connection.execute(
                `INSERT INTO users (firstName, lastName, email, password, role, isActive) 
         VALUES ('Admin', 'Principal', 'admin@cafecolombia.com', 'admin123', 'admin', 1)`
            );
            console.log('✅ Admin user created: admin@cafecolombia.com / admin123');
        } else {
            console.log('ℹ️ Admin user already exists.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

createAdmin();