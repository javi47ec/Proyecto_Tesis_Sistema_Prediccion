const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');
const { obtenerEstadisticas } = require('../controllers/estadisticasController'); // Asegúrate de que está importado correctamente

router.get('/datos-generales', estadisticasController.getDatosGenerales);
router.get('/datos-rendimiento', estadisticasController.getDatosRendimiento);
router.get('/distribucion-notas', estadisticasController.getDistribucionNotas);
router.get('/rendimiento-asignaturas', estadisticasController.getRendimientoAsignaturas);
router.get('/estudiantes-por-nivel', estadisticasController.getCantidadEstudiantesPorNivel);
// Obtener estadisticas considerando predicciones en caliente
// (RECUERDA QUE DEBEMOS CAMBIAR LA RUTA PUEDE SER / O COLOCANDO UNA RUTA YA DEFINIDA)
router.get('/estadisticas', obtenerEstadisticas);
module.exports = router;