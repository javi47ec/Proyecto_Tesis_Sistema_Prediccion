// periodoController.js
const db = require('../config/db'); // Asegúrate de que tu módulo db esté configurado

// Endpoint para obtener el período activo
const obtenerPeriodoActivo = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT periodo FROM periodo_activo ORDER BY id DESC LIMIT 1");
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No se encontró el período activo" });
    }
    res.json({ periodo: rows[0].periodo });
  } catch (error) {
    console.error("Error al obtener período activo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const obtenerPeriodoActivoDB = async () => {
    const [rows] = await db.query("SELECT periodo FROM periodo_activo ORDER BY id DESC LIMIT 1");
    if (!rows || rows.length === 0) {
      return "Desconocido";
    }
    return rows[0].periodo;
  };
  
// Endpoint para actualizar el período activo (solo para el superusuario)
const actualizarPeriodoActivo = async (req, res) => {
  const { periodo } = req.body;
  if (!periodo) {
    return res.status(400).json({ error: "Se requiere un nuevo período" });
  }
  try {
    // Insertamos un nuevo registro (esto define el nuevo período activo)
    const sql = "INSERT INTO periodo_activo (periodo) VALUES (?)";
    await db.query(sql, [periodo]);
    res.json({ message: "Período actualizado correctamente", periodo });
  } catch (error) {
    console.error("Error al actualizar período activo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { obtenerPeriodoActivo, actualizarPeriodoActivo, obtenerPeriodoActivoDB };
