const express = require('express');
const router = express.Router();
const estudiantesRoutes = require('./estudiantesRoutes');
const estadisticasRoutes = require('./estadisticasRoutes');
const seguimientoRoutes = require('./seguimientoRoutes');

// Ejemplo de una ruta para usuarios
router.get('/users', (req, res) => {
  res.json({ message: 'Lista de usuarios' });
});

router.use('/api/estudiantes', estudiantesRoutes);
router.use('/api/estadisticas', estadisticasRoutes);
router.use('/api/seguimientos', seguimientoRoutes);
module.exports = router;
