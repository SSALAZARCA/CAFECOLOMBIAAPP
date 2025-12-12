const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database.cjs');

// GET /api/admin/dashboard/stats - Estadísticas generales
router.get('/stats', async (req, res) => {
    try {
        try {
            // Métricas de Usuarios
            const [usersCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM users WHERE isActive = 1'
            );

            const [adminsCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM users WHERE role = "ADMINISTRADOR" AND isActive = 1'
            );

            const [workersCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM users WHERE role = "TRABAJADOR" AND isActive = 1'
            );

            const [newUsersCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
            );

            // Métricas de Fincas y Lotes
            const [farmsCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM farms WHERE isActive = 1'
            );

            const [lotsCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM lots WHERE isActive = 1'
            );

            const [totalArea] = await pool.execute(
                'SELECT COALESCE(SUM(area), 0) as total FROM farms WHERE isActive = 1'
            );

            // Métricas de Producción
            const [totalProduction] = await pool.execute(
                'SELECT COALESCE(SUM(quantityKg), 0) as total FROM harvests'
            );

            const [monthlyProduction] = await pool.execute(
                'SELECT COALESCE(SUM(quantityKg), 0) as total FROM harvests WHERE MONTH(harvestDate) = MONTH(NOW()) AND YEAR(harvestDate) = YEAR(NOW())'
            );

            // Métricas Financieras
            const [monthlyExpenses] = await pool.execute(
                'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE MONTH(date) = MONTH(NOW()) AND YEAR(date) = YEAR(NOW())'
            );

            // Métricas de Calidad
            const [avgQuality] = await pool.execute(
                'SELECT COALESCE(AVG(scaScore), 0) as average FROM quality_controls WHERE scaScore IS NOT NULL'
            );

            const [microlotsCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM microlots WHERE isActive = 1'
            );

            res.json({
                // Métricas de usuarios
                users: usersCount[0].count,
                admins: adminsCount[0].count,
                workers: workersCount[0].count,
                newUsersThisMonth: newUsersCount[0].count,

                // Métricas de fincas y lotes
                farms: farmsCount[0].count,
                lots: lotsCount[0].count,
                totalCultivatedArea: parseFloat((totalArea[0].total || 0).toFixed(2)),

                // Métricas de producción
                totalProduction: parseFloat((totalProduction[0].total || 0).toFixed(2)),
                monthlyProduction: parseFloat((monthlyProduction[0].total || 0).toFixed(2)),

                // Métricas financieras
                monthlyExpenses: parseFloat((monthlyExpenses[0].total || 0).toFixed(2)),

                // Métricas de calidad
                averageQuality: parseFloat((avgQuality[0].average || 0).toFixed(2)),
                microlots: microlotsCount[0].count,

                // Metadata
                configurations: 15,
                lastUpdate: new Date().toISOString()
            });

        } catch (dbError) {
            throw dbError;
        }
    } catch (error) {
        console.error('Error obteniendo estadísticas del dashboard:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/admin/dashboard/charts - Datos para gráficas
router.get('/charts', async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        try {
            let daysAgo = 30;
            if (period === '7d') daysAgo = 7;
            else if (period === '90d') daysAgo = 90;
            else if (period === '1y') daysAgo = 365;

            // Datos de producción vs ventas
            const [productionData] = await pool.execute(`
                SELECT DATE_FORMAT(harvestDate, '%Y-%m-%d') as date, SUM(quantityKg) as production
                FROM harvests
                WHERE harvestDate >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY DATE_FORMAT(harvestDate, '%Y-%m-%d')
                ORDER BY date ASC
            `, [daysAgo]);

            // Datos de usuarios nuevos
            const [userGrowth] = await pool.execute(`
                SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') as date, COUNT(*) as users
                FROM users
                WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
                ORDER BY date ASC
            `, [daysAgo]);

            res.json({
                productionHistory: productionData,
                userGrowth: userGrowth
            });

        } catch (dbError) {
            throw dbError;
        }

    } catch (error) {
        console.error('Error obteniendo datos de gráficas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
