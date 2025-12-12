const fs = require('fs');
const path = require('path');

// Archivos a corregir
const files = [
    '../src/pages/admin/AdminProfile.tsx',
    '../src/pages/admin/AdminAnalytics.tsx'
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Reemplazar todas las rutas de admin sin /api
    content = content.replace(/adminHttpClient\.(get|post|put|delete|patch)\('\/admin\//g, "adminHttpClient.$1('/api/admin/");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corregido: ${file}`);
});

console.log('\n✅ Todas las rutas corregidas correctamente');
