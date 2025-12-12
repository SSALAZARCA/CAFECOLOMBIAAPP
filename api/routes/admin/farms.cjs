const express = require('express');
const router = express.Router();

// Mock data para fincas
const mockFarms = [
    {
        id: 1,
        name: 'Finca El Paraíso',
        ownerId: 1,
        ownerName: 'Juan Pérez',
        location: 'Huila, Colombia',
        area: 10.5,
        altitude: 1800,
        varieties: ['Caturra', 'Castillo'],
        certifications: ['Orgánico'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 2,
        name: 'Finca La Esperanza',
        ownerId: 2,
        ownerName: 'María González',
        location: 'Nariño, Colombia',
        area: 8.3,
        altitude: 2000,
        varieties: ['Geisha', 'Bourbon'],
        certifications: ['Rainforest Alliance'],
        isActive: true,
        createdAt: '2024-02-20T14:00:00Z'
    }
];

// GET /api/admin/farms - Listar fincas
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        let filtered = [...mockFarms];

        if (search) {
            filtered = filtered.filter(f =>
                f.name.toLowerCase().includes(search.toLowerCase()) ||
                f.ownerName.toLowerCase().includes(search.toLowerCase()) ||
                f.location.toLowerCase().includes(search.toLowerCase())
            );
        }

        const total = filtered.length;
        const startIndex = (page - 1) * limit;
        const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

        res.json({
            success: true,
            data: {
                farms: paginated,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo fincas' });
    }
});

// GET /api/admin/farms/stats - Estadísticas
router.get('/stats', async (req, res) => {
    try {
        res.json({
            total: mockFarms.length,
            totalArea: mockFarms.reduce((sum, f) => sum + f.area, 0),
            averageAltitude: Math.round(mockFarms.reduce((sum, f) => sum + f.altitude, 0) / mockFarms.length),
            certified: mockFarms.filter(f => f.certifications.length > 0).length
        });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// GET /api/admin/farms/:id - Ver finca
router.get('/:id', async (req, res) => {
    try {
        const farm = mockFarms.find(f => f.id === parseInt(req.params.id));
        if (!farm) {
            return res.status(404).json({ error: 'Finca no encontrada' });
        }
        res.json(farm);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo finca' });
    }
});

// POST /api/admin/farms - Crear finca
router.post('/', async (req, res) => {
    try {
        const newFarm = {
            id: mockFarms.length + 1,
            ...req.body,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        mockFarms.push(newFarm);
        res.status(201).json({ success: true, farm: newFarm });
    } catch (error) {
        res.status(500).json({ error: 'Error creando finca' });
    }
});

// PUT /api/admin/farms/:id - Actualizar finca
router.put('/:id', async (req, res) => {
    try {
        const index = mockFarms.findIndex(f => f.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Finca no encontrada' });
        }
        mockFarms[index] = { ...mockFarms[index], ...req.body };
        res.json({ success: true, farm: mockFarms[index] });
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando finca' });
    }
});

// DELETE /api/admin/farms/:id - Eliminar finca
router.delete('/:id', async (req, res) => {
    try {
        const index = mockFarms.findIndex(f => f.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Finca no encontrada' });
        }
        mockFarms.splice(index, 1);
        res.json({ success: true, message: 'Finca eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando finca' });
    }
});

module.exports = router;
