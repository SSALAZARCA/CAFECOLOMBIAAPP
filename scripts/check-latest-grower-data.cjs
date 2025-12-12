const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
    else dotenv.config();
} catch (e) { }

const dbConfig = {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'srv1196.hstgr.io',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306'),
    user: process.env.DB_USER || process.env.MYSQL_USER || 'u689528678_SSALAZARCA',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'u689528678_CAFECOLOMBIA',
    ssl: { rejectUnauthorized: false }
};

async function checkFarms() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log('--- Latest 3 Farms ---');
        const [farms] = await connection.execute(`
      SELECT id, name, created_at, coffee_grower_id 
      FROM farms 
      ORDER BY id DESC LIMIT 3
    `);
        console.log(JSON.stringify(farms, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkFarms();
