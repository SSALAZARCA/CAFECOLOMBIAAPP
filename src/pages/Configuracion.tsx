import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface FarmConfig {
  name: string;
  department: string;
  municipality: string;
  address: string;
  sizeHectares: number | '';
  altitude: number | '';
  soilType: string;
  coffeeVarieties: string[];
  processingMethod: string;
}

interface ProfileConfig {
  fullName: string;
  email: string;
  phone: string;
}

export default function Configuracion() {
  const { user, isAuthenticated, isLoading, getToken } = useAuth();
  const navigate = useNavigate();

  const [farm, setFarm] = useState<FarmConfig>({
    name: '',
    department: '',
    municipality: '',
    address: '',
    sizeHectares: '',
    altitude: '',
    soilType: 'volcánico',
    coffeeVarieties: [],
    processingMethod: 'lavado'
  });

  const [profile, setProfile] = useState<ProfileConfig>({
    fullName: '',
    email: '',
    phone: ''
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Cargar datos del dashboard del caficultor para prellenar
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (isLoading) return;
        if (!isAuthenticated) {
          navigate('/login');
          return;
        }
        // Solo caficultor puede acceder
        const role = (user as any)?.role || (user as any)?.tipo_usuario;
        if (role && role !== 'coffee_grower') {
          setError('Acceso restringido. Solo para caficultores.');
          setLoading(false);
          return;
        }

        const token = getToken();
        if (!token) {
          navigate('/login');
          return;
        }

        setLoading(true);
        setError(null);

        const res = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          // En desarrollo puede fallar el proxy; continuar con valores vacíos
          throw new Error('No se pudo cargar la información del caficultor');
        }

        const data = await res.json();
        // Backend devuelve success/data según server.cjs o routes/dashboard
        const dashboard = data.data || data;

        if (dashboard?.farm) {
          const f = dashboard.farm;
          setFarm({
            name: f.name || '',
            department: f.department || '',
            municipality: f.municipality || '',
            address: f.address || '',
            sizeHectares: f.total_area ?? '',
            altitude: f.altitude ?? '',
            soilType: f.soil_type || 'volcánico',
            coffeeVarieties: (f.coffee_varieties?.split?.(',') || []),
            processingMethod: f.processing_method || 'lavado'
          });
        }

        if (dashboard?.grower) {
          const g = dashboard.grower;
          setProfile({
            fullName: g.full_name || '',
            email: dashboard.email || g.email || '',
            phone: g.phone || ''
          });
        }
      } catch (err: any) {
        console.warn('Configuración: error cargando dashboard', err?.message);
        setError(null); // no bloquear la página por errores de conexión en dev
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSavedMsg(null);

      // En esta versión, solo simulamos guardado local.
      // Integración real: POST/PUT a rutas de farms y coffee_growers.
      await new Promise((r) => setTimeout(r, 800));
      setSavedMsg('Configuración guardada localmente (modo demo).');
    } catch (err: any) {
      setError(err.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const toggleVariety = (v: string) => {
    setFarm((prev) => {
      const exists = prev.coffeeVarieties.includes(v);
      return {
        ...prev,
        coffeeVarieties: exists
          ? prev.coffeeVarieties.filter((x) => x !== v)
          : [...prev.coffeeVarieties, v]
      };
    });
  };

  const varieties = ['Castillo', 'Caturra', 'Bourbon', 'Tabi', 'Colombia'];
  const processingMethods = ['lavado', 'natural', 'honey', 'semi_lavado', 'experimental'];
  const soilTypes = ['volcánico', 'arcilloso', 'franco', 'arenoso', 'limoso'];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Configuración del Caficultor</h1>
      <p className="text-gray-600 mt-1">Gestiona tu perfil y los datos de tu finca.</p>

      {loading && (
        <div className="mt-4 text-gray-500">Cargando datos...</div>
      )}

      {!loading && error && (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8 mt-6">
          {/* Perfil */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">Perfil del Usuario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm text-gray-600">Nombre completo</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Teléfono</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+57 300 000 0000"
                />
              </div>
            </div>
          </section>

          {/* Finca */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800">Configuración de la Finca</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm text-gray-600">Nombre de la finca</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={farm.name}
                  onChange={(e) => setFarm({ ...farm, name: e.target.value })}
                  placeholder="Ej: La Esperanza"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Departamento</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={farm.department}
                  onChange={(e) => setFarm({ ...farm, department: e.target.value })}
                  placeholder="Ej: Huila"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Municipio</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={farm.municipality}
                  onChange={(e) => setFarm({ ...farm, municipality: e.target.value })}
                  placeholder="Ej: Pitalito"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Dirección</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={farm.address}
                  onChange={(e) => setFarm({ ...farm, address: e.target.value })}
                  placeholder="Vereda, referencia"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Tamaño (ha)</label>
                <input
                  type="number"
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={farm.sizeHectares}
                  onChange={(e) => setFarm({ ...farm, sizeHectares: e.target.value === '' ? '' : Number(e.target.value) })}
                  placeholder="Ej: 5.5"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Altitud (msnm)</label>
                <input
                  type="number"
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={farm.altitude}
                  onChange={(e) => setFarm({ ...farm, altitude: e.target.value === '' ? '' : Number(e.target.value) })}
                  placeholder="Ej: 1650"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Tipo de suelo</label>
                <select
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={farm.soilType}
                  onChange={(e) => setFarm({ ...farm, soilType: e.target.value })}
                >
                  {soilTypes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-gray-600">Variedades de café</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {varieties.map((v) => {
                  const active = farm.coffeeVarieties.includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => toggleVariety(v)}
                      className={`px-3 py-1 rounded border text-sm ${active ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-gray-300 text-gray-700'}`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-gray-600">Método de procesamiento</label>
              <select
                className="mt-1 w-full md:w-1/2 border rounded px-3 py-2"
                value={farm.processingMethod}
                onChange={(e) => setFarm({ ...farm, processingMethod: e.target.value })}
              >
                {processingMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Guardado */}
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar configuración'}
            </button>
            {savedMsg && (
              <span className="text-sm text-green-700">{savedMsg}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}