const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cafe_colombia'
};

async function updateWorkerSchema() {
    console.log('🏗️ Updating Schema for Workers...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // 1. Create farm_workers table if not exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS farm_workers (
                id VARCHAR(36) PRIMARY KEY,
                farmId VARCHAR(36) NOT NULL,
                name VARCHAR(100) NOT NULL,
                role VARCHAR(50) DEFAULT 'RECOLECTOR',
                phone VARCHAR(20),
                isActive BOOLEAN DEFAULT TRUE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (farmId) REFERENCES farms(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Checked/Created farm_workers table');

        // 2. Create coffee_collections table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS coffee_collections (
                id VARCHAR(36) PRIMARY KEY,
                workerId VARCHAR(36) NOT NULL,
                lotId VARCHAR(36) NOT NULL,
                quantityKg DECIMAL(10, 2) NOT NULL,
                collectionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                method VARCHAR(50) DEFAULT 'MANUAL',
                notes TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (workerId) REFERENCES farm_workers(id) ON DELETE CASCADE,
                FOREIGN KEY (lotId) REFERENCES lots(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Checked/Created coffee_collections table');

        // 3. Create agricultural_tasks table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS agricultural_tasks (
                id VARCHAR(36) PRIMARY KEY,
                lotId VARCHAR(36) NOT NULL,
                assignedWorkerId VARCHAR(36),
                type VARCHAR(50) NOT NULL,
                description TEXT,
                scheduledDate DATE,
                status VARCHAR(20) DEFAULT 'PENDIENTE',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (lotId) REFERENCES lots(id) ON DELETE CASCADE,
                FOREIGN KEY (assignedWorkerId) REFERENCES farm_workers(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Checked/Created agricultural_tasks table');

    } catch (error) {
        console.error('❌ Schema update failed:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

updateWorkerSchema();
