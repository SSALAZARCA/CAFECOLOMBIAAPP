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

async function diagnose() {
    const connection = await mysql.createConnection(dbConfig);
    let output = '';
    try {
        const tables = ['coffee_growers', 'farms', 'lots', 'harvests', 'agricultural_tasks'];

        for (const table of tables) {
            output += `\n--- TABLE: ${table} ---\n`;
            try {
                const [cols] = await connection.execute(`SHOW COLUMNS FROM ${table}`);
                output += cols.map(c => `${c.Field} (${c.Type})`).join(', ') + '\n';

                const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
                if (rows.length > 0) {
                    output += 'Sample Row Keys: ' + Object.keys(rows[0]).join(', ') + '\n';
                } else {
                    output += '(Table is empty)\n';
                }
            } catch (e) {
                output += `Error inspecting ${table}: ${e.message}\n`;
            }
        }

        fs.writeFileSync('db_columns.txt', output);
        console.log('Schema written to db_columns.txt');

    } catch (error) {
        console.error('Connection Error:', error.message);
    } finally {
        await connection.end();
    }
}

diagnose();
