import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { X, Coffee, MapPin, Leaf, Calendar, Users, Building } from 'lucide-react';
import { toast } from 'sonner';

interface FarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm?: any;
  onSave?: (farm: any) => void;
}

export default function FarmModal({ isOpen, onClose, farm, onSave }: FarmModalProps) {
  const { useAuthenticatedFetch } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coffeeGrowers, setCoffeeGrowers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    municipality: '',
    department: '',
    coffeeGrowerId: '',
    altitude: '',
    slopeType: 'moderate',
    soilType: 'volcanic',
    irrigation: 'drip',
    workers: '',
    certification: 'none',
    establishedDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadCoffeeGrowers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || '',
        area: String(farm.area || ''),
        municipality: farm.municipality || '',
        department: farm.department || '',
        coffeeGrowerId: String(farm.coffeeGrowerId || ''),
        altitude: String(farm.altitude || ''),
        slopeType: farm.slopeType || 'moderate',
        soilType: farm.soilType || 'volcanic',
        irrigation: farm.irrigation || 'drip',
        workers: String(farm.workers || ''),
        certification: farm.certification || 'none',
        establishedDate: farm.establishedDate || ''
      });
    } else {
      setFormData({
        name: '',
        area: '',
        municipality: '',
        department: '',
        coffeeGrowerId: '',
        altitude: '',
        slopeType: 'moderate',
        soilType: 'volcanic',
        irrigation: 'drip',
        workers: '',
        certification: 'none',
        establishedDate: ''
      });
    }
  }, [farm]);

  const mapBackendGrowerToSelect = (g: any) => ({
    id: String(g.id),
    name: g.full_name || `${g.first_name || ''} ${g.last_name || ''}`.trim() || g.email || 'Sin nombre'
  });

  const loadCoffeeGrowers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await useAuthenticatedFetch('/admin/coffee-growers');
      if (response.ok) {
        const payload = await response.json();
        const list = payload?.data?.data || payload?.data || [];
        const mapped = Array.isArray(list) ? list.map(mapBackendGrowerToSelect) : [];
        setCoffeeGrowers(mapped);
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err?.message || 'No se pudo cargar caficultores');
        toast.error(err?.message || 'No se pudo cargar caficultores');
      }
    } catch (e) {
      console.error('Error cargando caficultores:', e);
      setError('Error de conexión');
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const body = {
        name: formData.name,
        area: parseFloat(formData.area) || 0,
        municipality: formData.municipality,
        department: formData.department,
        coffeeGrowerId: formData.coffeeGrowerId ? parseInt(formData.coffeeGrowerId) : null,
        altitude: parseInt(formData.altitude) || null,
        slopeType: formData.slopeType,
        soilType: formData.soilType,
        irrigation: formData.irrigation,
        workers: parseInt(formData.workers) || 0,
        certification: formData.certification,
        establishedDate: formData.establishedDate
      };

      const response = await useAuthenticatedFetch('/admin/farms', {
        method: farm ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const saved = await response.json().catch(() => ({}));
        onSave?.(saved?.data || saved);
        toast.success('Finca guardada correctamente');
        onClose();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err?.message || 'Error al guardar la finca');
      }
    } catch (e) {
      console.error('Error guardando finca:', e);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">{farm ? 'Editar Finca' : 'Nueva Finca'}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la finca</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Caficultor</label>
                <select
                  name="coffeeGrowerId"
                  value={formData.coffeeGrowerId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Seleccionar caficultor</option>
                  {coffeeGrowers.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Área (ha)</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Municipio</label>
                <input
                  type="text"
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Departamento</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Altitud (msnm)</label>
                <input
                  type="number"
                  name="altitude"
                  value={formData.altitude}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de pendiente</label>
                <select
                  name="slopeType"
                  value={formData.slopeType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="flat">Plana</option>
                  <option value="moderate">Moderada</option>
                  <option value="steep">Empinada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de suelo</label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="volcanic">Volcánico</option>
                  <option value="clay">Arcilloso</option>
                  <option value="sandy">Arenoso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Riego</label>
                <select
                  name="irrigation"
                  value={formData.irrigation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="none">Sin riego</option>
                  <option value="drip">Goteo</option>
                  <option value="sprinkler">Aspersión</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Trabajadores</label>
                <input
                  type="number"
                  name="workers"
                  value={formData.workers}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Certificación</label>
                <select
                  name="certification"
                  value={formData.certification}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="none">Ninguna</option>
                  <option value="organic">Orgánica</option>
                  <option value="fairtrade">Fairtrade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de establecimiento</label>
                <input
                  type="date"
                  name="establishedDate"
                  value={formData.establishedDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg">Cancelar</button>
            <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}