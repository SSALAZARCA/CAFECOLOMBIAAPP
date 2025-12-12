const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/pages/admin/AdminAnalytics.tsx');
let content = fs.readFileSync(file, 'utf8');

// Reemplazar /admin/analytics con /api/admin/analytics
content = content.replace(
    "adminHttpClient.get(`/admin/analytics?period=${selectedPeriod}`)",
    "adminHttpClient.get(`/api/admin/analytics?period=${selectedPeriod}`)"
);

content = content.replace(
    "adminHttpClient.get(\n        `/admin/analytics/export?format=${format}&period=${selectedPeriod}`,",
    "adminHttpClient.get(\n        `/api/admin/analytics/export?format=${format}&period=${selectedPeriod}`,"
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ AdminAnalytics.tsx corregido');
