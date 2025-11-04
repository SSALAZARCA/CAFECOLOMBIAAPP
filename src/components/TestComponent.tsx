import React from 'react';

export default function TestComponent() {
  console.log('🧪 TestComponent renderizado correctamente');
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          ✅ Componente de Prueba
        </h1>
        <p className="text-gray-600">
          Si puedes ver este mensaje, React está funcionando correctamente.
        </p>
        <div className="mt-4 p-4 bg-green-50 rounded">
          <p className="text-green-800 text-sm">
            Timestamp: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}