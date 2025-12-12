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

async function fixUserRole() {
    let connection;
    try {
        console.log('Connecting to DB...');
        connection = await mysql.createConnection(dbConfig);

        const email = 'ssalazarca84@gmail.com';
        console.log(`Checking user: ${email}`);

        const [users] = await connection.execute('SELECT id, email, role FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            console.log('User not found!');
        } else {
            console.log('Current user data:', users[0]);

            if (users[0].role !== 'coffee_grower') {
                console.log('Fixing role to "coffee_grower"...');
                await connection.execute('UPDATE users SET role = "coffee_grower" WHERE id = ?', [users[0].id]);
                console.log('Role updated.');
            } else {
                console.log('Role is already correct.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixUserRole();
