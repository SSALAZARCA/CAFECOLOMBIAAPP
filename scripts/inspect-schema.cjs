const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cafe_colombia'
};

async function inspectSchema() {
    console.log('🔍 Inspecting Database Schema...');
    let connection;
    const results = {};

    try {
        connection = await mysql.createConnection(dbConfig);

        const tables = ['users', 'farms', 'harvests'];

        for (const table of tables) {
            try {
                const [columns] = await connection.execute(`DESCRIBE ${table}`);
                results[table] = columns;
            } catch (err) {
                console.error(`❌ Error describing table ${table}:`, err.message);
                results[table] = { error: err.message };
            }
        }

        fs.writeFileSync(path.join(__dirname, '..', 'schema.json'), JSON.stringify(results, null, 2));
        console.log('✅ Schema written to schema.json');

    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

inspectSchema();
