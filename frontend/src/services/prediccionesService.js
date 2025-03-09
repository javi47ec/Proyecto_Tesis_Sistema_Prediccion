import api from './api';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/estudiantes';

export const obtenerPrediccion = async (historial, log = false) => {
  if (!Array.isArray(historial) || historial.length === 0) {
    throw new Error('El historial debe ser un arreglo no vacío.');
  }

  try {
    const response = await api.post('/model/predict', { historial }, { timeout: 5000 }); // 5s timeout

    if (log) {
      console.log('Datos enviados:', historial);
      console.log('Respuesta recibida:', response.data);
    }

    return {
      prediccion: response.data.prediccion,
      status: response.status,
      timestamp: new Date(),
    };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('La solicitud tardó demasiado y fue cancelada.');
      throw new Error('Tiempo de espera agotado al obtener la predicción.');
    }

    if (error.response) {
      console.error('Error del servidor:', error.response.data);
      throw new Error(error.response.data.message || 'Error al obtener predicción del servidor');
    } else if (error.request) {
      console.error('No hubo respuesta del servidor:', error.request);
      throw new Error('No hubo respuesta del servidor. Verifica tu conexión.');
    } else {
      console.error('Error desconocido:', error.message);
      throw new Error('Error inesperado al obtener predicción.');
    }
  }
};

const obtenerPredicciones = async () => {
  try {
    const response = await api.get(`${API_URL}/predicciones`);
    console.log('Respuesta completa:', response.data); // Para ver qué estructura tiene realmente
    // Si no estás seguro de la estructura, simplemente devuelve response.data
    return response.data.predicciones || response.data;
  } catch (error) {
    console.error('Error al obtener las predicciones:', error);
    throw error;
  }
};
// Nuevo método para predicciones futuras

export const obtenerPrediccionesFuturas = async (archivo, datos) => {
  console.log("📡 Enviando datos al backend...", datos);
  
  const formData = new FormData();
  formData.append('archivo', archivo);
  formData.append('datos', JSON.stringify(datos));
  
  try {
    const response = await axios.post(
      `${API_URL}/predecir-datos-futuros`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error del servidor:", error);
    throw error;
  }
};
// Guardar predicciones en caliente
const guardarPrediccion = async (idEstudiante, nivelRiesgo, probabilidad) => {
  try {
    const response = await api.post("/predicciones/guardar", {
      id_estudiante: idEstudiante,
      nivel_riesgo: nivelRiesgo,
      probabilidad: probabilidad
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error al guardar la predicción:", error);
    throw error.response?.data?.message || "Error al guardar la predicción.";
  }
}

export { obtenerPredicciones, guardarPrediccion };
