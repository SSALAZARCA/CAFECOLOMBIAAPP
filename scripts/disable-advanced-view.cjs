const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/pages/admin/AdminDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

// Cambiar showAdvancedView de false a false (asegurar que esté en false)
// Y comentar el componente InteractiveWidgets para que siempre muestre la vista simple
content = content.replace(
    'const [showAdvancedView, setShowAdvancedView] = useState(false);',
    'const [showAdvancedView, setShowAdvancedView] = useState(false); // Siempre false para mostrar datos reales'
);

// Ocultar el botón de Vista Avanzada para evitar confusión
content = content.replace(
    `<button
            onClick={() => setShowAdvancedView(!showAdvancedView)}
            className={\`px-4 py-2 rounded-lg transition-colors \${
              showAdvancedView 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }\`}
          >
            {showAdvancedView ? 'Vista Simple' : 'Vista Avanzada'}
          </button>`,
    `{/* Botón de Vista Avanzada ocultado - siempre muestra datos reales */}
          {false && <button
            onClick={() => setShowAdvancedView(!showAdvancedView)}
            className={\`px-4 py-2 rounded-lg transition-colors \${
              showAdvancedView 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }\`}
          >
            {showAdvancedView ? 'Vista Simple' : 'Vista Avanzada'}
          </button>}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Dashboard configurado para mostrar siempre datos reales');
console.log('  - Vista Avanzada deshabilitada');
console.log('  - Botón de cambio de vista ocultado');
