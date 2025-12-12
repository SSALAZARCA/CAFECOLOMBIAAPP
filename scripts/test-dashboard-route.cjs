const axios = require('axios');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testDashboardAPI() {
    try {
        const token = `grower-token-ssalazarca84@gmail.com`; // Known valid token format for checking
        console.log('Testing dashboard API with token:', token);

        try {
            const response = await axios.get('http://127.0.0.1:3001/api/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Status:', response.status);
            console.log('Data Structure:', JSON.stringify(response.data, null, 2));

            if (response.data.success) {
                console.log('✅ Dashboard API Success');
            } else {
                console.error('❌ API returned success: false');
            }

        } catch (apiError) {
            console.error('API Error:', apiError.message);
            if (apiError.response) {
                console.log('Response data:', JSON.stringify(apiError.response.data, null, 2));
            }
        }

    } catch (error) {
        console.error('Script Error:', error);
    }
}

testDashboardAPI();
