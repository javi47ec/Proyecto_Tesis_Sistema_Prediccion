const xlsx = require('xlsx');
const pool = require('../config/db');

const procesarExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ message: "El archivo Excel está vacío o no tiene formato válido." });
    }

    // Procesar y guardar en la base de datos
    for (let row of data) {
      const { id_estudiante, promedio, periodo, nota_1p, nota_2p, nota_3p } = row;

      await pool.query(
        `INSERT INTO historial_academico (id_estudiante, promedio, periodo, nota_1p, nota_2p, nota_3p)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE promedio = VALUES(promedio), nota_1p = VALUES(nota_1p), nota_2p = VALUES(nota_2p), nota_3p = VALUES(nota_3p)`,
        [id_estudiante, promedio, periodo, nota_1p, nota_2p, nota_3p]
      );
    }

    res.status(200).json({ message: "Datos cargados exitosamente" });
  } catch (error) {
    console.error("Error al procesar el archivo Excel:", error);
    res.status(500).json({ message: "Error al procesar el archivo" });
  }
};

module.exports = { procesarExcel };
