const pool = require('../config/db');

const calcularProbabilidad = (data) => {
  let probabilidad = 0;
  if (data.promedio_general < 14) probabilidad += 0.3;
  if (data.materias_reprobadas > 2) probabilidad += 0.3;
  if (data.materias_reprobadas / data.total_materias > 0.3) probabilidad += 0.2;
  return probabilidad;
};

const predictionController = {
  // Obtener predicciones de todos los estudiantes
  getAllPredictions: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
      const [predictions] = await pool.execute(`
        SELECT 
          p.id_prediccion,
          e.id_estudiante,
          e.nombres,
          e.apellidos,
          p.nivel_riesgo,
          p.probabilidad,
          p.fecha_prediccion,
          (
            SELECT COUNT(*) 
            FROM historial_academico ha 
            WHERE ha.id_estudiante = e.id_estudiante AND ha.estado = 'REPROBADO'
          ) as materias_reprobadas,
          (
            SELECT AVG(promedio) 
            FROM historial_academico ha 
            WHERE ha.id_estudiante = e.id_estudiante
          ) as promedio_general
        FROM prediccion p
        JOIN estudiante e ON p.id_estudiante = e.id_estudiante
        ORDER BY p.probabilidad DESC LIMIT ? OFFSET ?
      `, [limit, offset]);
      
      res.json(predictions);
    } catch (error) {
      console.error('Error al obtener predicciones:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // Obtener detalles completos de un estudiante
  getStudentDetails: async (req, res) => {
    const { id } = req.params;
    try {
      // Información básica del estudiante
      const [studentInfo] = await pool.execute(`
        SELECT e.*, p.nivel_riesgo, p.probabilidad, p.fecha_prediccion
        FROM estudiante e
        LEFT JOIN prediccion p ON e.id_estudiante = p.id_estudiante
        WHERE e.id_estudiante = ?
      `, [id]);
      
      if (!studentInfo.length) {
        return res.status(404).json({ message: 'Estudiante no encontrado' });
      }      
      // Historial académico
      const [academicHistory] = await pool.execute(`
        SELECT 
          ha.*,
          a.nombre as nombre_asignatura,
          a.creditos,
          a.componentes,
          d.nombres as nombre_docente,
          d.apellidos as apellido_docente
        FROM historial_academico ha
        JOIN asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
        LEFT JOIN docente d ON ha.id_docente = d.id_docente
        WHERE ha.id_estudiante = ?
        ORDER BY ha.periodo DESC, ha.codigo_asignatura
      `, [id]);

      // Estadísticas académicas
      const [statistics] = await pool.execute(`
        SELECT 
          COUNT(*) as total_materias,
          SUM(CASE WHEN estado = 'REPROBADO' THEN 1 ELSE 0 END) as materias_reprobadas,
          AVG(promedio) as promedio_general,
          COUNT(DISTINCT periodo) as periodos_cursados
        FROM historial_academico
        WHERE id_estudiante = ?
      `, [id]);

      res.json({
        estudiante: studentInfo[0],
        historial: academicHistory,
        estadisticas: statistics[0]
      });
    } catch (error) {
      console.error('Error al obtener detalles del estudiante:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // Generar nueva predicción
  generatePrediction: async (req, res) => {
    const { id } = req.body;
    // Validación: verificar que se envió el id_estudiante
    if (!id){
      return res.status(400).json({ message: 'Falta el ID del estudiante'});
    }
    try {
      // Obtener datos académicos relevantes
      const [academicData] = await pool.execute(`
        SELECT 
          COUNT(*) as total_materias,
          SUM(CASE WHEN estado = 'REPROBADO' THEN 1 ELSE 0 END) as materias_reprobadas,
          AVG(promedio) as promedio_general,
          COUNT(DISTINCT periodo) as periodos_cursados
        FROM historial_academico
        WHERE id_estudiante = ?
      `, [id]);

      if (!academicData.length || !academicData[0].total_materias) {
        return res.status(400).json({ message: 'No hay suficientes datos académicos para este estudiante' });
      }
      
      // Calcular probabilidad de deserción (este es un ejemplo simplificado)
      const probabilidad = calcularProbabilidad(academicData[0]);
      
      // Determinar nivel de riesgo
      let nivel_riesgo;
      if (probabilidad > 0.7) nivel_riesgo = 'ALTO';
      else if (probabilidad > 0.4) nivel_riesgo = 'MEDIO';
      else nivel_riesgo = 'BAJO';

      // Guardar o actualizar predicción
      await pool.execute(
        `INSERT INTO prediccion (id_estudiante, nivel_riesgo, probabilidad)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE nivel_riesgo = ?, probabilidad = ?, fecha_prediccion = CURRENT_TIMESTAMP`,
        [id, nivel_riesgo, probabilidad, nivel_riesgo, probabilidad]
      );

      res.json({
        success: true,
        message: 'Predicción generada exitosamente',
        data: {
          id_estudiante: id,
          nivel_riesgo,
          probabilidad,
          fecha_prediccion: new Date()
        }
      });
    } catch (error) {
      console.error('Error al generar predicción:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};

module.exports = predictionController;