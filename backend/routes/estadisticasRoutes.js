const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');
router.get('/datos-generales', estadisticasController.getDatosGenerales);
router.get('/datos-rendimiento', estadisticasController.getDatosRendimiento);
router.get('/distribucion-notas', estadisticasController.getDistribucionNotas);
router.get('/rendimiento-asignaturas', estadisticasController.getRendimientoAsignaturas);
router.get('/estudiantes-por-nivel', estadisticasController.getCantidadEstudiantesPorNivel);
module.exports = router;