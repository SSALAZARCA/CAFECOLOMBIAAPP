const express = require('express');
const router = express.Router();

// Mock data para pagos
const mockPayments = [
    {
        id: 1,
        userId: 1,
        userName: 'Juan Pérez',
        amount: 50000,
        currency: 'COP',
        method: 'credit_card',
        status: 'completed',
        description: 'Suscripción Plan Pro',
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 2,
        userId: 2,
        userName: 'María González',
        amount: 30000,
        currency: 'COP',
        method: 'bank_transfer',
        status: 'pending',
        description: 'Suscripción Plan Básico',
        createdAt: new Date(Date.now() - 172800000).toISOString()
    }
];

// GET /api/admin/payments - Listar pagos
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, status = '' } = req.query;

        let filtered = [...mockPayments];

        if (status) {
            filtered = filtered.filter(p => p.status === status);
        }

        const total = filtered.length;
        const startIndex = (page - 1) * limit;
        const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

        res.json({
            success: true, data: {
                payments: paginated,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo pagos' });
    }
});

// GET /api/admin/payments/stats - Estadísticas de pagos
router.get('/stats', async (req, res) => {
    try {
        const total = mockPayments.reduce((sum, p) => sum + p.amount, 0);
        const completed = mockPayments.filter(p => p.status === 'completed');
        const pending = mockPayments.filter(p => p.status === 'pending');

        res.json({
            success: true, data: {
                totalRevenue: total,
                completedPayments: completed.length,
                pendingPayments: pending.length,
                averagePayment: Math.round(total / mockPayments.length)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// GET /api/admin/payments/:id - Ver pago específico
router.get('/:id', async (req, res) => {
    try {
        const payment = mockPayments.find(p => p.id === parseInt(req.params.id));
        if (!payment) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }
        res.json({ success: true, data: payment });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo pago' });
    }
});

// PUT /api/admin/payments/:id/status - Actualizar estado de pago
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const index = mockPayments.findIndex(p => p.id === parseInt(req.params.id));

        if (index === -1) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        mockPayments[index].status = status;
        res.json({ success: true, data: mockPayments[index] });
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando pago' });
    }
});

module.exports = router;
