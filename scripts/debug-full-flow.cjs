const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fetch = global.fetch || require('node-fetch'); // Fallback if global fetch missing (unlikely in Node 18)

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://127.0.0.1:3001/api';

const dbConfig = {
    host: process.env.DB_HOST || 'srv1196.hstgr.io',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'u689528678_SSALAZARCA',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u689528678_CAFECOLOMBIA',
    ssl: { rejectUnauthorized: false }
};

async function testFlow() {
    let connection;
    try {
        console.log('🧪 Starting Full Flow Debug...');
        console.log(`📍 Targeting API: ${BASE_URL}`);

        const testUser = {
            name: "Debug User 2",
            email: `debug_fix_${Date.now()}@test.com`,
            password: "password123",
            farmName: "Debug Farm",
            phone: "3001234567"
        };

        // 1. REGISTER
        console.log(`\n📝 Registering user: ${testUser.email}`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const regData = await regRes.json();
        console.log(`Registration Status: ${regRes.status}`);
        // console.log('Registration Response:', JSON.stringify(regData, null, 2));

        if (!regRes.ok) {
            console.error('Registration failed:', regData);
            // Don't throw yet, check DB
        }

        // 2. CHECK DB
        console.log('\n🔍 Verifying DB insertion...');
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM coffee_growers WHERE email = ?',
            [testUser.email]
        );
        console.log('DB Record:', rows.length > 0 ? '✅ Found' : '❌ NOT FOUND');
        if (rows.length > 0) {
            console.log('DB Entry:', rows[0].email, rows[0].password_hash ? '(Has Password)' : '(No Password)');
        }

        // 3. LOGIN
        if (rows.length > 0) {
            console.log('\n🔐 Attempting Login...');
            const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password
                })
            });

            const loginData = await loginRes.json();
            console.log(`Login Status: ${loginRes.status}`);
            console.log('Login Response:', JSON.stringify(loginData, null, 2));
        }

    } catch (error) {
        console.error('❌ Error during flow:', error);
    } finally {
        if (connection) await connection.end();
    }
}

testFlow();
