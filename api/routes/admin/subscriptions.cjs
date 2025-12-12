const express = require('express');
const router = express.Router();

// Mock data para suscripciones
const mockSubscriptions = [
    {
        id: 1,
        userId: 1,
        userName: 'Juan Pérez',
        planId: 2,
        planName: 'Plan Pro',
        status: 'active',
        startDate: '2024-01-15T00:00:00Z',
        endDate: '2025-01-15T00:00:00Z',
        autoRenew: true,
        amount: 50000
    },
    {
        id: 2,
        userId: 2,
        userName: 'María González',
        planId: 1,
        planName: 'Plan Básico',
        status: 'active',
        startDate: '2024-02-20T00:00:00Z',
        endDate: '2025-02-20T00:00:00Z',
        autoRenew: false,
        amount: 30000
    }
];

// GET /api/admin/subscriptions - Listar suscripciones
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, status = '' } = req.query;

        let filtered = [...mockSubscriptions];

        if (status) {
            filtered = filtered.filter(s => s.status === status);
        }

        const total = filtered.length;
        const startIndex = (page - 1) * limit;
        const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

        res.json({
            success: true, data: {
                subscriptions: paginated,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo suscripciones' });
    }
});

// GET /api/admin/subscriptions/stats - Estadísticas
router.get('/stats', async (req, res) => {
    try {
        const active = mockSubscriptions.filter(s => s.status === 'active');
        const revenue = mockSubscriptions.reduce((sum, s) => sum + s.amount, 0);

        res.json({
            success: true, data: {
                total: mockSubscriptions.length,
                active: active.length,
                monthlyRevenue: revenue,
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// GET /api/admin/subscriptions/:id - Ver suscripción
router.get('/:id', async (req, res) => {
    try {
        const subscription = mockSubscriptions.find(s => s.id === parseInt(req.params.id));
        if (!subscription) {
            return res.status(404).json({ error: 'Suscripción no encontrada' });
        }
        res.json({ success: true, data: subscription });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo suscripción' });
    }
});

// PUT /api/admin/subscriptions/:id - Actualizar suscripción
router.put('/:id', async (req, res) => {
    try {
        const index = mockSubscriptions.findIndex(s => s.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Suscripción no encontrada' });
        }
        mockSubscriptions[index] = { ...mockSubscriptions[index], ...req.body };
        res.json({ success: true, data: mockSubscriptions[index] });
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando suscripción' });
    }
});

// DELETE /api/admin/subscriptions/:id - Cancelar suscripción
router.delete('/:id', async (req, res) => {
    try {
        const index = mockSubscriptions.findIndex(s => s.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Suscripción no encontrada' });
        }
        mockSubscriptions[index].status = 'cancelled';
        res.json({ success: true, message: 'Suscripción cancelada' });
    } catch (error) {
        res.status(500).json({ error: 'Error cancelando suscripción' });
    }
});

module.exports = router;
