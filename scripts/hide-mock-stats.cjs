const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/components/admin/QuickActionsPanel.tsx');
let content = fs.readFileSync(file, 'utf8');

// Ocultar la sección "Estado del Sistema" que tiene datos hardcodeados
// Buscar y comentar las líneas 205-229 que contienen la sección
content = content.replace(
    `      {/* Estadísticas del Sistema y Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estadísticas Rápidas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {systemStats.map((stat, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className={\`text-xs font-medium \${
                  stat.positive ? 'text-green-600' : 'text-red-600'
                }\`}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>
        </div>`,
    `      {/* Estadísticas del Sistema y Alertas */}
      <div className="grid grid-cols-1 gap-6">
        {/* Estadísticas Rápidas - OCULTADO: Mostraba datos hardcodeados (1,234 usuarios)
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {systemStats.map((stat, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className={\`text-xs font-medium \${
                  stat.positive ? 'text-green-600' : 'text-red-600'
                }\`}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>
        </div>
        */`
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ QuickActionsPanel.tsx actualizado:');
console.log('  - Sección "Estado del Sistema" con datos hardcodeados ocultada');
console.log('  - Solo se mostrarán las métricas reales del Dashboard');
