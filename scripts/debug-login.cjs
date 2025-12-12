const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:3002/api';

async function debugLogin() {
    try {
        console.log('🔍 Debugging Login Response...');
        console.log(`URL: ${BASE_URL}/auth/login`);

        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'ssalazarca84@gmail.com',
            password: '123456'
        });

        console.log('✅ Response Status:', res.status);
        console.log('📦 Raw Response Data (JSON):');
        console.log(JSON.stringify(res.data, null, 2));

        // Analyze structure
        const keys = Object.keys(res.data);
        console.log('🔑 Top Level Keys:', keys);

        if (res.data.data) {
            console.log('🔑 res.data.data Keys:', Object.keys(res.data.data));
            if (res.data.data.user) {
                console.log('👤 User found in res.data.data.user');
            } else {
                console.log('⚠️ No user in res.data.data');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

debugLogin();
