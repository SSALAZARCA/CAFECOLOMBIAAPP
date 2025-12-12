import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import apiClient from '@/services/apiClient';
import { Plus, Users, ClipboardList, Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { FarmWorker, CoffeeCollection } from '@/types/workers';
import WorkerModal from '@/components/workers/WorkerModal';
import CollectionModal from '@/components/workers/CollectionModal';
import TaskAssignmentModal from '@/components/workers/TaskAssignmentModal';
import { toast } from 'sonner';

export default function Workers() {
    const [workers, setWorkers] = useState<FarmWorker[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);

    // Selection states for modals
    const [selectedWorkerForCollection, setSelectedWorkerForCollection] = useState<FarmWorker | null>(null);
    const [selectedWorkerForTask, setSelectedWorkerForTask] = useState<FarmWorker | null>(null);

    // History expansion state
    const [expandedWorkerId, setExpandedWorkerId] = useState<string | null>(null);
    const [expandedHistory, setExpandedHistory] = useState<CoffeeCollection[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Log render state
    console.log('Rendering Workers component. Loading:', loading, 'Workers count:', workers.length);

    useEffect(() => {
        loadWorkers();
    }, []);

    const loadWorkers = async () => {
        try {
            const res = await apiClient.get('/workers');
            console.log('Workers Response:', res); // DEBUG
            if (res.success && Array.isArray(res.data)) {
                console.log('Setting workers payload:', JSON.stringify(res.data)); // DEBUG JSON
                setWorkers(res.data as FarmWorker[]);
            } else {
                console.warn('Workers response invalid:', res);
                setWorkers([]);
            }
        } catch (error) {
            console.error('Error loading workers', error);
            // toast.error('Error cargando trabajadores'); // Optional: suppress on init
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWorker = async (data: { name: string; role: string; phone: string }) => {
        try {
            await apiClient.post('/workers', data);
            toast.success('Trabajador creado correctamente');
            loadWorkers();
        } catch (error: any) {
            console.error('Error creating worker:', error);
            const msg = error.response?.data?.error || error.message || 'Error al crear trabajador';
            toast.error(msg);
        }
    };

    const handleSaveCollection = async (data: any) => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/workers/collections', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            toast.success('Recolección registrada exitosamente');
            // If viewing history of this worker, reload it
            if (expandedWorkerId === data.workerId) {
                loadHistory(data.workerId);
            }
        } else {
            toast.error('Error al registrar recolección');
        }
    };

    const handleAssignTask = async (data: any) => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/workers/tasks', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            toast.success('Tarea asignada correctamente');
        } else {
            toast.error('Error al asignar tarea');
        }
    };

    const loadHistory = async (workerId: string) => {
        setLoadingHistory(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/workers/${workerId}/collections`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setExpandedHistory(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const toggleHistory = (workerId: string) => {
        if (expandedWorkerId === workerId) {
            setExpandedWorkerId(null);
            setExpandedHistory([]);
        } else {
            setExpandedWorkerId(workerId);
            loadHistory(workerId);
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="h-8 w-8 text-amber-600" />
                            Colaboradores
                        </h1>
                        <p className="text-gray-600 mt-1">Gestiona tu equipo, asigna tareas y registra recolecciones</p>
                    </div>
                    <button
                        onClick={() => setIsWorkerModalOpen(true)}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo Trabajador
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Cargando equipo...</div>
                ) : workers.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No tienes trabajadores registrados</h3>
                        <p className="text-gray-500 mb-6">Comienza agregando a las personas que te ayudan en la finca.</p>
                        <button
                            onClick={() => setIsWorkerModalOpen(true)}
                            className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-200 transition-colors font-medium border border-amber-200"
                        >
                            Agregar mi primer colaborador
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {workers.map(worker => (
                            <div key={worker.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg">
                                            {(worker.name && worker.name.length > 0) ? worker.name.charAt(0) : '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">{worker.name || 'Sin Nombre'}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide border border-gray-200">
                                                    {worker.role}
                                                </span>
                                                {worker.phone && <span>• {worker.phone}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => setSelectedWorkerForTask(worker)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                        >
                                            <ClipboardList className="h-4 w-4" />
                                            Asignar Tarea
                                        </button>
                                        <button
                                            onClick={() => setSelectedWorkerForCollection(worker)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-sm transition-colors"
                                        >
                                            <Scale className="h-4 w-4" />
                                            Registrar Recolección
                                        </button>
                                        <button
                                            onClick={() => toggleHistory(worker.id)}
                                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {expandedWorkerId === worker.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Historial Desplegable */}
                                {expandedWorkerId === worker.id && (
                                    <div className="border-t border-gray-100 bg-gray-50 p-4 animate-in slide-in-from-top-2">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3 ml-1">Historial de Recolección</h4>
                                        {loadingHistory ? (
                                            <div className="text-center py-4 text-gray-400 text-sm">Cargando historial...</div>
                                        ) : expandedHistory.length === 0 ? (
                                            <div className="text-center py-4 text-gray-400 text-sm bg-white rounded-lg border border-gray-200">
                                                No hay recolecciones registradas.
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                                        <tr>
                                                            <th className="px-4 py-2">Fecha</th>
                                                            <th className="px-4 py-2">Lote</th>
                                                            <th className="px-4 py-2">Cantidad</th>
                                                            <th className="px-4 py-2">Método</th>
                                                            <th className="px-4 py-2">Notas</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {expandedHistory.map(item => (
                                                            <tr key={item.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-2 text-gray-600">{new Date(item.collectionDate).toLocaleDateString()}</td>
                                                                <td className="px-4 py-2 font-medium text-gray-800">{item.lotName || 'Lote desconocido'}</td>
                                                                <td className="px-4 py-2 text-amber-700 font-bold">{item.quantityKg} kg</td>
                                                                <td className="px-4 py-2">
                                                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${item.method === 'BASCULA' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                                        {item.method}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2 text-gray-500 italic truncate max-w-xs">{item.notes}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Modals */}
                <WorkerModal
                    isOpen={isWorkerModalOpen}
                    onClose={() => setIsWorkerModalOpen(false)}
                    onSave={handleCreateWorker}
                />

                {selectedWorkerForCollection && (
                    <CollectionModal
                        isOpen={!!selectedWorkerForCollection}
                        onClose={() => setSelectedWorkerForCollection(null)}
                        worker={selectedWorkerForCollection}
                        onSave={handleSaveCollection}
                    />
                )}

                {selectedWorkerForTask && (
                    <TaskAssignmentModal
                        isOpen={!!selectedWorkerForTask}
                        onClose={() => setSelectedWorkerForTask(null)}
                        worker={selectedWorkerForTask}
                        onSave={handleAssignTask}
                    />
                )}
            </div>
        </Layout>
    );
}
