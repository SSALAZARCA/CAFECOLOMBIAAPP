// Script para estandarizar las respuestas de todas las rutas admin
// Este script agrega el envelope { success: true, data: {...} } a todas las respuestas

const fs = require('fs');
const path = require('path');

const adminRoutesDir = path.join(__dirname, '../api/routes/admin');

const fixes = {
    'users.cjs': `const express = require('express');
const router = express.Router();

// Mock data para usuarios
const mockUsers = [
    { id: 1, firstName: 'Juan', lastName: 'Pérez', email: 'juan.perez@example.com', role: 'grower', isActive: true, createdAt: '2024-01-15T10:00:00Z', lastLogin: '2024-11-30T08:30:00Z' },
    { id: 2, firstName: 'María', lastName: 'González', email: 'maria.gonzalez@example.com', role: 'grower', isActive: true, createdAt: '2024-02-20T14:00:00Z', lastLogin: '2024-11-29T16:45:00Z' },
    { id: 3, firstName: 'Carlos', lastName: 'Rodríguez', email: 'carlos.rodriguez@example.com', role: 'grower', isActive: false, createdAt: '2024-03-10T09:00:00Z', lastLogin: '2024-10-15T12:00:00Z' }
];

router.get('/', async (req, res) => {
    try {
        const { page = 1, limit  = 10, search = '', role = '', status = '' } = req.query;
        let filteredUsers = [...mockUsers];
        if (search) filteredUsers = filteredUsers.filter(user => user.firstName.toLowerCase().includes(search.toLowerCase()) || user.lastName.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()));
        if (role) filteredUsers = filteredUsers.filter(user => user.role === role);
        if (status === 'active') filteredUsers = filteredUsers.filter(user => user.isActive);
        else if (status === 'inactive') filteredUsers = filteredUsers.filter(user => !user.isActive);
        const total = filteredUsers.length;
        const startIndex = (page - 1) * limit;
        const paginatedUsers = filteredUsers.slice(startIndex, startIndex + parseInt(limit));
        res.json({ success: true, data: { users: paginatedUsers, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } } });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error obteniendo usuarios' });
    }
});

router.get('/stats', async (req, res) => {
    try {
        res.json({ success: true, data: { total: mockUsers.length, active: mockUsers.filter(u => u.isActive).length, inactive: mockUsers.filter(u => !u.isActive).length, growers: mockUsers.filter(u => u.role === 'grower').length, admins: 1, newThisMonth: 2, growthRate: 15.5 } });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = mockUsers.find(u => u.id === parseInt(req.params.id));
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo usuario' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, role, password } = req.body;
        if (!firstName || !lastName || !email || !password) return res.status(400).json({ error: 'Todos los campos son requeridos' });
        const newUser = { id: mockUsers.length + 1, firstName, lastName, email, role: role || 'grower', isActive: true, createdAt: new Date().toISOString(), lastLogin: null };
        mockUsers.push(newUser);
        res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: newUser });
    } catch (error) {
        res.status(500).json({ error: 'Error creando usuario' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, role, isActive } = req.body;
        const userIndex = mockUsers.findIndex(u => u.id === parseInt(req.params.id));
        if (userIndex === -1) return res.status(404).json({ error: 'Usuario no encontrado' });
        mockUsers[userIndex] = { ...mockUsers[userIndex], firstName: firstName || mockUsers[userIndex].firstName, lastName: lastName || mockUsers[userIndex].lastName, email: email || mockUsers[userIndex].email, role: role || mockUsers[userIndex].role, isActive: isActive !== undefined ? isActive : mockUsers[userIndex].isActive };
        res.json({ success: true, message: 'Usuario actualizado exitosamente', data: mockUsers[userIndex] });
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando usuario' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const userIndex = mockUsers.findIndex(u => u.id === parseInt(req.params.id));
        if (userIndex === -1) return res.status(404).json({ error: 'Usuario no encontrado' });
        mockUsers.splice(userIndex, 1);
        res.json({ success: true, message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando usuario' });
    }
});

module.exports = router;`,

    'subscriptions.cjs': (content) => content
        .replace(/res\.json\(\{\s*subscriptions:/g, 'res.json({ success: true, data: { subscriptions:')
        .replace(/\}\s*\}\s*\);\s*$/mg, (match, offset, string) => {
            // Only replace if this looks like the end of a subscriptions response
            if (string.substring(Math.max(0, offset - 200), offset).includes('subscriptions')) {
                return '} } });';
            }
            return match;
        })
        .replace(/res\.json\(subscription\)/g, 'res.json({ success: true, data: subscription })')
        .replace(/res\.json\(\{\s*total:/g, 'res.json({ success: true, data: { total:')
        .replace(/res\.json\(\{\s*success:\s*true,\s*subscription:/g, 'res.json({ success: true, data:'),

    'subscription-plans.cjs': (content) => content
        .replace(/res\.json\(\{\s*plans:/g, 'res.json({ success: true, data: { plans:')
        .replace(/res\.json\(plan\)/g, 'res.json({ success: true, data: plan })')
        .replace(/res\.json\(\{\s*success:\s*true,\s*plan:/g, 'res.json({ success: true, data:'),

    'payments.cjs': (content) => content
        .replace(/res\.json\(\{\s*payments:/g, 'res.json({ success: true, data: { payments:')
        .replace(/res\.json\(payment\)/g, 'res.json({ success: true, data: payment })')
        .replace(/res\.json\(\{\s*totalRevenue:/g, 'res.json({ success: true, data: { totalRevenue:')
        .replace(/res\.json\(\{\s*success:\s*true,\s*payment:/g, 'res.json({ success: true, data:')
};

// Apply fixes
for (const [file, fix] of Object.entries(fixes)) {
    const filePath = path.join(adminRoutesDir, file);
    if (fs.existsSync(filePath)) {
        if (typeof fix === 'string') {
            fs.writeFileSync(filePath, fix);
            console.log(`✓ Fixed ${file} (complete rewrite)`);
        } else {
            const content = fs.readFileSync(filePath, 'utf8');
            const fixed = fix(content);
            fs.writeFileSync(filePath, fixed);
            console.log(`✓ Fixed ${file} (pattern replacement)`);
        }
    }
}

console.log('\\n✅ All admin route responses standardized!');
