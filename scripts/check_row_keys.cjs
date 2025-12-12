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

async function checkRow() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log('--- HARVEST ROW KEYS ---');
        const [rows] = await connection.execute('SELECT * FROM harvests LIMIT 1');
        if (rows.length > 0) {
            console.log(JSON.stringify(Object.keys(rows[0]), null, 2));
        } else {
            console.log('Harvests table is empty, cannot verify columns by SELECT.');
            // Fallback to DESCRIBE if empty
            const [cols] = await connection.execute('SHOW COLUMNS FROM harvests');
            console.log('SHOW COLUMNS:', cols.map(c => c.Field));
        }

        console.log('\n--- TASK ROW KEYS ---');
        const [taskRows] = await connection.execute('SELECT * FROM agricultural_tasks LIMIT 1');
        if (taskRows.length > 0) {
            console.log(JSON.stringify(Object.keys(taskRows[0]), null, 2));
        } else {
            const [cols] = await connection.execute('SHOW COLUMNS FROM agricultural_tasks');
            console.log('SHOW COLUMNS:', cols.map(c => c.Field));
        }

        console.log('\n--- LOT ROW KEYS ---');
        const [lotRows] = await connection.execute('SELECT * FROM lots LIMIT 1');
        if (lotRows.length > 0) {
            console.log(JSON.stringify(Object.keys(lotRows[0]), null, 2));
        } else {
            const [cols] = await connection.execute('SHOW COLUMNS FROM lots');
            console.log('SHOW COLUMNS:', cols.map(c => c.Field));
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkRow();
