const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const db = require('../config/db');
const estudiantesController = require('../controllers/estudiantesController');
const prediccionFutController = require('../controllers/prediccionFutController');
const excelController = require('../controllers/excelController');
//Ruta para subir archivo excel 
router.post('/predecir-datos-futuros', upload.single('archivo'), prediccionFutController.predecirDatosFuturos);
router.post('/subir-excel', upload.single('archivo'), excelController.procesarExcel);

router.get('/basico', estudiantesController.obtenerEstudiantesBasico);
router.get('/periodos', estudiantesController.obtenerPeriodos);
router.get('/niveles', estudiantesController.obtenerNiveles);
router.get('/filtrados', estudiantesController.obtenerEstudiantesFiltrados);
router.get('/historial/:id', estudiantesController.obtenerHistorialAcademico);
router.post('/acciones/guardar', estudiantesController.guardarAcciones);

router.post('/predict', estudiantesController.realizarPrediccion);
//Ruta para predecir datos futuros y obtener predicciones futuras

router.get('/predicciones', async (req, res) => {
    try {
        // 🔥 Obtener el período activo desde la base de datos
        const [periodoActivo] = await db.query("SELECT periodo FROM periodo_activo ORDER BY id DESC LIMIT 1");

        if (!periodoActivo || periodoActivo.length === 0) {
            return res.status(404).json({ error: "No se encontró un período activo." });
        }

        const periodo = periodoActivo[0].periodo; // ✅ Extraer el período activo

        // 🔹 Obtener predicciones SOLO del período activo
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
            WHERE p.periodo = ?  -- 🔥 Filtrar solo por el período activo
            ORDER BY p.fecha_prediccion DESC
        `, [periodo]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "No hay predicciones disponibles para el período activo." });
        }

        res.json({ predicciones: rows });
    } catch (error) {
        console.error("❌ Error al obtener predicciones:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});




module.exports = router;