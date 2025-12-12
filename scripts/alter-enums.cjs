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

async function alterEnum() {
    let connection;
    try {
        console.log('Connecting to DB...');
        connection = await mysql.createConnection(dbConfig);

        console.log('Altering "users" table "role" column...');
        // We include both 'CAFICULTOR' (if used by legacy) and 'coffee_grower' and old values.
        // Current: 'ADMINISTRADOR','TRABAJADOR','CERTIFICADOR'
        // New: 'ADMINISTRADOR','TRABAJADOR','CERTIFICADOR','coffee_grower'

        await connection.execute(
            `ALTER TABLE users 
             MODIFY COLUMN role ENUM('ADMINISTRADOR','TRABAJADOR','CERTIFICADOR','coffee_grower') 
             DEFAULT 'TRABAJADOR'`
        );

        console.log('✅ Schema updated successfully.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

alterEnum();
