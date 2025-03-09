const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/docentes', authController.obtenerDocentes); 

// Rutas para recuperación de contraseña
router.post("/forgot-password", authController.enviarCorreoRecuperacion);
// Ruta para restablecer contraseña
router.post("/reset-password/:token", authController.restablecerContrasena);
module.exports = router;
