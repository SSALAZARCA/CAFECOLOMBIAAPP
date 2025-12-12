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

async function checkLatestGrower() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        console.log('🔍 Checking latest coffee grower...');
        const [rows] = await connection.execute(
            'SELECT id, full_name, email, password_hash, created_at, status FROM coffee_growers ORDER BY id DESC LIMIT 1'
        );

        if (rows.length === 0) {
            console.log('❌ No growers found in database.');
        } else {
            console.log('✅ Latest grower:', rows[0]);
        }

        console.log('\n🔍 Checking users table...');
        const [users] = await connection.execute(
            'SELECT id, email, role, firstName FROM users ORDER BY id DESC LIMIT 5'
        );
        console.log('Users found:', users);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkLatestGrower();
