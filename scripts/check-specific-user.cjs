const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cafe_colombia'
};

async function checkUser() {
    console.log('🔍 Checking user ssalazarca84@gmail.com...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [users] = await connection.execute(
            'SELECT id, email, firstName, lastName, role, isActive FROM users WHERE email = ?',
            ['ssalazarca84@gmail.com']
        );

        if (users.length === 0) {
            console.log('❌ User ssalazarca84@gmail.com NOT FOUND in DB.');
        } else {
            console.log('✅ User found:', users[0]);
            // Check farm
            const [farms] = await connection.execute(
                'SELECT * FROM farms WHERE ownerId = ?',
                [users[0].id]
            );
            if (farms.length === 0) {
                console.log('⚠️ User has NO farm.');
            } else {
                console.log('✅ User has farm:', farms[0].name);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkUser();
