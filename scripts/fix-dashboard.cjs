const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/admin/AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Add AlertTriangle to imports (with Windows line endings)
content = content.replace(
    "  TrendingDown\r\n} from 'lucide-react';",
    "  TrendingDown,\r\n  AlertTriangle\r\n} from 'lucide-react';"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ AlertTriangle agregado correctamente');
