const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testEndpoint() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'srv1196.hstgr.io',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'u689528678_SSALAZARCA',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'u689528678_CAFECOLOMBIA',
            ssl: { rejectUnauthorized: false }
        });

        console.log('Ejecutando las mismas consultas que el endpoint:\n');

        // Consulta 1: Usuarios totales
        const [usersCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log('✅ users:', usersCount[0].count);

        // Consulta 2: Administradores
        const [adminsCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "ADMINISTRADOR"');
        console.log('✅ admins:', adminsCount[0].count);

        // Consulta 3: Fincas
        const [farmsCount] = await connection.execute('SELECT COUNT(*) as count FROM farms');
        console.log('✅ farms:', farmsCount[0].count);

        await connection.end();

        console.log('\n📊 Respuesta del endpoint debería ser:');
        console.log(JSON.stringify({
            users: usersCount[0].count,
            admins: adminsCount[0].count,
            farms: farmsCount[0].count,
            configurations: 15,
            lastUpdate: new Date().toISOString()
        }, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testEndpoint();
