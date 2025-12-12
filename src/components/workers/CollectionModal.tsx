import React, { useState, useEffect } from 'react';
import { X, Save, Scale, AlertTriangle, Wifi, Bluetooth, RefreshCw } from 'lucide-react';
import { FarmWorker, LotSimple } from '@/types/workers';
import { bluetoothScaleService, ScaleData } from '@/services/bluetoothScaleService';
import { toast } from 'sonner';

interface CollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    worker: FarmWorker;
    onSave: (data: { workerId: string; lotId: string; quantityKg: number; method: 'MANUAL' | 'BASCULA'; notes: string }) => Promise<void>;
}

export default function CollectionModal({ isOpen, onClose, worker, onSave }: CollectionModalProps) {
    const [activeTab, setActiveTab] = useState<'MANUAL' | 'BASCULA'>('MANUAL');
    const [lots, setLots] = useState<LotSimple[]>([]);
    const [selectedLotId, setSelectedLotId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // Scale simulation states
    const [scaleStatus, setScaleStatus] = useState<'DISCONNECTED' | 'SCANNING' | 'CONNECTED'>('DISCONNECTED');
    const [scaleWeight, setScaleWeight] = useState<number>(0);

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
                if (data.length > 0) setSelectedLotId(data[0].id);
            }
        } catch (error) {
            console.error('Error loading lots', error);
        }
    };

    const handleConnectScale = async () => {
        setScaleStatus('SCANNING');
        setQuantity('');

        try {
            const connected = await bluetoothScaleService.connect(
                (data: ScaleData) => {
                    setScaleWeight(data.weight);
                    // Update the form input automatically with the latest weight
                    setQuantity(data.weight.toString());
                },
                (errorMessage) => {
                    console.error('Bluetooth error:', errorMessage);
                    toast.error(errorMessage);
                    setScaleStatus('DISCONNECTED');
                }
            );

            if (connected) {
                setScaleStatus('CONNECTED');
                toast.success('Báscula conectada correctamente');
            } else {
                setScaleStatus('DISCONNECTED');
            }
        } catch (error) {
            console.error('Failed to connect:', error);
            setScaleStatus('DISCONNECTED');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                workerId: worker.id,
                lotId: selectedLotId,
                quantityKg: parseFloat(quantity),
                method: activeTab,
                notes
            });
            onClose();
            setQuantity('');
            setNotes('');
            setScaleStatus('DISCONNECTED');
            setScaleWeight(0);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="bg-amber-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Scale className="h-6 w-6" />
                            Nueva Recolección
                        </h3>
                        <p className="text-amber-100 mt-1">{worker.name} - {worker.role}</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                        <button
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'MANUAL' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('MANUAL')}
                        >
                            Registro Manual
                        </button>
                        <button
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'BASCULA' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('BASCULA')}
                        >
                            <Bluetooth className="h-4 w-4" />
                            Conectar Báscula
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lote / Ubicación</label>
                            <select
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 transition-all bg-white"
                                value={selectedLotId}
                                onChange={(e) => setSelectedLotId(e.target.value)}
                            >
                                <option value="" disabled>Seleccione un lote</option>
                                {lots.map(lot => (
                                    <option key={lot.id} value={lot.id}>{lot.name}</option>
                                ))}
                            </select>
                            {lots.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    No hay lotes creados. Cree un lote primero.
                                </p>
                            )}
                        </div>

                        {activeTab === 'MANUAL' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 transition-all text-lg font-semibold"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-indigo-200 rounded-xl p-6 bg-indigo-50 text-center">
                                {scaleStatus === 'DISCONNECTED' && (
                                    <div className="space-y-3">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                            <Bluetooth className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600 font-medium">Báscula desconectada</p>
                                        <button
                                            type="button"
                                            onClick={handleConnectScale}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                        >
                                            Buscar Dispositivo
                                        </button>
                                    </div>
                                )}

                                {scaleStatus === 'SCANNING' && (
                                    <div className="space-y-3">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm relative">
                                            <Wifi className="h-8 w-8 text-indigo-500 animate-pulse" />
                                            <span className="absolute flex h-3 w-3 top-0 right-0">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                            </span>
                                        </div>
                                        <p className="text-indigo-700 font-medium animate-pulse">Buscando báscula cercana...</p>
                                    </div>
                                )}

                                {scaleStatus === 'CONNECTED' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center gap-2 text-green-700 bg-green-100 py-1 px-3 rounded-full mx-auto w-fit text-xs font-bold uppercase tracking-wider">
                                            <Bluetooth className="h-3 w-3" />
                                            Báscula Conectada
                                        </div>

                                        <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-200">
                                            <p className="text-gray-500 text-sm uppercase tracking-widest mb-1">Peso Detectado</p>
                                            <div className="text-5xl font-bold text-gray-900 font-mono tracking-tighter">
                                                {scaleWeight.toFixed(2)}
                                                <span className="text-xl text-gray-400 ml-2 font-sans font-normal">kg</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleConnectScale}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                            Recalibrar / Leer de nuevo
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Calidad, condiciones..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || (activeTab === 'BASCULA' && scaleStatus !== 'CONNECTED')}
                                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Registrar Cosecha
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
