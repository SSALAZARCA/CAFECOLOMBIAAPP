```javascript
const axios = require('axios');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Config
const BASE_URL = 'http://localhost:3001/api'; // Assuming default port
const SECRET_KEY = 'tu_secreto_jwt'; // Adjust if different in .env

const dbConfig = {
    host: process.env.DB_HOST || 'srv1196.hstgr.io',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'u689528678_SSALAZARCA',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u689528678_CAFECOLOMBIA',
    ssl: { rejectUnauthorized: false }
};
        }, {
            headers: { 'Authorization': `Bearer ${ token } ` }
        });

        console.log('✅ Success! Worker created.');
        console.log('   Response:', response.data);

    } catch (error) {
        console.error('❌ Request Failed!');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        } else {
            console.error('   Error:', error.message);
        }
    } finally {
        if (connection) await connection.end();
    }
}

testWorkerCreation();
```
