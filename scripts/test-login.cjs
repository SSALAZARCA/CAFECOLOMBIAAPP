const axios = require('axios');

async function testLogin() {
    try {
        console.log('Attempting login...');
        const response = await axios.post('http://127.0.0.1:3001/api/auth/login', {
            email: 'ssalazarca84@gmail.com',
            password: 'cafe123'
        });

        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Data:', JSON.stringify(response.data, null, 2));

        if (response.data.user) {
            console.log('✅ User object present');
            console.log('User Role:', response.data.user.role);
        } else {
            console.error('❌ User object MISSING in response');
        }

    } catch (error) {
        if (error.response) {
            console.log('Login failed with status:', error.response.status);
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
