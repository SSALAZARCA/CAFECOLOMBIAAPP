const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Buscar todos los archivos Admin*.tsx
const adminFiles = glob.sync(path.join(__dirname, '../src/pages/admin/Admin*.tsx'));

console.log(`📁 Encontrados ${adminFiles.length} archivos de administración\n`);

adminFiles.forEach(file => {
    const fileName = path.basename(file);
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Contar cuántas rutas sin /api hay
    const matches = content.match(/adminHttpClient\.(get|post|put|delete|patch)\('\/admin\//g);

    if (matches && matches.length > 0) {
        console.log(`🔧 ${fileName}: ${matches.length} rutas a corregir`);

        // Reemplazar todas las rutas de admin sin /api
        content = content.replace(/adminHttpClient\.(get|post|put|delete|patch)\('\/admin\//g, "adminHttpClient.$1('/api/admin/");

        fs.writeFileSync(file, content, 'utf8');
        modified = true;
    }

    if (modified) {
        console.log(`   ✅ Corregido\n`);
    } else {
        console.log(`   ✓ Ya está correcto\n`);
    }
});

console.log('✅ Todas las rutas de administración corregidas');
