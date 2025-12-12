const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../api/server.cjs');
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Encontrar y eliminar las líneas 483-535 (endpoints mock duplicados)
const startLine = 482; // línea 483 en 1-indexed
const endLine = 535; // línea 535 en 1-indexed

// Eliminar las líneas
lines.splice(startLine, endLine - startLine + 1);

// Unir las líneas de nuevo
content = lines.join('\n');

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Endpoints mock eliminados (líneas 483-535)');
console.log('✅ Ahora el servidor usará solo los routers con datos reales');
