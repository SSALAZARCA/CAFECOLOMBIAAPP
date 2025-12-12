const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../api/server.cjs');
let content = fs.readFileSync(file, 'utf8');

// Agregar import del dashboard router
const importLine = "const adminRoutes = require('./routes/admin.cjs');";
const newImport = importLine + "\nconst adminDashboardRoutes = require('./routes/admin/dashboard.cjs');";
content = content.replace(importLine, newImport);

// Agregar mount del dashboard router ANTES del admin router
const mountLine = "app.use('/api/admin', adminRoutes);";
const newMount = "// Montar dashboard router ANTES de admin router para que tenga prioridad\napp.use('/api/admin/dashboard', adminDashboardRoutes);\n" + mountLine;
content = content.replace(mountLine, newMount);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Dashboard router agregado correctamente');
