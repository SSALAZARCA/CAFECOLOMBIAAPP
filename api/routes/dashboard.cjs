const express = require('express');
const { authenticateToken } = require('../middleware/auth.cjs');
const { pool } = require('../config/database.cjs');

const router = express.Router();

// GET /api/dashboard - Obtener datos del dashboard del caficultor
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Solo permitir acceso a caficultores
    if (userRole !== 'coffee_grower') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo para caficultores.'
      });
    }

    const connection = await pool.getConnection();

    try {
      // Obtener información del usuario (caficultor)
      const [userRows] = await connection.execute(
        `SELECT 
          id,
          firstName,
          lastName,
          lastName,
          email,
          phone
        FROM users
        WHERE id = ? AND isActive = 1`,
        [userId]
      );

      if (userRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      const user = userRows[0];

      // Estructura compatible con el frontend existente
      const coffeeGrower = {
        id: user.id,
        full_name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        department: '',
        municipality: ''
      };

      // Obtener información de la finca principal
      // Usamos ownerId en lugar de coffee_grower_id
      const [farmRows] = await connection.execute(
        `SELECT 
          f.id,
          f.name,
          f.area as total_area,
          f.area as coffee_area,
          f.altitude,
          f.location, 
          f.department,
          f.municipality,
          f.address,
          f.soil_type,
          f.processing_method,
          f.coffee_varieties,
          f.createdAt
        FROM farms f
        WHERE f.ownerId = ?
        ORDER BY f.createdAt ASC
        LIMIT 1`,
        [userId]
      );

      const farm = farmRows.length > 0 ? farmRows[0] : null;

      // Actualizar ubicación del caficultor si hay datos en la finca
      if (farm) {
        coffeeGrower.department = farm.department || '';
        coffeeGrower.municipality = farm.municipality || '';
        // Fallback para location string "Dept, Muni"
        if (farm.location && (!farm.department || !farm.municipality)) {
          const parts = farm.location.split(',');
          if (parts.length > 0) coffeeGrower.department = parts[0].trim();
          if (parts.length > 1) coffeeGrower.municipality = parts[1].trim();
        }
      }

      // Obtener producción histórica (últimas 2 temporadas)
      // Usamos tabla harvests ya que production_records es legacy
      const [productionRows] = await connection.execute(
        `SELECT 
          YEAR(h.harvestDate) as year,
          COALESCE(SUM(h.quantityKg), 0) as total_production
        FROM harvests h
        JOIN lots l ON h.lotId = l.id
        WHERE l.farmId = ?
        GROUP BY YEAR(h.harvestDate)
        ORDER BY year DESC
        LIMIT 2`,
        [farm ? farm.id : null]
      );

      // Calcular tendencia de producción
      let trend = 'stable';
      let currentSeason = 0;
      let lastSeason = 0;

      // Si no hay farm, productionRows estará vacío o query fallará si null (pero null en params -> empty result usually)
      if (farm && productionRows.length >= 2) {
        currentSeason = parseFloat(productionRows[0].total_production);
        lastSeason = parseFloat(productionRows[1].total_production);

        if (currentSeason > lastSeason * 1.05) {
          trend = 'up';
        } else if (currentSeason < lastSeason * 0.95) {
          trend = 'down';
        }
      } else if (productionRows.length === 1) {
        currentSeason = parseFloat(productionRows[0].total_production);
      }

      // Obtener alertas recientes (simuladas por ahora)
      const alerts = [
        {
          id: '1',
          type: 'warning',
          message: 'Riesgo de roya detectado en lote 3',
          date: new Date().toISOString().split('T')[0]
        },
        {
          id: '2',
          type: 'info',
          message: 'Próxima fertilización programada',
          date: new Date().toISOString().split('T')[0]
        }
      ];

      // Obtener tareas pendientes (simuladas por ahora)
      const tasks = [
        {
          id: '1',
          title: 'Aplicar fungicida preventivo',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high',
          completed: false
        },
        {
          id: '2',
          title: 'Revisar sistema de riego',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'medium',
          completed: false
        }
      ];

      // Preparar datos del dashboard
      const dashboardData = {
        user: {
          name: coffeeGrower.full_name,
          email: coffeeGrower.email,
          phone: user.phone || '', // New field from DB
          farmName: farm?.name || 'Sin finca registrada'
        },
        grower: { // For compatibility with Configuracion.tsx
          full_name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || ''
        },
        farm: {
          totalArea: farm?.total_area || 0,
          coffeeArea: farm?.coffee_area || 0,
          location: `${farm?.department || ''}, ${farm?.municipality || ''}`,
          altitude: farm?.altitude || 0,
          name: farm?.name,
          department: farm?.department,
          municipality: farm?.municipality,
          address: farm?.address,
          soil_type: farm?.soil_type,
          processing_method: farm?.processing_method,
          coffee_varieties: farm?.coffee_varieties
        },
        production: {
          currentSeason,
          lastSeason,
          trend
        },
        weather: {
          // Datos simulados - en producción se conectaría a API meteorológica
          temperature: 22 + Math.random() * 6, // 22-28°C
          humidity: 70 + Math.random() * 20,   // 70-90%
          rainfall: 80 + Math.random() * 80    // 80-160mm
        },
        alerts,
        tasks
      };

      res.json({
        success: true,
        data: dashboardData
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en dashboard:', error);
    const fs = require('fs');
    try {
      fs.appendFileSync('backend-errors.log', new Date().toISOString() + ' DASHBOARD ERROR: ' + error.message + '\n' + error.stack + '\n');
    } catch (e) { }
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/dashboard - Actualizar datos del caficultor y finca
router.put('/', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error('Usuario no autenticado');

    const {
      profile: { fullName, email, phone },
      farm: { name, department, municipality, address, sizeHectares, altitude, soilType, coffeeVarieties, processingMethod }
    } = req.body;

    await connection.beginTransaction();

    // 1. Actualizar User
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    await connection.execute(
      `UPDATE users SET firstName = ?, lastName = ?, phone = ? WHERE id = ?`,
      [firstName || '', lastName || '', phone || null, userId]
    );

    // 2. Actualizar Finca (buscar por ownerId)
    // Primero verificar si existe
    const [existingFarms] = await connection.execute('SELECT id FROM farms WHERE ownerId = ? LIMIT 1', [userId]);

    // Convertir array de variedades a string si es necesario
    const varietiesStr = Array.isArray(coffeeVarieties) ? coffeeVarieties.join(',') : coffeeVarieties;

    if (existingFarms.length > 0) {
      const farmId = existingFarms[0].id;
      await connection.execute(
        `UPDATE farms SET 
          name = ?, department = ?, municipality = ?, address = ?, 
          area = ?, altitude = ?, soil_type = ?, processing_method = ?, coffee_varieties = ?
        WHERE id = ?`,
        [
          name, department, municipality, address,
          sizeHectares || 0, altitude || 0, soilType, processingMethod, varietiesStr,
          farmId
        ]
      );
    } else {
      // Crear finca si no existe (fallback)
      const { v4: uuidv4 } = require('uuid'); // Assumes uuid might be available or use simple ID
      const newId = 'farm-' + Date.now();
      await connection.execute(
        `INSERT INTO farms (
          id, ownerId, name, department, municipality, address, 
          area, altitude, soil_type, processing_method, coffee_varieties, isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          newId, userId, name, department, municipality, address,
          sizeHectares || 0, altitude || 0, soilType, processingMethod, varietiesStr
        ]
      );
    }

    await connection.commit();

    res.json({ success: true, message: 'Configuración actualizada correctamente' });

  } catch (error) {
    await connection.rollback();
    console.error('Error actualizando dashboard:', error);
    const fs = require('fs');
    try { fs.appendFileSync('backend-errors.log', new Date().toISOString() + ' UPDATE ERROR: ' + error.message + '\n'); } catch (e) { }
    res.status(500).json({ success: false, error: 'Error al actualizar configuración' });
  } finally {
    connection.release();
  }
});

module.exports = router;