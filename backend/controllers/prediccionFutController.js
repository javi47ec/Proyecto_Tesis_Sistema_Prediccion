const xlsx = require('xlsx');
const fs = require('fs');
const db = require('../config/db');

const procesarArchivoExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Leer datos como array de arrays
    const datos = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false });

    console.log("📊 Datos leídos del Excel:", datos);

    if (!Array.isArray(datos) || datos.length === 0) {
      throw new Error("El archivo Excel está vacío o mal formateado");
    }

    return datos;
  } catch (error) {
    console.error("❌ Error al procesar archivo Excel:", error);
    throw new Error("Error al procesar el archivo Excel");
  }
};

// 🔥 Función auxiliar para obtener el período activo desde la BD
const obtenerPeriodoActivoDB = async () => {
  const [rows] = await db.query("SELECT periodo FROM periodo_activo ORDER BY id DESC LIMIT 1");
  return (rows && rows.length > 0) ? rows[0].periodo : "Desconocido";
};

const predecirDatosFuturos = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "❌ El archivo es requerido" });
    }

    // 📌 Procesar el Excel
    let datosExcel = procesarArchivoExcel(req.file.path);
    console.log("📊 Datos recibidos del frontend:", datosExcel);

    // 📌 Obtener el período activo de la BD
    const periodoActivo = await obtenerPeriodoActivoDB();
    console.log("📅 Período activo:", periodoActivo);

    // 📌 Buscar la fila de encabezados de manera dinámica
    const indiceEncabezados = datosExcel.findIndex(fila =>
      fila.some(celda => typeof celda === "string" && celda.toLowerCase().includes("nombres"))
    );

    if (indiceEncabezados === -1) {
      console.error("❌ No se encontraron los encabezados esperados. Revisa el archivo.");
      throw new Error("No se encontraron los encabezados necesarios.");
    }

    // 📌 Extraer los nombres de los encabezados limpiando espacios y caracteres raros
    const encabezados = datosExcel[indiceEncabezados].map(celda =>
      typeof celda === "string" ? celda.toLowerCase().trim().replace(/\s+/g, " ") : ""
    );

    console.log("📊 Encabezados detectados:", encabezados);

    // 📌 Diccionario de nombres aceptados para cada campo
    const camposEsperados = {
      id_estudiante: ["id", "id estudiante", "matricula"],
      nombres: ["nombres", "nombre"],
      apellidos: ["apellidos", "apellido", "apellidos completos"],
      cedula: ["cédula", "dni", "documento"],
      nivel_referencial: ["nivel referencial", "nivel"]
    };

    // 📌 Buscar los índices de cada campo
    const indices = {};
    Object.entries(camposEsperados).forEach(([campo, nombresAceptados]) => {
      indices[campo] = encabezados.findIndex(header =>
        nombresAceptados.some(nombre => header.includes(nombre))
      );
    });

    // 📌 Mostrar advertencias si falta algún campo clave
    Object.entries(indices).forEach(([campo, index]) => {
      if (index === -1) {
        console.warn(`⚠️ Advertencia: No se detectó la columna para: ${campo}. Se usará "N/A" por defecto.`);
      }
    });

    // 📌 Filtrar las filas de datos (después de los encabezados)
    datosExcel = datosExcel.slice(indiceEncabezados + 1).filter(fila =>
      fila[indices.id_estudiante] && fila[indices.nombres]
    );

    console.log("📊 Datos filtrados:", datosExcel);

    // 📌 Agrupar datos por ID de manera dinámica
    const estudiantesMap = {};
    datosExcel.forEach(fila => {
      let nivel_referencial = "SIN DEFINIR";

      // Primero, intenta obtener `nivel_referencial`
      if (indices.nivel_referencial !== -1) {
        nivel_referencial = fila[indices.nivel_referencial]?.toString().trim();
      }

      // Si está vacío o es inválido, intenta obtener `nivel`
      if (!nivel_referencial || nivel_referencial === "N/A" || nivel_referencial === "NULL") {
        nivel_referencial = indices.nivel !== -1 ? fila[indices.nivel]?.toString().trim() : "SIN DEFINIR";
      }

      // Última verificación para evitar valores inválidos
      if (!nivel_referencial || nivel_referencial === "N/A" || nivel_referencial === "NULL") {
        nivel_referencial = "SIN DEFINIR";
      }

      const estudiante = {
        id_estudiante: fila[indices.id_estudiante]?.toString().trim() || "N/A",
        nombres: fila[indices.nombres]?.toString().trim() || "Desconocido",
        apellidos: indices.apellidos !== -1 ? fila[indices.apellidos]?.toString().trim() || "Desconocido" : "N/A",
        cedula: indices.cedula !== -1 ? fila[indices.cedula]?.toString().trim() || "N/A" : "N/A",
        nivel_referencial
      };

      if (!estudiantesMap[estudiante.id_estudiante]) {
        estudiantesMap[estudiante.id_estudiante] = estudiante;
      }
    });

    console.log("📊 Estudiantes procesados dinámicamente:", estudiantesMap);

    // 📌 Array para almacenar las promesas de inserción en la BD
    const inserciones = [];

    // 📌 Insertar datos en la tabla `prediccion`
    for (const est of Object.values(estudiantesMap)) {
      console.log(`📌 Insertando estudiante: ${est.id_estudiante} - Nivel Referencial: ${est.nivel_referencial}`);

      const sql = `
        INSERT INTO prediccion (id_estudiante, nivel_riesgo, probabilidad, periodo, nivel_referencial) 
        VALUES (?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        nivel_riesgo = VALUES(nivel_riesgo), 
        probabilidad = VALUES(probabilidad), 
        periodo = VALUES(periodo), 
        nivel_referencial = VALUES(nivel_referencial)`;

      inserciones.push(db.query(sql, [est.id_estudiante, "BAJO", 0.2, periodoActivo, est.nivel_referencial]));
    }

    // 📌 Esperar a que todas las consultas se ejecuten antes de enviar la respuesta
    await Promise.all(inserciones);
    console.log("📊 Datos guardados en la base de datos con período:", periodoActivo);

    // 📌 Eliminar el archivo temporal (si existe)
    if (req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error al eliminar archivo temporal:", err);
      });
    }

    // 📌 Enviar la respuesta final (solo una vez)
    res.json({ message: "✅ Predicción futura realizada correctamente.", periodo: periodoActivo });

  } catch (error) {
    console.error("❌ Error en la predicción futura:", error);

    if (!res.headersSent) {
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }
};

module.exports = { predecirDatosFuturos };
