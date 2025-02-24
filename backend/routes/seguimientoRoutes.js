const express = require("express");
const router = express.Router();
const seguimientoController = require("../controllers/seguimientoController");

router.post("/guardar-seguimiento", seguimientoController.guardarSeguimiento);
router.get("/listar", seguimientoController.listarSeguimientos);
router.put("/actualizar-seguimiento/:id", seguimientoController.actualizarSeguimiento);
router.get('/', seguimientoController.obtenerSeguimientos);
module.exports = router;