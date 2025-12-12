const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const { dbConfig } = require('../config/database.cjs');

// Helper para obtener farmId del usuario autenticado
async function getFarmIdFromUser(userId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        // En el nuevo esquema, el usuario es dueño directo de la finca (ownerId)
        const [rows] = await connection.execute('SELECT id FROM farms WHERE ownerId = ? LIMIT 1', [userId]);
        return rows.length > 0 ? rows[0].id : null;
    } finally {
        await connection.end();
    }
}

// GET / - Listar trabajadores
router.get('/', async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const farmId = await getFarmIdFromUser(req.user.id);

        if (!farmId) {
            return res.status(404).json({ error: 'Finca no encontrada para este usuario' });
        }

        const connection = await mysql.createConnection(dbConfig);
        try {
            const [workers] = await connection.execute(`
                SELECT * FROM farm_workers 
                WHERE farmId = ? AND isActive = true
                ORDER BY name ASC
            `, [farmId]);
            res.json(workers);
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error fetching workers:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /lots - Listar lotes de la finca
router.get('/lots', async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const farmId = await getFarmIdFromUser(req.user.id);

        if (!farmId) {
            return res.json([]);
        }

        const connection = await mysql.createConnection(dbConfig);
        try {
            const [lots] = await connection.execute(`
                SELECT id, name FROM lots 
                WHERE farmId = ? AND isActive = true
                ORDER BY name ASC
            `, [farmId]);
            res.json(lots);
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error fetching lots:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST / - Crear trabajador
router.post('/', async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const { name, role, phone } = req.body;
        let farmId = await getFarmIdFromUser(req.user.id);

        // Auto-create farm if not exists
        if (!farmId) {
            console.log('Finca no encontrada para usuario, creando finca por defecto...');
            const connection = await mysql.createConnection(dbConfig);
            try {
                const newFarmId = uuidv4();
                await connection.execute(
                    `INSERT INTO farms (id, ownerId, name, isActive, createdAt, updatedAt) 
                     VALUES (?, ?, 'Mi Finca', 1, NOW(), NOW())`,
                    [newFarmId, req.user.id]
                );
                farmId = newFarmId;
            } finally {
                await connection.end();
            }
        }

        const id = uuidv4();
        const connection = await mysql.createConnection(dbConfig);
        try {
            await connection.execute(`
                INSERT INTO farm_workers (id, farmId, name, role, phone, isActive, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, true, NOW(), NOW())
            `, [id, farmId, name, role || 'RECOLECTOR', phone]);

            res.status(201).json({ success: true, id, message: 'Trabajador creado' });
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error creating worker:', error);
        res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
});

// GET /:id/collections - Obtener recolecciones
router.get('/:id/collections', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        try {
            const [collections] = await connection.execute(`
                SELECT c.*, l.name as lotName 
                FROM coffee_collections c
                LEFT JOIN lots l ON c.lotId = l.id
                WHERE c.workerId = ?
                ORDER BY c.collectionDate DESC
            `, [id]);
            res.json(collections);
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /collections - Registrar recolección
router.post('/collections', async (req, res) => {
    try {
        const { workerId, lotId, quantityKg, method, notes } = req.body;

        if (!workerId || !quantityKg) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        const id = uuidv4();
        const connection = await mysql.createConnection(dbConfig);
        try {
            await connection.execute(`
                INSERT INTO coffee_collections (id, workerId, lotId, quantityKg, collectionDate, method, notes, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, NOW(), ?, ?, NOW(), NOW())
            `, [id, workerId, lotId, quantityKg, method || 'MANUAL', notes]);

            res.status(201).json({ success: true, id, message: 'Recolección registrada' });
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error recording collection:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /tasks - Asignar tarea
router.post('/tasks', async (req, res) => {
    try {
        const { workerId, lotId, type, description, scheduledDate } = req.body;

        if (!workerId || !lotId || !type || !scheduledDate) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        const id = uuidv4();
        const connection = await mysql.createConnection(dbConfig);
        try {
            await connection.execute(`
                INSERT INTO agricultural_tasks (id, lotId, assignedWorkerId, type, description, scheduledDate, status, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', NOW(), NOW())
            `, [id, lotId, workerId, type, description || '', scheduledDate]);

            res.status(201).json({ success: true, id, message: 'Tarea asignada correctamente' });
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error assigning task:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
