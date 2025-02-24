const pool = require('../config/db');
const predictionModel = require('../model/predictionModel');
const prepareFeatures = require('../model/prepareFeatures');


const obtenerEstudiantesBasico = async (req, res) => {
  try {
    const query = 'SELECT id_estudiante, nombres, apellidos FROM estudiante';
    const [result] = await pool.execute(query);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener estudiantes básicos:', error);
    res.status(500).json({ error: 'Error al obtener estudiantes básicos', details: error.message });
  }
};

const obtenerPeriodos = async (req, res) => {
  try {
    const query = 'SELECT periodo FROM historial_academico WHERE periodo = "202450"';
    const [result] = await pool.execute(query);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener periodos:', error);
    res.status(500).json({ error: 'Error al obtener periodos' });
  }
};
const obtenerEstudiantesPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM estudiante WHERE id_estudiante = ?';
    const [result] = await pool.execute(query, [id]);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    res.json(result[0]);
  } catch (error) {
    console.error('Error al obtener estudiante por ID:', error);
    res.status(500).json({ error: 'Error al obtener estudiante por ID' });
  }
};

const obtenerNiveles = async (req, res) => {
  try {
    const query = 'SELECT DISTINCT nombre FROM nivel';
    const [result] = await pool.execute(query);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener niveles:', error);
    res.status(500).json({ error: 'Error al obtener niveles' });
  }
};

const obtenerEstudiantesFiltrados = async (req, res) => {
  const { nivel, periodo } = req.query;

  console.log(`📡 Recibido en backend: nivel=${nivel}, periodo=${periodo}`);

  try {
    const [result] = await pool.execute(
      `SELECT 
        e.id_estudiante, 
        e.nombres, 
        e.apellidos,
        ha.periodo,
        n.nombre AS nivel
      FROM estudiante e
      JOIN historial_academico ha ON e.id_estudiante = ha.id_estudiante
      JOIN asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
      JOIN nivel n ON a.nivel_id = n.nivel_id
      WHERE n.nombre = ? AND ha.periodo = ?
      ORDER BY e.apellidos ASC`,
      [nivel, periodo]
    );

    console.log("🔄 Estudiantes obtenidos:", result);

    if (result.length === 0) {
      console.warn(" No se encontraron estudiantes para este nivel y período.");
      return res.status(404).json({
        message: 'No se encontraron estudiantes para el nivel y período seleccionados.',
      });
    }

    res.json(result);
  } catch (error) {
    console.error(' Error al obtener los estudiantes:', error);
    res.status(500).json({ message: 'Error al obtener los estudiantes.' });
  }
};


const getStudentsAtRisk = async (req, res) => {
  try {
    const [students] = await pool.execute(
      `SELECT s.id_estudiante, s.nombres, s.apellidos, p.nivel_riesgo, p.probabilidad
      FROM estudiante s 
      JOIN prediccion p ON s.id_estudiante = p.id_estudiante
      WHERE p.nivel_riesgo != 'BAJO'`
    );
    res.status(200).json(students);
  } catch (error) {
    console.error('Error al obtener estudiantes en riesgo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener historial académico de un estudiante
const obtenerHistorialAcademico = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute(
      `SELECT 
        ha.periodo, 
        a.nombre AS nombre_asignatura,
        a.nivel_id AS nivel, 
        ha.nota_1p, 
        ha.nota_2p, 
        ha.nota_3p, 
        ha.promedio, 
        ha.estado 
      FROM historial_academico ha
      JOIN asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
      WHERE ha.id_estudiante = ?
      ORDER BY ha.periodo, a.nivel_id`,
      [id]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'No se encontró historial académico para el estudiante' });
    }
    console.log(' Datos deñ Historial académico:', result);

    res.json(result);
  } catch (error) {
    console.error('Error al obtener el historial académico:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
const obtenerHistorialEstudiante = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute(
      ` SELECT 
                ha.promedio,
                a.nivel_id as nivel,
                CASE 
                    WHEN ha.promedio >= 14.1 THEN 'APROBADO'
                    ELSE 'REPROBADO'
                END as estado
            FROM historial_academico ha
            INNER JOIN asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
            WHERE ha.id_estudiante = ?
            ORDER BY a.nivel_id`,
      [id]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'No se encontraron registros para el estudiante' });
    }
    const features = prepareFeatures(rows);
    return features;
  } catch (error) {
    console.error('Error al obtener o procesar los datos:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  };
};


// Nuevo método para predicciones del modelo

const realizarPrediccion = async (req, res) => {
  try {
    const { estudiantes } = req.body;

    if (!estudiantes || !Array.isArray(estudiantes)) {
      return res.status(400).json({ error: 'Se requiere un array de estudiantes' });
    }

    console.log('📡 Procesando predicciones para:', estudiantes.length, 'estudiantes');

    // Filtrar estudiantes con historial válido
    const estudiantesValidos = estudiantes.filter(est => est.historial && est.historial.length > 0);

    if (estudiantesValidos.length === 0) {
      return res.status(400).json({ error: 'No hay estudiantes con historial válido' });
    }

    // Generar características
    const featuresList = estudiantesValidos.map(est => prepareFeatures(est.historial));

    // Validar que los features sean correctos
    if (!featuresList.every(f => f && Array.isArray(f) && f.length > 0)) {
      return res.status(400).json({ error: "Algunos estudiantes tienen datos inválidos" });
    }

    // Llamar al modelo
    const resultados = await predictionModel(featuresList);

    // Asignar los resultados a los estudiantes
    const predicciones = {};
    estudiantesValidos.forEach((est, i) => {
      predicciones[est.id_estudiante] = resultados[i] || {
        probabilidad: 0,
        nivelRiesgo: "BAJO"
      };
    });

    res.json({ predicciones });

  } catch (error) {
    console.error('❌ Error en predicción:', error);
    res.status(500).json({ error: 'Error al procesar predicciones' });
  }
};





console.log("🔍 prepareFeatures:", prepareFeatures);

// Función auxiliar para generar historial sintético
const generarHistorialSintetico = (estudiante) => {
  const nivelActual = parseInt(estudiante.nivel, 10) || 1;
  const promedioBase = parseFloat(estudiante.promedio_anterior) || 14.5;
  const historiaSintetica = [];

  // 🔥 Generar historial de manera más realista
  for (let nivel = 1; nivel <= nivelActual; nivel++) {
    const variacion = (Math.random() - 0.5) * 2; // ±1 punto
    const promedioNivel = Math.max(8, Math.min(20, promedioBase + variacion)); // Evitar valores muy bajos

    // 🔥 Generar múltiples materias con pequeñas variaciones
    for (let i = 1; i <= 5; i++) { // Ajustamos a 5 materias por nivel
      historiaSintetica.push({
        nivel,
        periodo: `2024-${nivel}`,
        promedio: promedioNivel + (Math.random() - 0.5),
        estado: promedioNivel >= 14.1 ? 'APROBADO' : 'REPROBADO',
        nombre_asignatura: `Asignatura ${i}`,
        codigo_asignatura: `ASG${nivel}${i}`
      });
    }
  }

  console.log(`📚 Historial sintético generado para estudiante nuevo:`, historiaSintetica);
  return historiaSintetica;
};



// Función auxiliar para preparar datos
const prepareDataForPrediction = (historial) => {
  return {
    promedio_general: historial.reduce((sum, item) => sum + parseFloat(item.promedio || 0), 0) / historial.length,
    materias_reprobadas: historial.filter(item => item.estado === 'REPROBADO').length,
    total_materias: historial.length
  };
};
// Obtener detalles completos de un estudiante por ID
const obtenerEstudiantePorId = async (req, res) => {
  const { id } = req.params; // Extraer el ID del estudiante desde los parámetros de la URL

  try {
    // Consulta para obtener la información básica del estudiante
    const [estudiante] = await pool.execute(
      `SELECT 
          e.id_estudiante, 
          e.nombres, 
          e.apellidos, 
          e.genero, 
          COUNT(ha.id_historial) AS materias_cursadas
      FROM 
          estudiante e
      LEFT JOIN 
          historial_academico ha ON e.id_estudiante = ha.id_estudiante
      WHERE 
          e.id_estudiante = ?
      GROUP BY 
          e.id_estudiante`,
      [id]
    );

    if (!estudiante.length) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Consulta para obtener el historial académico con promedio y desviación estándar
    const [historial] = await pool.execute(
      `SELECT 
          a.nombre AS asignatura, 
          ha.nota_1p, 
          ha.nota_2p, 
          ha.nota_3p, 
          ha.promedio, 
          ha.periodo
      FROM 
          historial_academico ha
      INNER JOIN 
          asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
      WHERE 
          ha.id_estudiante = ?
      ORDER BY 
          ha.periodo ASC`,
      [id]
    );

    if (!historial.length) {
      estudiante[0].historial = [];
      estudiante[0].promedioGeneral = 0;
      estudiante[0].desviacionEstandar = 0;
    } else {
      // Calcular promedio general y desviación estándar
      const promedios = historial.map(h => h.promedio);
      const promedioGeneral = promedios.reduce((acc, p) => acc + p, 0) / promedios.length;
      const desviacionEstandar = Math.sqrt(
        promedios.reduce((acc, p) => acc + Math.pow(p - promedioGeneral, 2), 0) / promedios.length
      );

      estudiante[0].historial = historial;
      estudiante[0].promedioGeneral = promedioGeneral.toFixed(2);
      estudiante[0].desviacionEstandar = desviacionEstandar.toFixed(2);
    }

    return res.json(estudiante[0]); // Respuesta con los datos del estudiante
  } catch (error) {
    console.error('Error en obtenerEstudiantePorId:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

const guardarAcciones = async (req, res) => {
  const { id_estudiante, descripcion, recomendacion, seguimiento } = req.body;
  try {
    await pool.execute(
      'INSERT INTO acciones_estudiante (id_estudiante, descripcion, recomendacion, seguimiento) VALUES (?, ?, ?, ?)',
      [id_estudiante, descripcion, recomendacion, seguimiento]
    );
    res.status(200).json({ message: 'Acciones guardadas correctamente' });
  } catch (error) {
    console.error('Error al guardar acciones:', error);
    res.status(500).json({ message: 'Error al guardar acciones', error: error.message });
  }
};

module.exports = {
  obtenerEstudiantesBasico,
  obtenerPeriodos,
  obtenerNiveles,
  obtenerEstudiantesFiltrados,
  getStudentsAtRisk,
  obtenerEstudiantesPorId,
  obtenerHistorialAcademico,
  guardarAcciones,
  realizarPrediccion
};