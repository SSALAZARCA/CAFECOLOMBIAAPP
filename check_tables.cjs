const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await connection.execute('SHOW TABLES');
    rows.forEach(row => console.log(Object.values(row)[0]));
    await connection.end();
}

main().catch(console.error);
