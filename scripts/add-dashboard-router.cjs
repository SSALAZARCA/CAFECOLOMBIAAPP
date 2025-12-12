const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../api/server.cjs');
let content = fs.readFileSync(file, 'utf8');

// Descomentar adminRoutes
content = content.replace(
    "// app.use('/api/admin', adminRoutes); // Comentado para evitar conflicto con endpoints del dashboard",
    "app.use('/api/admin', adminRoutes);"
);

// Agregar import y mount del dashboard router justo después de adminRoutes
const importLine = "const adminRoutes = require('./routes/admin.cjs');";
const newImport = importLine + "\nconst adminDashboardRoutes = require('./routes/admin/dashboard.cjs');";

content = content.replace(importLine, newImport);

const mountLine = "app.use('/api/admin', adminRoutes);";
const newMount = mountLine + "\napp.use('/api/admin/dashboard', adminDashboardRoutes);";

content = content.replace(mountLine, newMount);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Dashboard router agregado correctamente');
