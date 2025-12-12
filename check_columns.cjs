const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await connection.execute('DESCRIBE lots');
    rows.forEach(row => console.log(row.Field));
    await connection.end();
}

main().catch(console.error);
