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

async function checkColumns() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log('--- HARVESTS TABLE ---');
        const [harvestCols] = await connection.execute('SHOW COLUMNS FROM harvests');
        console.log(harvestCols.map(c => c.Field).join(', '));

        console.log('\n--- AGRICULTURAL_TASKS TABLE ---');
        const [taskCols] = await connection.execute('SHOW COLUMNS FROM agricultural_tasks');
        console.log(taskCols.map(c => c.Field).join(', '));

        console.log('\n--- LOTS TABLE ---');
        const [lotCols] = await connection.execute('SHOW COLUMNS FROM lots');
        console.log(lotCols.map(c => c.Field).join(', '));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkColumns();
