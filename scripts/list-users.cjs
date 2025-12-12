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

async function listUsers() {
    let connection;
    try {
        console.log('Connecting to DB...');
        connection = await mysql.createConnection(dbConfig);

        console.log('Fetching users...');
        const [users] = await connection.execute('SELECT id, email, role, isActive FROM users');

        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log('--- USER ---');
            console.log(`Email: '${u.email}'`);
            console.log(`Role: '${u.role}'`);
            console.log(`ID: '${u.id}'`);
            console.log(`Active: ${u.isActive}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

listUsers();
