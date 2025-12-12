const express = require('express');
const router = express.Router();

// Mock data para usuarios
const mockUsers = [
    {
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        role: 'grower',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        lastLogin: '2024-11-30T08:30:00Z'
    },
    {
        id: 2,
        firstName: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@example.com',
        role: 'grower',
        isActive: true,
        createdAt: '2024-02-20T14:00:00Z',
        lastLogin: '2024-11-29T16:45:00Z'
    },
    {
        id: 3,
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos.rodriguez@example.com',
        role: 'grower',
        isActive: false,
        createdAt: '2024-03-10T09:00:00Z',
        lastLogin: '2024-10-15T12:00:00Z'
    }
];

// GET /api/admin/users - Listar usuarios
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;

        let filteredUsers = [...mockUsers];

        // Filtrar por búsqueda
        if (search) {
            filteredUsers = filteredUsers.filter(user =>
                user.firstName.toLowerCase().includes(search.toLowerCase()) ||
                user.lastName.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filtrar por rol
        if (role) {
            filteredUsers = filteredUsers.filter(user => user.role === role);
        }

        // Filtrar por estado
        if (status === 'active') {
            filteredUsers = filteredUsers.filter(user => user.isActive);
        } else if (status === 'inactive') {
            filteredUsers = filteredUsers.filter(user => !user.isActive);
        }

        const total = filteredUsers.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: {
                users: paginatedUsers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error obteniendo usuarios' });
    }
});

// GET /api/admin/users/stats - Estadísticas de usuarios
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = mockUsers.length;
        const activeUsers = mockUsers.filter(u => u.isActive).length;
        const inactiveUsers = mockUsers.filter(u => !u.isActive).length;
        const growers = mockUsers.filter(u => u.role === 'grower').length;

        res.json({
            success: true,
            data: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
                growers,
                admins: 1,
                newThisMonth: 2,
                growthRate: 15.5
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// GET /api/admin/users/:id - Ver usuario específico
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = mockUsers.find(u => u.id === parseInt(id));

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error obteniendo usuario' });
    }
});

// POST /api/admin/users - Crear usuario
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, role, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const newUser = {
            id: mockUsers.length + 1,
            firstName,
            lastName,
            email,
            role: role || 'grower',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        mockUsers.push(newUser);

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: newUser
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creando usuario' });
    }
});

// PUT /api/admin/users/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, role, isActive } = req.body;

        const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));

        if (userIndex === -1) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            firstName: firstName || mockUsers[userIndex].firstName,
            lastName: lastName || mockUsers[userIndex].lastName,
            email: email || mockUsers[userIndex].email,
            role: role || mockUsers[userIndex].role,
            isActive: isActive !== undefined ? isActive : mockUsers[userIndex].isActive
        };

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: mockUsers[userIndex]
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error actualizando usuario' });
    }
});

// DELETE /api/admin/users/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));

        if (userIndex === -1) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        mockUsers.splice(userIndex, 1);

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error eliminando usuario' });
    }
});

module.exports = router;