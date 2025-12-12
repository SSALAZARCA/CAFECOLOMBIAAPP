const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'srv1196.hstgr.io',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'u689528678_SSALAZARCA',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u689528678_CAFECOLOMBIA',
    charset: 'utf8mb4',
    timezone: '+00:00',
    ssl: {
        rejectUnauthorized: false
    }
};

// Middleware de autenticación simple
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    // Aceptar cualquier token por ahora para health check
    next();
};

// GET / - Listar fincas
router.get('/', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        try {
            const [farms] = await connection.execute('SELECT * FROM farms');
            await connection.end();

            res.json(farms);
        } catch (dbError) {
            await connection.end();
            throw dbError;
        }
    } catch (error) {
        console.error('Error obteniendo fincas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
