const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'srv1196.hstgr.io',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'u689528678_SSALAZARCA',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u689528678_CAFECOLOMBIA',
    ssl: { rejectUnauthorized: false }
};

// GET /api/admin/profile - Obtener perfil del admin
router.get('/profile', async (req, res) => {
    try {
        // TODO: Get user ID from auth token
        const adminEmail = 'admin@cafecolombia.com'; // Temporal

        const connection = await mysql.createConnection(dbConfig);
        const [users] = await connection.execute(
            'SELECT id, firstName, lastName, email, role, createdAt FROM users WHERE email = ? AND role = "ADMINISTRADOR"',
            [adminEmail]
        );
        await connection.end();

        if (users.length === 0) {
            return res.status(404).json({ error: 'Perfil no encontrado' });
        }

        const user = users[0];
        res.json({
            success: true,
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: null,
                avatar: null,
                twoFactorEnabled: false,
                emailNotifications: true,
                smsNotifications: false,
                loginAlerts: true,
                createdAt: user.createdAt,
                lastLogin: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ error: 'Error obteniendo perfil' });
    }
});

// PUT /api/admin/profile - Actualizar perfil
router.put('/profile', async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        const adminEmail = 'admin@cafecolombia.com'; // Temporal

        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE users SET firstName = ?, lastName = ? WHERE email = ? AND role = "ADMINISTRADOR"',
            [firstName, lastName, adminEmail]
        );

        const [updated] = await connection.execute(
            'SELECT id, firstName, lastName, email, role FROM users WHERE email = ?',
            [adminEmail]
        );
        await connection.end();

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            profile: updated[0]
        });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({ error: 'Error actualizando perfil' });
    }
});

// PUT /api/admin/profile/password - Cambiar contraseña
router.put('/profile/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
        }

        // TODO: Implement bcrypt password hashing
        const adminEmail = 'admin@cafecolombia.com';

        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE users SET password = ? WHERE email = ? AND role = "ADMINISTRADOR"',
            [newPassword, adminEmail]
        );
        await connection.end();

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Error cambiando contraseña' });
    }
});

// PUT /api/admin/profile/2fa - Configurar 2FA
router.put('/profile/2fa', async (req, res) => {
    try {
        const { enabled } = req.body;

        // TODO: Store 2FA setting in database
        res.json({
            success: true,
            message: enabled ? '2FA habilitado' : '2FA deshabilitado',
            twoFactorEnabled: enabled
        });
    } catch (error) {
        console.error('Error updating 2FA:', error);
        res.status(500).json({ error: 'Error configurando 2FA' });
    }
});

// PUT /api/admin/profile/notifications - Configurar notificaciones
router.put('/profile/notifications', async (req, res) => {
    try {
        const { email, push, sms } = req.body;

        // TODO: Store notification preferences in database
        res.json({
            success: true,
            message: 'Preferencias de notificación actualizadas',
            notifications: { email, push, sms }
        });
    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({ error: 'Error configurando notificaciones' });
    }
});

module.exports = router;
