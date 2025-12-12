import React, { useState, useEffect } from 'react';
import { X, Save, ClipboardList, AlertTriangle } from 'lucide-react';
import { FarmWorker, LotSimple } from '@/types/workers';

interface TaskAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    worker: FarmWorker;
    onSave: (data: { workerId: string; lotId: string; type: string; description: string; scheduledDate: string }) => Promise<void>;
}

export default function TaskAssignmentModal({ isOpen, onClose, worker, onSave }: TaskAssignmentModalProps) {
    const [lots, setLots] = useState<LotSimple[]>([]);
    const [lotId, setLotId] = useState('');
    const [type, setType] = useState('RECOLECCION');
    const [description, setDescription] = useState('');
    const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadLots();
        }
    }, [isOpen]);

    const loadLots = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/workers/lots', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLots(data);
                if (data.length > 0) setLotId(data[0].id);
            }
        } catch (error) {
            console.error('Error loading lots', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                workerId: worker.id,
                lotId,
                type,
                description,
                scheduledDate
            });
            onClose();
            setDescription('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const taskTypes = [
        'RECOLECCION', 'FERTILIZACION', 'PODA', 'FUMIGACION', 'LIMPIEZA', 'MANTENIMIENTO'
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-amber-600" />
                            Asignar Tarea
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Para: {worker.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Labor</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            {taskTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lote / Ubicación</label>
                        <select
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                            value={lotId}
                            onChange={(e) => setLotId(e.target.value)}
                        >
                            <option value="" disabled>Seleccione un lote</option>
                            {lots.map(lot => (
                                <option key={lot.id} value={lot.id}>{lot.name}</option>
                            ))}
                        </select>
                        {lots.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Cree lotes antes de asignar tareas.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Programada</label>
                        <input
                            type="date"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Notas</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detalles adicionales de la tarea..."
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Asignar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
