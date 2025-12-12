const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cafe_colombia'
};

async function resetPassword() {
    console.log('🔐 Resetting password for ssalazarca84@gmail.com...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Hash password '123456'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const [result] = await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'ssalazarca84@gmail.com']
        );

        if (result.affectedRows > 0) {
            console.log('✅ Password updated successfully to "123456"');
        } else {
            console.log('❌ User not found or update failed');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

resetPassword();
