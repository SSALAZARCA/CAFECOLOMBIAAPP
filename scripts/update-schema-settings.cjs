const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cafe_colombia'
};

async function updateSchema() {
    console.log('🏗️ Updating Schema for Settings...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // 1. Add phone to users
        try {
            await connection.execute(`ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email`);
            console.log('✅ Added phone to users');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('ℹ️ Phone column already exists in users');
            else console.error('❌ Error adding phone to users:', e.message);
        }

        // 2. Add columns to farms
        const farmColumns = [
            'department VARCHAR(100) NULL',
            'municipality VARCHAR(100) NULL',
            'address VARCHAR(255) NULL',
            'soil_type VARCHAR(50) NULL',
            'processing_method VARCHAR(50) NULL',
            'coffee_varieties TEXT NULL' // Store as comma-separated or JSON
        ];

        for (const colDef of farmColumns) {
            const colName = colDef.split(' ')[0];
            try {
                await connection.execute(`ALTER TABLE farms ADD COLUMN ${colDef}`);
                console.log(`✅ Added ${colName} to farms`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') console.log(`ℹ️ ${colName} column already exists in farms`);
                else console.error(`❌ Error adding ${colName} to farms:`, e.message);
            }
        }

    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
