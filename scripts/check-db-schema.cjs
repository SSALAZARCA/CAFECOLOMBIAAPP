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

async function checkSchema() {
    let connection;
    try {
        console.log('Connecting to DB...');
        connection = await mysql.createConnection(dbConfig);

        // Check Column Type
        console.log('Checking "role" column in "users" table...');
        const [columns] = await connection.execute(
            `SELECT COLUMN_TYPE 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`,
            [dbConfig.database]
        );

        if (columns.length > 0) {
            console.log('Column Type:', columns[0].COLUMN_TYPE);
        } else {
            console.log('Column "role" not found!');
        }

        // Check the user record
        const email = 'ssalazarca84@gmail.com';
        console.log(`Checking user record for: ${email}`);
        const [users] = await connection.execute('SELECT id, email, role FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            console.log('User Record:', users[0]);
        } else {
            console.log('User not found in DB.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkSchema();
