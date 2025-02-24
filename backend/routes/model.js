const express = require('express');
const router = express.Router();
const predictionModel = require('../model/predictionModel'); // Modelo simulado

// Ruta para obtener predicciones
router.post('/predict', async (req, res) => {
  try {
    const { historial } = req.body; // Datos enviados desde el frontend
    if (!historial) {
      return res.status(400).json({ error: 'El historial es requerido' });
    }

    // Generar predicción usando el modelo simulado
    const prediccion = await predictionModel(historial);
    res.json({ prediccion });
  } catch (error) {
    console.error('Error en la predicción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/predecir-datos-futuros', async (req, res) => {
  console.log('📡 Datos recibidos en el backend:', req.body);
  try {
    const data = req.body; // Obtener los datos enviados desde el frontend

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Se esperaba un array de estudiantes.' });
    }

    // Calcular predicciones para cada estudiante
    const predicciones = datos.map((estudiante) => {
      const probabilidad = calcularProbabilidad({
        promedio: estudiante.promedio,
        materias_reprobadas: estudiante.materias_reprobadas || 0,
        total_materias: estudiante.total_materias || 10, // Valor por defecto
      });

      let nivelRiesgo;
      if (probabilidad > 0.7) nivelRiesgo = 'ALTO';
      else if (probabilidad > 0.4) nivelRiesgo = 'MEDIO';
      else nivelRiesgo = 'BAJO';

      return {
        id_estudiante: estudiante.id_estudiante,
        probabilidad,
        nivelRiesgo,
      };
    });

    res.json({ predicciones });
  } catch (error) {
    console.error('Error en la predicción futura:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


router.get('/estudiantes/basico', estudiantesController.obtenerEstudiantesBasico);

module.exports = router;
