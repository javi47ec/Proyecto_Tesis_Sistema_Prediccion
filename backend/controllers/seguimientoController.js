const pool = require("../config/db");

// 📌 Guardar un seguimiento (Docente)
const guardarSeguimiento = async (req, res) => {
  try {
    console.log("📥 Datos recibidos en el backend:", req.body); // ✅ Verifica qué llega

    const { id_estudiante, id_docente, comentario } = req.body;

    if (!id_estudiante || !id_docente || !comentario) {
      return res.status(400).json({ error: "❌ Todos los campos son obligatorios" });
    }
     console.log("📥 Recibiendo seguimiento:", { id_estudiante, id_docente, comentario });
    const query = `
      INSERT INTO seguimiento_estudiante (id_estudiante, id_docente, comentario, estado)
      VALUES (?, ?, ?, 'PENDIENTE')`;
    await pool.execute(query, [id_estudiante, id_docente, comentario]);

    res.status(201).json({ message: "Seguimiento registrado correctamente" });
  } catch (error) {
    console.error("❌ Error al registrar seguimiento:", error);
    res.status(500).json({ error: "Error al registrar seguimiento" });
  }
};


// 📌 Obtener seguimientos (Bienestar Estudiantil)
const listarSeguimientos = async (req, res) => {
  try {
    console.log("📢 Consultando seguimientos en la base de datos...");
    
    const query = `
      SELECT 
        s.id_seguimiento, 
        s.id_estudiante, 
        e.nombres AS nombres_estudiante, 
        e.apellidos AS apellidos_estudiante, 
        d.nombres AS nombre_docente, 
        d.apellidos AS apellido_docente,
        s.comentario, 
        s.estado, 
        s.fecha_creacion
      FROM seguimiento_estudiante s
      JOIN estudiante e ON s.id_estudiante = e.id_estudiante
      LEFT JOIN docente d ON s.id_docente = d.id_docente  -- 🔹 Unir con docente
      ORDER BY s.fecha_creacion DESC
    `;

    const [result] = await pool.execute(query);

    console.log("📌 Datos obtenidos:", result); // 🔹 Verificar si el backend sí envía el docente
    res.json(result);
  } catch (error) {
    console.error("❌ Error al obtener seguimientos:", error);
    res.status(500).json({ error: "Error al obtener seguimientos" });
  }
};

const obtenerSeguimientos = async (req, res) => {
  try {
    const [seguimientos] = await pool.execute(`
      SELECT s.id_seguimiento, s.id_estudiante, s.comentario, s.fecha_creacion, s.estado, 
             e.nombres AS nombre_estudiante, e.apellidos AS apellido_estudiante,
             a.descripcion AS accion, a.recomendacion AS recomendacion
      FROM seguimiento_estudiante s
      JOIN estudiante e ON s.id_estudiante = e.id_estudiante
      LEFT JOIN acciones_estudiante a ON s.id_estudiante = a.id_estudiante
    `);
    res.json(seguimientos);
  } catch (error) {
    console.error("❌ Error al obtener seguimientos:", error);
    res.status(500).json({ message: "Error al obtener seguimientos" });
  }
};



// 📌 Actualizar estado del seguimiento
const actualizarSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["APROBADO", "RECHAZADO"].includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    const query = `UPDATE seguimiento_estudiante SET estado = ? WHERE id_seguimiento = ?`;
    await pool.execute(query, [estado, id]);

    res.json({ message: `Seguimiento ${estado} correctamente` });
  } catch (error) {
    console.error("Error al actualizar seguimiento:", error);
    res.status(500).json({ error: "Error al actualizar seguimiento" });
  }
};

// 📌 Exportar funciones para usarlas en las rutas
module.exports = {
  guardarSeguimiento,
  listarSeguimientos,
  actualizarSeguimiento,
  obtenerSeguimientos
};
