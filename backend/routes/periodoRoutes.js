// periodoRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerPeriodoActivo, actualizarPeriodoActivo } = require('../controllers/periodoController');

router.get('/periodo-activo', obtenerPeriodoActivo);
router.post('/periodo-activo', actualizarPeriodoActivo);

module.exports = router;
