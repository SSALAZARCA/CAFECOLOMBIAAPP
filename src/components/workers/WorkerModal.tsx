import React, { useState } from 'react';
import { X, Save, User } from 'lucide-react';

interface WorkerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; role: string; phone: string }) => Promise<void>;
}

export default function WorkerModal({ isOpen, onClose, onSave }: WorkerModalProps) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('RECOLECTOR');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({ name, role, phone });
            onClose();
            setName('');
            setPhone('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <User className="h-5 w-5 text-amber-600" />
                        Nuevo Trabajador
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej. Pedro Pérez"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol / Cargo</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="RECOLECTOR">Recolector</option>
                            <option value="ENCARGADO">Encargado</option>
                            <option value="MAYORDOMO">Mayordomo</option>
                            <option value="GENERAL">Trabajador General</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (Opcional)</label>
                        <input
                            type="tel"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Ej. 300 123 4567"
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
                                    Guardar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
