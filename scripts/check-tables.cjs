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

async function checkTables() {
    let connection;
    try {
        console.log('Connecting to DB...');
        connection = await mysql.createConnection(dbConfig);

        console.log('\n--- Tables ---');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(tables.map(t => Object.values(t)[0]));

        console.log('\n--- Row Counts ---');
        try {
            const [users] = await connection.execute('SELECT COUNT(*) as c FROM users');
            console.log('users:', users[0].c);
        } catch (e) { console.log('users table error:', e.message); }

        try {
            const [growers] = await connection.execute('SELECT COUNT(*) as c FROM coffee_growers');
            console.log('coffee_growers:', growers[0].c);

            // Show sample grower
            const [sampleGrower] = await connection.execute('SELECT id, email FROM coffee_growers LIMIT 1');
            if (sampleGrower.length > 0) console.log('Sample Grower:', sampleGrower[0]);

        } catch (e) { console.log('coffee_growers table error:', e.message); }

        try {
            const [farms] = await connection.execute('SELECT COUNT(*) as c FROM farms');
            console.log('farms:', farms[0].c);
            // Show sample farm
            const [sampleFarm] = await connection.execute('SELECT id, ownerId, name FROM farms LIMIT 1');
            if (sampleFarm.length > 0) console.log('Sample Farm:', sampleFarm[0]);
        } catch (e) { console.log('farms table error:', e.message); }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkTables();
