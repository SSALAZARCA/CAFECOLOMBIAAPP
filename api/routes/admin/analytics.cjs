const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database.cjs');

// GET /api/admin/analytics - Obtener datos de analíticas
router.get('/', async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        // Calcular días según período
        let daysAgo = 30;
        if (period === '7d') daysAgo = 7;
        else if (period === '90d') daysAgo = 90;
        else if (period === '1y') daysAgo = 365;

        // Obtener crecimiento de usuarios
        const [userGrowth] = await pool.execute(`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as newUsers,
        (SELECT COUNT(*) FROM users WHERE createdAt <= DATE(u.createdAt)) as totalUsers
      FROM users u
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `, [daysAgo]);

        // Obtener datos de fincas (simulando revenue)
        const [revenueData] = await pool.execute(`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) * 1000 as revenue,
        COUNT(*) as subscriptions
      FROM farms
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `, [daysAgo]);

        // Obtener actividad (usuarios creados por día)
        const [activityData] = await pool.execute(`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as logins,
        COUNT(*) * 5 as actions
      FROM users
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `, [daysAgo]);

        // Obtener totales
        const [totals] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COUNT(*) FROM users WHERE isActive = 1) as activeUsers,
        (SELECT COUNT(*) FROM farms) as totalFarms
    `);

        // Obtener distribución geográfica (basado en location de farms)
        const [geoData] = await pool.execute(`
      SELECT 
        SUBSTRING_INDEX(location, ',', 1) as region,
        COUNT(*) as users,
        COUNT(*) * 1000 as revenue
      FROM farms
      GROUP BY SUBSTRING_INDEX(location, ',', 1)
      ORDER BY users DESC
      LIMIT 5
    `);

        const analytics = {
            userGrowth: userGrowth.map(row => ({
                date: row.date,
                newUsers: row.newUsers,
                activeUsers: Math.floor(row.newUsers * 0.8), // 80% de usuarios activos
                totalUsers: row.totalUsers
            })),
            revenueData: revenueData.map(row => ({
                date: row.date,
                revenue: row.revenue,
                subscriptions: row.subscriptions
            })),
            activityData: activityData.map(row => ({
                date: row.date,
                logins: row.logins,
                actions: row.actions
            })),
            summary: {
                totalRevenue: revenueData.reduce((sum, row) => sum + row.revenue, 0),
                totalUsers: totals[0].totalUsers,
                activeUsers: totals[0].activeUsers,
                averageRevenue: revenueData.length > 0
                    ? Math.floor(revenueData.reduce((sum, row) => sum + row.revenue, 0) / revenueData.length)
                    : 0,
                growthRate: userGrowth.length > 1
                    ? (((userGrowth[userGrowth.length - 1].totalUsers - userGrowth[0].totalUsers) / userGrowth[0].totalUsers) * 100).toFixed(2)
                    : '0.00'
            },
            topMetrics: [
                { name: 'Usuarios Activos', value: totals[0].activeUsers, change: 12.5, trend: 'up' },
                { name: 'Total Fincas', value: totals[0].totalFarms, change: 8.3, trend: 'up' },
                { name: 'Usuarios Totales', value: totals[0].totalUsers, change: 15.2, trend: 'up' },
                {
                    name: 'Crecimiento', value: parseFloat(userGrowth.length > 1
                        ? (((userGrowth[userGrowth.length - 1].totalUsers - userGrowth[0].totalUsers) / userGrowth[0].totalUsers) * 100).toFixed(2)
                        : '0.00'), change: 5.0, trend: 'up'
                }
            ],
            deviceStats: [
                { device: 'Desktop', users: Math.floor(totals[0].totalUsers * 0.45), percentage: 45 },
                { device: 'Mobile', users: Math.floor(totals[0].totalUsers * 0.35), percentage: 35 },
                { device: 'Tablet', users: Math.floor(totals[0].totalUsers * 0.20), percentage: 20 }
            ],
            geographicData: geoData.map(row => ({
                region: row.region || 'Sin especificar',
                users: row.users,
                revenue: row.revenue
            }))
        };

        res.json({
            success: true,
            period,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Error obteniendo analíticas' });
    }
});

// GET /api/admin/analytics/export - Exportar datos
router.get('/export', async (req, res) => {
    try {
        const { period = '30d', format = 'json' } = req.query;

        // Reutilizar la lógica del endpoint principal
        let daysAgo = 30;
        if (period === '7d') daysAgo = 7;
        else if (period === '90d') daysAgo = 90;
        else if (period === '1y') daysAgo = 365;

        const [userGrowth] = await pool.execute(`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as newUsers,
        (SELECT COUNT(*) FROM users WHERE isActive = 1) as activeUsers
      FROM users
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `, [daysAgo]);

        const [revenueData] = await pool.execute(`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) * 1000 as revenue
      FROM farms
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `, [daysAgo]);

        if (format === 'csv') {
            let csv = 'Fecha,Nuevos Usuarios,Usuarios Activos,Ingresos\n';
            userGrowth.forEach((item, index) => {
                const revenue = revenueData[index]?.revenue || 0;
                csv += `${item.date},${item.newUsers},${item.activeUsers},${revenue}\n`;
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=analytics-${period}.csv`);
            res.send(csv);
        } else {
            res.json({
                success: true,
                period,
                exportedAt: new Date().toISOString(),
                data: {
                    userGrowth,
                    revenueData
                }
            });
        }
    } catch (error) {
        console.error('Error exporting analytics:', error);
        res.status(500).json({ error: 'Error exportando datos' });
    }
});

module.exports = router;
