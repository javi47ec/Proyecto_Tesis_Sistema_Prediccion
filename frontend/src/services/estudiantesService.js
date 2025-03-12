import api from './api'; // Configuración base de Axios

const API_URL = 'http://localhost:5000/api/estudiantes';

// Obtener detalles completos de un estudiante por ID
export const obtenerEstudiantePorId = async (id) => {
  try {
    const response = await api.get(`/estudiantes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estudiante por ID:', error);
    throw error;
  }
};

export const guardarAcciones = async (acciones) => {
  try {
    const response = await api.post(`http://localhost:5000/api/estudiantes/acciones/guardar`, acciones);
    return response.data;
  } catch (error) {
    console.error('Error al guardar acciones:', error);
    throw error;
  }
};

// Obtener historial académico de un estudiante por ID
export const obtenerHistorialAcademico = async (id) => {
  console.log("ID del estudiante", id);
  try {
    const studentId = typeof id === 'string' && id.includes('http') 
      ? id.split('/').pop() 
      : id;
      
    const response = await api.get(`${API_URL}/historial/${studentId}`);
    console.log('Historial académico:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el historial académico:', error);
    throw error;
  }
};

export const obtenerEstudiantesFiltrados = async (nivel, periodo = "202450") => {
  try {
    console.log(`📡 Enviando solicitud al backend con: nivel=${nivel}, periodo=${periodo}`);

    const response = await api.get(`/estudiantes/filtrados?nivel=${nivel}&periodo=${periodo}`);

    console.log("✅ Respuesta del backend:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error al obtener estudiantes filtrados:", error);
    throw error;
  }
};


// Obtener lista básica de estudiantes
export const obtenerEstudiantesBasico = async () => {
  try {
    const response = await api.get(`${API_URL}/basico`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los estudiantes:', error);
    throw error;
  }
};

export const obtenerPeriodos = async () => {
  try {
    const response = await api.get(`${API_URL}/periodos`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener periodos:', error);
    throw error;
  }
}

export const obtenerNiveles = async () => {
  try {
    const response = await api.get(`${API_URL}/niveles`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener niveles:', error);
    throw error;
  }
}

// Predicción de estudiante esto por el modelo de predicción
export const realizarPrediccionesMultiples = async (estudiantes) => {
  try {
    const response = await api.post(`${API_URL}/predict`, estudiantes);
    return response.data;
  } catch (error) {
    if (error.response) {
      // El servidor respondió con un status fuera del rango 2xx
      throw new Error(`Error ${error.response.status}: ${error.response.data.error}`);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      throw new Error('No se recibió respuesta del servidor');
    } else {
      throw new Error('Error al realizar la petición');
    }
  }
};


// Obtener detalles completos de un estudiante
export const obtenerDetalleEstudiante = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles del estudiante:', error);
    throw error;
  }
};

// OBTENER DATOS DE ESTADÍSTICAS
export const obtenerDatosGeneralEstadisticas = async () => {
  try {
    const response = await api.get(`http://localhost:5000/api/estadisticas/datos-generales`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de estadísticas:', error);
    throw error;
  }
};

export const obtenerDatosRendimientoEstadisticas = async () => {
  try {
    const response = await api.get(`http://localhost:5000/api/estadisticas/datos-rendimiento`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de rendimiento estadísticas:', error);
    throw error;
  }
};

export const obtenerDistribucionNotasEstadisticas = async () => {
  try {
    const response = await api.get(`http://localhost:5000/api/estadisticas/distribucion-notas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de distribucion notas estadísticas:', error);
    throw error;
  }
};

export const obtenerPrediccionRiesgoEstadisticas = async () => {
  try {
    const response = await api.get(`http://localhost:5000/api/estadisticas/prediccion-riesgo`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de prediccion riesgo estadísticas:', error);
    throw error;
  }
};


export const obtenerRendimientoAsignaturasEstadisticas = async () => {
  try {
    const response = await api.get(`http://localhost:5000/api/estadisticas/rendimiento-asignaturas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de rendimiento asignaturas estadísticas:', error);
    throw error;
  }
};


export const obtenerCantidadEstudiantesPorNivel = async (nivel = 'todos') => {
  try {
    const response = await api.get(`http://localhost:5000/api/estadisticas/estudiantes-por-nivel`, {
      params: { nivel }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener cantidad de estudiantes por nivel:', error);
    throw error;
  }
};

export const obtenerEstadisticasConPredicciones = async () => {
  try {
    const response = await api.get(`http://localhost:5000/api/estadisticas`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    throw new Error('Error al obtener estadísticas.');
  }
};
// METODOS PARA SEGUMIENTO DE ESTUDIANTES
export const obtenerSeguimientos = async () => {
  try {
    const response = await api.get(`http://localhost:5000/api/seguimientos/listar`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener seguimientos:', error);
    throw error;
  }
};

export const guardarSeguimiento = async ({ id_estudiante, id_docente, comentario }) => {
  try {
    console.log("📡 Enviando datos al backend:", { id_estudiante, id_docente, comentario });

    const response = await api.post(`http://localhost:5000/api/seguimientos/guardar-seguimiento`, {
      id_estudiante,
      id_docente,
      comentario,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error al guardar seguimiento:", error.response?.data || error.message);
    throw error;
  }
};

// 📌 Actualizar el estado del seguimiento (Bienestar Estudiantil)
export const actualizarSeguimiento = async (idSeguimiento, nuevoEstado) => {
  try {
    const response = await api.put(`/seguimientos/actualizar-seguimiento/${idSeguimiento}`, {
      estado: nuevoEstado,
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar seguimiento:", error);
    throw error;
  }
};


