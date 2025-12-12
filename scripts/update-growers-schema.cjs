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

async function addPasswordColumn() {
    let connection;
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected.');

        // Verificar si la columna ya existe
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'coffee_growers' AND COLUMN_NAME = 'password_hash'
        `, [dbConfig.database]);

        if (columns.length > 0) {
            console.log('ℹ️ La columna password_hash ya existe en coffee_growers.');
        } else {
            console.log('🛠️ Agregando columna password_hash a coffee_growers...');
            await connection.execute(`
                ALTER TABLE coffee_growers 
                ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL AFTER email
            `);
            console.log('✅ Columna agregada exitosamente.');
        }

    } catch (error) {
        console.error('❌ Error updating table:', error);
    } finally {
        if (connection) await connection.end();
    }
}

addPasswordColumn();
