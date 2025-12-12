const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../api/server.cjs');
let content = fs.readFileSync(file, 'utf8');

// Reemplazar /admin/dashboard/charts con /api/admin/dashboard/charts
content = content.replace(
    "app.get('/admin/dashboard/charts'",
    "app.get('/api/admin/dashboard/charts'"
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Endpoint /api/admin/dashboard/charts corregido');
