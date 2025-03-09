// routes/predictionRoute.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Carpeta donde se guardarán los archivos
const predictionModel = require('../model/predictionModel');
const prediccionFutController = require('../controllers/prediccionFutController');
const predictionController = require('../controllers/predictionController');

const db = require('../config/db');

// Ruta para guardar una predicción en caliente
router.post("/guardar", predictionController.guardarPrediccion);

router.post('/predict', async (req, res) => {
  try {
    // Validar que req.body.data existe y es un array
    if (!req.body.data || !Array.isArray(req.body.data)) {
      return res.status(400).json({ 
        error: 'Se requiere un array de datos en el campo "data"' 
      });
    }

    const resultado = await predictionModel(req.body.data);
    res.json(resultado);

  } catch (error) {
    console.error('Error en la ruta de predicción:', error);
    res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
});

router.get('/predicciones', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id_estudiante, 
        e.nombres, 
        e.apellidos, 
        p.nivel_riesgo, 
        p.probabilidad, 
        p.periodo, 
        p.fecha_prediccion,
        p.nivel_referencial
      FROM prediccion p
      JOIN estudiante e ON p.id_estudiante = e.id_estudiante
      WHERE p.periodo = (SELECT periodo FROM periodo_activo ORDER BY id DESC LIMIT 1)  -- 🔥 Filtrar solo por el período actual
      ORDER BY p.fecha_prediccion DESC
    `);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "No hay predicciones disponibles para el período activo" });
    }

    res.json({ predicciones: rows });
  } catch (error) {
    console.error("❌ Error al obtener predicciones:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});



router.post('/predecir-datos-futuros',
  upload.single('archivo'), // ✅ Asegura que se sube un archivo correctamente
  prediccionFutController.predecirDatosFuturos
);

module.exports = router;