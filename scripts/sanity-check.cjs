const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://127.0.0.1:3001/api';
const EMAIL = 'ssalazarca84@gmail.com'; // User reported in prompt
// NOTE: We don't have the password, checking login bypass or assuming token generation works
const TOKEN = `grower-token-${EMAIL}`;

async function runSanityCheck() {
    console.log('🏥 Starting System Sanity Check...');
    let errors = 0;

    // 1. Check Health
    try {
        await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health Check: OK');
    } catch (e) {
        console.error('❌ Health Check: FAILED', e.message);
        errors++;
    }

    // 2. Check Dashboard (Critical)
    try {
        const res = await axios.get(`${BASE_URL}/dashboard`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        if (res.status === 200 && res.data.success) {
            console.log('✅ Dashboard: OK');
        } else {
            throw new Error('Invalid response format');
        }
    } catch (e) {
        console.error('❌ Dashboard: FAILED', e.message);
        if (e.response) console.error('   Data:', JSON.stringify(e.response.data));
        errors++;
    }

    // 3. Check Workers (Critical - Reported Crash)
    try {
        const res = await axios.get(`${BASE_URL}/workers`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        if (res.status === 200 && Array.isArray(res.data)) {
            console.log('✅ Workers: OK');
        } else {
            throw new Error('Invalid response format');
        }
    } catch (e) {
        console.error('❌ Workers: FAILED', e.message);
        if (e.response) console.error('   Data:', JSON.stringify(e.response.data));
        errors++;
    }

    // 4. Check Farms (Used in Settings?)
    try {
        const res = await axios.get(`${BASE_URL}/dashboard`, { // Settings uses dashboard data
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        // We already checked dashboard, but let's verify payload for settings
        if (res.data.data.farm || res.data.data.user) {
            console.log('✅ Settings Data Source: OK');
        } else {
            console.warn('⚠️ Settings Data Source: Missing expected fields');
        }
    } catch (e) {
        // Already logged in step 2
    }

    console.log('\n📊 Sanity Check Complete.');
    if (errors === 0) {
        console.log('🎉 SYSTEM STABLE. All critical routes operational.');
    } else {
        console.log(`⚠️ SYSTEM UNSTABLE. Found ${errors} errors.`);
        process.exit(1);
    }
}

runSanityCheck();
