const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
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

async function ensureUserAndFarm() {
    let connection;
    try {
        console.log('Connecting to DB...');
        connection = await mysql.createConnection(dbConfig);

        const email = 'ssalazarca84@gmail.com';
        const password = 'cafe123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 1. Check/Ensure User
        const [users] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
        let userId;

        if (users.length > 0) {
            console.log('User exists. Updating role and password...');
            userId = users[0].id;
            await connection.execute(
                'UPDATE users SET role = "coffee_grower", password = ?, isActive = 1 WHERE email = ?',
                [hashedPassword, email]
            );
            console.log('✅ User updated successfully.');
        } else {
            console.log('User does not exist. Creating new user...');
            userId = uuidv4();
            await connection.execute(
                `INSERT INTO users (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt) 
                 VALUES (?, ?, ?, 'Sebastian', 'Salazar', 'coffee_grower', true, NOW(), NOW())`,
                [userId, email, hashedPassword]
            );
            console.log('✅ User created successfully.');
        }

        // 2. Check/Ensure Farm
        const [farms] = await connection.execute('SELECT id FROM farms WHERE ownerId = ?', [userId]);
        if (farms.length === 0) {
            console.log('Creating default farm...');
            const farmId = uuidv4();
            // 使用 correct column: area (not totalArea)
            await connection.execute(
                `INSERT INTO farms (id, ownerId, name, location, area, altitude, isActive, createdAt, updatedAt)
                    VALUES (?, ?, 'Finca La Esperanza', 'Manizales, Caldas', 5.0, 1600, true, NOW(), NOW())`,
                [farmId, userId]
            );
            console.log('✅ Default farm created.');
        } else {
            console.log('Finca ya existe.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

ensureUserAndFarm();
