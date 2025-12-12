const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/pages/admin/AdminDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix 1: Cambiar la ruta de charts para agregar /api
content = content.replace(
    "adminHttpClient.get(`/admin/dashboard/charts?period=${selectedPeriod}`)",
    "adminHttpClient.get(`/api/admin/dashboard/charts?period=${selectedPeriod}`)"
);

// Fix 2: Agregar AlertTriangle al import
content = content.replace(
    "TrendingDown\n} from 'lucide-react';",
    "TrendingDown,\n  AlertTriangle\n} from 'lucide-react';"
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ AdminDashboard.tsx corregido:');
console.log('  - Ruta de charts corregida: /api/admin/dashboard/charts');
console.log('  - Import de AlertTriangle agregado');
