const express = require('express');
const router = express.Router();

// Mock data para planes de suscripción
const mockPlans = [
    {
        id: 1,
        name: 'Plan Básico',
        description: 'Ideal para pequeños caficultores',
        price: 30000,
        currency: 'COP',
        interval: 'monthly',
        features: ['Hasta 2 fincas', 'Reportes básicos', 'Soporte por email'],
        isActive: true,
        maxFarms: 2,
        maxUsers: 1
    },
    {
        id: 2,
        name: 'Plan Pro',
        description: 'Para caficultores profesionales',
        price: 50000,
        currency: 'COP',
        interval: 'monthly',
        features: ['Hasta 5 fincas', 'Reportes avanzados', 'Soporte prioritario', 'Analíticas'],
        isActive: true,
        maxFarms: 5,
        maxUsers: 3
    },
    {
        id: 3,
        name: 'Plan Enterprise',
        description: 'Para cooperativas y grandes productores',
        price: 100000,
        currency: 'COP',
        interval: 'monthly',
        features: ['Fincas ilimitadas', 'Reportes personalizados', 'Soporte 24/7', 'API access'],
        isActive: true,
        maxFarms: -1,
        maxUsers: -1
    }
];

// GET /api/admin/subscription-plans - Listar planes
router.get('/', async (req, res) => {
    try {
        res.json({ success: true, data: { plans: mockPlans } });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo planes' });
    }
});

// GET /api/admin/subscription-plans/:id - Ver plan
router.get('/:id', async (req, res) => {
    try {
        const plan = mockPlans.find(p => p.id === parseInt(req.params.id));
        if (!plan) {
            return res.status(404).json({ error: 'Plan no encontrado' });
        }
        res.json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo plan' });
    }
});

// POST /api/admin/subscription-plans - Crear plan
router.post('/', async (req, res) => {
    try {
        const newPlan = {
            id: mockPlans.length + 1,
            ...req.body,
            isActive: true
        };
        mockPlans.push(newPlan);
        res.status(201).json({ success: true, data: newPlan });
    } catch (error) {
        res.status(500).json({ error: 'Error creando plan' });
    }
});

// PUT /api/admin/subscription-plans/:id - Actualizar plan
router.put('/:id', async (req, res) => {
    try {
        const index = mockPlans.findIndex(p => p.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Plan no encontrado' });
        }
        mockPlans[index] = { ...mockPlans[index], ...req.body };
        res.json({ success: true, data: mockPlans[index] });
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando plan' });
    }
});

// DELETE /api/admin/subscription-plans/:id - Eliminar plan
router.delete('/:id', async (req, res) => {
    try {
        const index = mockPlans.findIndex(p => p.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Plan no encontrado' });
        }
        mockPlans[index].isActive = false;
        res.json({ success: true, message: 'Plan desactivado' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando plan' });
    }
});

module.exports = router;
