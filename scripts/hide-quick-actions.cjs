const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/pages/admin/AdminDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

// Simplemente comentar la línea que renderiza QuickActionsPanel
content = content.replace(
    '      <QuickActionsPanel />',
    '      {/* <QuickActionsPanel /> */} {/* OCULTADO: Contiene datos hardcodeados */}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ QuickActionsPanel ocultado en AdminDashboard.tsx');
