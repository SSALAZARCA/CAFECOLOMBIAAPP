const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'srv1196.hstgr.io',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'u689528678_SSALAZARCA',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u689528678_CAFECOLOMBIA',
    ssl: { rejectUnauthorized: false }
};

async function resetDatabase() {
    let connection;
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected.');

        // Disable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Get all tables
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        console.log(`🗑️  Found ${tableNames.length} tables. Truncating...`);

        // Truncate all tables
        for (const table of tableNames) {
            try {
                await connection.query(`TRUNCATE TABLE \`${table}\``);
                console.log(`   - Truncated ${table}`);
            } catch (err) {
                console.error(`   ❌ Error truncating ${table}:`, err.message);
                // Fallback to DELETE if TRUNCATE fails (e.g. due to view or other constraint)
                try {
                    await connection.query(`DELETE FROM \`${table}\``);
                    console.log(`   - Deleted from ${table}`);
                } catch (err2) {
                    console.error(`   ❌ Error deleting from ${table}:`, err2.message);
                }
            }
        }

        // Enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✨ All tables cleared.');

        // Create Superadmin User
        console.log('👤 Creating Superadmin user...');
        const email = 'asalaza110@msn.com';
        const password = 'ssc841209';
        const hashedPassword = await bcrypt.hash(password, 10);
        const firstName = 'Super';
        const lastName = 'Admin';
        const role = 'ADMINISTRADOR';

        // Check if user exists (should not, but just in case)
        const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            // Update existing
            await connection.execute(
                'UPDATE users SET password = ?, firstName = ?, lastName = ?, role = ?, isActive = 1, updatedAt = NOW() WHERE email = ?',
                [hashedPassword, firstName, lastName, role, email]
            );
            console.log('   - User updated.');
        } else {
            // Insert new
            const id = 'user-' + Date.now(); // Simple ID generation
            await connection.execute(
                'INSERT INTO users (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())',
                [id, email, hashedPassword, firstName, lastName, role]
            );
            console.log('   - User created.');
        }

        console.log('✅ Database reset complete.');
        console.log(`   User: ${email}`);
        console.log(`   Pass: ${password}`);

    } catch (error) {
        console.error('❌ Error resetting database:', error);
    } finally {
        if (connection) await connection.end();
    }
}

resetDatabase();
