const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const predictionController = require('../controllers/predictionController');
//CONTROLADOR EXCEL
const upload = require('../middleware/uploadExcel');
const excelController = require('../controllers/excelController');
const authMiddleware = require('../middleware/authMiddleware');
const estudiantesController = require('../controllers/estudiantesController');
const { obtenerEstudiantesBasico, obtenerHistorialAcademico, obtenerEstudiantesFiltrados } = require('../controllers/estudiantesController');
// IMPORTACION CONTROLADOR ESTADISTICAS
const estadisticasController = require('../controllers/estadisticasController');
// CONTROLADOR PREDICCIONES FUTURAS
const prediccionFutController = require('../controllers/prediccionFutController');

// RUTAS DEL CONTROLADOR SEGUIEMIENTO
const seguimientoController = require('../controllers/seguimientoController');
router.post('/seguimiento', seguimientoController);
router.post('/guardar-seguimiento', seguimientoController);
router.put('/actualizar-seguimiento/:id', seguimientoController);
router.get('/listar', seguimientoController);



// Rutas de autenticación (solo para Bienestar Estudiantil y docentes)
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
//Obtener periodos y niveles
router.get('/periodos', estudiantesController.obtenerPeriodos);
router.get('/niveles', estudiantesController.obtenerNiveles);
router.get('/estudiantes/basico', obtenerEstudiantesBasico);
router.get('/estudiantes', obtenerEstudiantesFiltrados);
// Obtener estudiantes filtrados
router.get('/estudiantes/filtrar', estudiantesController.obtenerEstudiantesFiltrados);
// Aquí es donde se encuentra el modelo real
router.post('/estudiantes/predict', estudiantesController.realizarPrediccion);
// Obtener historial académico de un estudiante
router.get('/historial/:id', obtenerHistorialAcademico);
router.get('/estudiantes/:id', estudiantesController.obtenerEstudiantesPorId);
router.post('/acciones/guardar', estudiantesController.guardarAcciones);

// Rutas POST para subir archivos Excel Y PREDICCIONES FUTURAS
router.post('/subir-excel', excelController.procesarExcel);
router.post('/predecir-datos-futuros', prediccionFutController.predecirDatosFuturos);

// RUTAS PARA ESTADISTICAS
router.get('/estadisticas/datos-generales', estadisticasController.getDatosGenerales);
router.get('/estadisticas/datos-rendimiento', estadisticasController.getDatosRendimiento);
router.get('/estadisticas/distribucion-notas', estadisticasController.getDistribucionNotas);
router.get('/estadisticas/rendimiento-asignaturas', estadisticasController.getRendimientoAsignaturas);
router.get('/estadisticas/cantidad-estudiantes-nivel', estadisticasController.getCantidadEstudiantesPorNivel);




import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000, // Tiempo máximo para la respuesta.
  headers: {
    'Content-Type': 'application/json',
  },
});
// Interceptores para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('La solicitud tardó demasiado y fue cancelada.');
      throw new Error('Tiempo de espera agotado.');
    }

    if (error.response) {
      console.error('Error del servidor:', error.response.data);
      throw new Error(error.response.data.message || 'Error del servidor');
    } else if (error.request) {
      console.error('No hubo respuesta del servidor:', error.request);
      throw new Error('No hubo respuesta del servidor. Verifica tu conexión.');
    } else {
      console.error('Error desconocido:', error.message);
      throw new Error('Error inesperado.');
    }
  }
);
export default api;

// Rutas de predicciones (solo accesibles por Bienestar Estudiantil)
router.get(
  '/predictions',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL']),
  predictionController.getAllPredictions
);

router.get(
  '/estudiantes/:id',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL', 'DOCENTE']),
  estudiantesController.obtenerEstudiantesPorId
);

//Aqui debo conectar el modelo de prediccion
router.post(
  '/estudiantes/predict',
  cors(),
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL']),
  async (req, res) => {
    try {
      const predictionResult = await predictionController.generatePrediction(req.body);
      res.json(predictionResult);
    } catch (error) {
      console.error('Error en la predicción:', error);
      res.status(500).json({ message: 'Error al generar la predicción' });
    }
  }
);

router.post('/acciones/guardar',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL']),
  async (req, res) => {
    try {
      const result = await estudiantesController.guardarAcciones(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error al guardar acciones:', error);
      res.status(500).json({ message: 'Error al guardar acciones' });
    }
  }
);
// Estudiantes organizados por curso y periodo
router.get(
  '/estudiantes',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL', 'DOCENTE']),
  estudiantesController.obtenerEstudiantesFiltrados
);

router.get(
  '/historial/:id',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL', 'DOCENTE']),
  estudiantesController.obtenerHistorialAcademico
);

router.get(
  '/estudiantes/filtrar',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL', 'DOCENTE']),
  estudiantesController.obtenerEstudiantesFiltrados
);
// RUTAS PARA OBTENER ESTADISTICAS
router.get('/estadisticas/datos-generales',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL', 'DOCENTE']),
  estadisticasController.getDatosGenerales
);

router.get('/estadisticas/datos-rendimiento',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL', 'DOCENTE']),
  estadisticasController.getDatosRendimiento
);

router.get('/estadisticas/distribucion-notas',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL', 'DOCENTE']),
  estadisticasController.getDistribucionNotas
);

router.get('/estadisticas/rendimiento-asignaturas',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL', 'DOCENTE']),
  estadisticasController.getRendimientoAsignaturas
);

router.post('/subir-excel',
  authMiddleware.verifyToken,
  authMiddleware.checkRole(['BIENESTAR_ESTUDIANTIL']),
  upload.single('archivo'),
  excelController.procesarExcel
);

router.post('/predecir-datos-futuros',
  upload.single('archivo'), // ✅ Asegura que se sube un archivo correctamente
  prediccionFutController.predecirDatosFuturos
);

module.exports = router;