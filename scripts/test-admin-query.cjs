const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testQuery() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'srv1196.hstgr.io',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'u689528678_SSALAZARCA',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'u689528678_CAFECOLOMBIA',
            ssl: { rejectUnauthorized: false }
        });

        console.log('Probando diferentes consultas de administradores:\n');

        // Consulta 1: Con ADMINISTRADOR
        const [test1] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "ADMINISTRADOR"');
        console.log('1. role = "ADMINISTRADOR":', test1[0].count);

        // Consulta 2: Ver todos los roles
        const [roles] = await connection.execute('SELECT DISTINCT role FROM users');
        console.log('\n2. Roles existentes en la BD:');
        roles.forEach(r => console.log('  -', r.role));

        // Consulta 3: Ver todos los usuarios
        const [allUsers] = await connection.execute('SELECT id, email, role FROM users');
        console.log('\n3. Todos los usuarios:');
        allUsers.forEach(u => console.log(`  - ${u.email}: ${u.role}`));

        await connection.end();

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testQuery();
