import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

export default function HomeSimple() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testDatabaseConnection = async () => {
      try {
        console.log('🧪 Probando conexión a la base de datos...');
        
        // Importar dinámicamente para capturar errores
        const { offlineDB } = await import('@/utils/offlineDB');
        console.log('✅ Módulo offlineDB importado correctamente');
        
        // Probar abrir la base de datos
        await offlineDB.open();
        console.log('✅ Base de datos abierta correctamente');
        
        // Probar una consulta simple
        const count = await offlineDB.lots.count();
        console.log('✅ Consulta ejecutada correctamente, lotes:', count);
        
        setLoading(false);
        
      } catch (err) {
        console.error('❌ Error en la prueba de base de datos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };

    testDatabaseConnection();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-xl font-semibold mb-4">🔄 Probando conexión...</h1>
            <p className="text-gray-600">Verificando base de datos offline...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-red-500">
            <h1 className="text-xl font-semibold text-red-600 mb-4">❌ Error de Base de Datos</h1>
            <p className="text-gray-600 mb-4">Se encontró un error al conectar con la base de datos:</p>
            <div className="bg-red-50 p-4 rounded">
              <code className="text-red-800 text-sm">{error}</code>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-green-500">
          <h1 className="text-xl font-semibold text-green-600 mb-4">✅ Conexión Exitosa</h1>
          <p className="text-gray-600">La base de datos offline está funcionando correctamente.</p>
        </div>
      </div>
    </Layout>
  );
}