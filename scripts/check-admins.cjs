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

async function checkUser() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const [rows] = await connection.execute(
            "SELECT id, firstName, lastName, email, role FROM users WHERE email = 'admin@cafecolombia.com'"
        );

        console.log('\n--- Test User ---');
        console.table(rows);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUser();
