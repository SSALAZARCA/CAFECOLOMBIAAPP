const express = require('express');
const router = express.Router();

// Mock data para caficultores
const mockCoffeeGrowers = [
    {
        id: 1,
        userId: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '+57 300 123 4567',
        farms: 2,
        totalArea: 15.5,
        certifications: ['Orgánico', 'Fair Trade'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 2,
        userId: 2,
        firstName: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@example.com',
        phone: '+57 310 234 5678',
        farms: 1,
        totalArea: 8.3,
        certifications: ['Rainforest Alliance'],
        isActive: true,
        createdAt: '2024-02-20T14:00:00Z'
    }
];

// GET /api/admin/coffee-growers - Listar caficultores
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;

        let filtered = [...mockCoffeeGrowers];

        if (search) {
            filtered = filtered.filter(g =>
                g.firstName.toLowerCase().includes(search.toLowerCase()) ||
                g.lastName.toLowerCase().includes(search.toLowerCase()) ||
                g.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (status === 'active') {
            filtered = filtered.filter(g => g.isActive);
        } else if (status === 'inactive') {
            filtered = filtered.filter(g => !g.isActive);
        }

        const total = filtered.length;
        const startIndex = (page - 1) * limit;
        const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

        res.json({
            success: true,
            data: {
                growers: paginated,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching coffee growers:', error);
        res.status(500).json({ error: 'Error obteniendo caficultores' });
    }
});

// GET /api/admin/coffee-growers/stats - Estadísticas
router.get('/stats', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                total: mockCoffeeGrowers.length,
                active: mockCoffeeGrowers.filter(g => g.isActive).length,
                totalFarms: mockCoffeeGrowers.reduce((sum, g) => sum + g.farms, 0),
                totalArea: mockCoffeeGrowers.reduce((sum, g) => sum + g.totalArea, 0),
                certified: mockCoffeeGrowers.filter(g => g.certifications.length > 0).length
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// GET /api/admin/coffee-growers/:id - Ver caficultor
router.get('/:id', async (req, res) => {
    try {
        const grower = mockCoffeeGrowers.find(g => g.id === parseInt(req.params.id));
        if (!grower) {
            return res.status(404).json({ error: 'Caficultor no encontrado' });
        }
        res.json({ success: true, data: grower });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo caficultor' });
    }
});

// POST /api/admin/coffee-growers - Crear caficultor
router.post('/', async (req, res) => {
    try {
        const newGrower = {
            id: mockCoffeeGrowers.length + 1,
            ...req.body,
            farms: 0,
            totalArea: 0,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        mockCoffeeGrowers.push(newGrower);
        res.status(201).json({ success: true, data: newGrower });
    } catch (error) {
        res.status(500).json({ error: 'Error creando caficultor' });
    }
});

// PUT /api/admin/coffee-growers/:id - Actualizar caficultor
router.put('/:id', async (req, res) => {
    try {
        const index = mockCoffeeGrowers.findIndex(g => g.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Caficultor no encontrado' });
        }
        mockCoffeeGrowers[index] = { ...mockCoffeeGrowers[index], ...req.body };
        res.json({ success: true, data: mockCoffeeGrowers[index] });
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando caficultor' });
    }
});

// DELETE /api/admin/coffee-growers/:id - Eliminar caficultor
router.delete('/:id', async (req, res) => {
    try {
        const index = mockCoffeeGrowers.findIndex(g => g.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Caficultor no encontrado' });
        }
        mockCoffeeGrowers.splice(index, 1);
        res.json({ success: true, message: 'Caficultor eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando caficultor' });
    }
});

module.exports = router;
