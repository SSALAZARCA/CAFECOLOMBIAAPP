const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../api/server.cjs');
let content = fs.readFileSync(file, 'utf8');

// Comentar la línea que monta adminRoutes
content = content.replace(
    "app.use('/api/admin', adminRoutes);",
    "// app.use('/api/admin', adminRoutes); // Comentado para evitar conflicto con endpoints del dashboard"
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ adminRoutes comentado para evitar conflicto');
