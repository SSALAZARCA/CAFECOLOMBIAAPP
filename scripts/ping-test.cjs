const axios = require('axios');

async function ping() {
    try {
        console.log('Testing /api/ping-test...');
        const res = await axios.get('http://127.0.0.1:3002/api/ping-test');
        console.log('Response:', res.data);
    } catch (e) {
        console.error('Ping failed:', e.message, e.response?.data || '');
    }
}
ping();
