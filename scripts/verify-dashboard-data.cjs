const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkDashboardData() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'srv1196.hstgr.io',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'u689528678_SSALAZARCA',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'u689528678_CAFECOLOMBIA',
            ssl: { rejectUnauthorized: false }
        });

        console.log('✅ Conectado a la base de datos\n');

        // Verificar usuarios
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log('👥 Usuarios totales:', users[0].count);

        // Verificar administradores
        const [admins] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "ADMINISTRADOR"');
        console.log('👑 Administradores:', admins[0].count);

        // Verificar fincas
        const [farms] = await connection.execute('SELECT COUNT(*) as count FROM farms');
        console.log('🏡 Fincas:', farms[0].count);

        // Verificar usuarios recientes
        const [recentUsers] = await connection.execute(`
      SELECT DATE(createdAt) as date, COUNT(*) as count 
      FROM users 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 5
    `);
        console.log('\n📊 Usuarios creados en últimos 30 días:');
        recentUsers.forEach(row => {
            console.log(`  ${row.date}: ${row.count} usuarios`);
        });

        await connection.end();
        console.log('\n✅ Verificación completada');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkDashboardData();
