const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:3002/api';

async function verifyWorkerAdd() {
    try {
        console.log('🔄 Starting Worker Addition Verification...');

        // 1. Login
        console.log('🔑 Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'ssalazarca84@gmail.com',
            password: '123456'
        });
        const token = loginRes.data.data.token;
        console.log('✅ Login successful.');

        // 2. Add Worker
        console.log('👷 Adding Worker...');
        const workerData = {
            name: "Juan Perez TEST",
            role: "RECOLECTOR",
            phone: "3219876543"
        };

        try {
            const addRes = await axios.post(`${BASE_URL}/workers`, workerData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Worker added:', addRes.data);
        } catch (addError) {
            console.error('❌ Error adding worker:', addError.response?.data || addError.message);
            return;
        }

        // 3. Verify List
        console.log('📋 Fetching Workers...');
        const listRes = await axios.get(`${BASE_URL}/workers`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const worker = listRes.data.find(w => w.name === workerData.name);

        if (worker) {
            console.log('🎉 SUCCESS: Worker found in list:', worker);
        } else {
            console.error('❌ FAILURE: Worker added but not found in list.');
        }

    } catch (error) {
        console.error('❌ Error during verification:', error.response?.data || error.message);
    }
}

verifyWorkerAdd();
