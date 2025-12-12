const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testWorkersAPI() {
    try {
        const token = `grower-token-ssalazarca84@gmail.com`;
        console.log('Testing Workers API with token:', token);

        try {
            const response = await axios.get('http://127.0.0.1:3001/api/workers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Status:', response.status);
            console.log('Data:', JSON.stringify(response.data, null, 2));

            if (response.status === 200) {
                console.log('✅ Workers API Success');
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

testWorkersAPI();
