import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Alert, AlertTitle } from '@mui/material'; // Import Alert components

const PrediccionesPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const [predicciones, setPredicciones] = useState([]); // Initialize as empty array
  const [prediccionSeleccionada, setPrediccionSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [showErrorAlert, setShowErrorAlert] = useState(false); // State to manage error alert visibility
  const [showSuccessAlert, setShowSuccessAlert] = useState(false); // State to manage success alert visibility
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: 'success',
    message: 'Satisfacion'
  });
  // Modal de Acciones states
  const [modalAcciones, setModalAcciones] = useState(false);
  const [estudianteSeleccionado] = useState(null);
  const [accionesEstudiante, setAccionesEstudiante] = useState({
    descripcion: '',
    recomendacion: '',
    seguimiento: ''
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  // Estado para la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // 🔍 Filtrar predicciones por nombre
  const filteredPredicciones = predicciones.filter((prediccion) =>
    prediccion.estudiante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // 🔹 Intentar recuperar predicciones guardadas en localStorage
    const datosGuardados = JSON.parse(localStorage.getItem("predicciones"));

    if (datosGuardados && datosGuardados.length > 0) {
      console.log("📥 Cargando predicciones desde localStorage:", datosGuardados);
      setPredicciones(datosGuardados);
    }
  }, []); // 🔚 Se ejecuta solo una vez al montar el componente

  useEffect(() => {
    if (location.state && location.state.estudiantesRiesgo) {
      const estudiantesRiesgo = location.state.estudiantesRiesgo || [];
      const prediccionesData = location.state.predicciones || {};
      const periodoActivo = location.state.periodoActivo;

      const prediccionesFormateadas = estudiantesRiesgo.map((estudiante) => {
        const prediccion = prediccionesData[estudiante.id_estudiante] || {
          probabilidad: 0,
          nivelRiesgo: "BAJO",
        };

        return {
          id: estudiante.id_estudiante,
          estudiante: `${estudiante.nombres} ${estudiante.apellidos}`,
          probabilidad: prediccion.probabilidad ?? 0, // ✅ Si es undefined, lo reemplazamos con 0
          nivel: prediccion.nivelRiesgo || "BAJO", // ✅ Si es undefined, lo reemplazamos con "BAJO"
          periodo: estudiante.periodo || periodoActivo || 'PERIODO_DESCONOCIDO',
        };
      });

      setPredicciones(prediccionesFormateadas);
      localStorage.setItem("predicciones", JSON.stringify(prediccionesFormateadas)); // 🔥 Guardar en localStorage
      console.log("💾 Guardando predicciones en localStorage:", prediccionesFormateadas);
    }
  }, [location.state]);

  // 🔥 Función para asignar color según el nivel de riesgo (misma que en `EstudiantesPage.jsx`)
  const getColorForProbability = (probabilidad) => {
    if (probabilidad === undefined) return 'bg-gray-100'; // Sin datos

    if (probabilidad >= 0.8) return 'bg-red-700'; // 🔴 Muy Alto
    if (probabilidad >= 0.5) return 'bg-red-300'; // 🟠 Alto
    if (probabilidad >= 0.4) return 'bg-yellow-200'; // 🟡 Medio
    return 'bg-green-200'; // 🟢 Bajo
  };

  const obtenerHistorialAcademico = async (idEstudiante) => {
    try {
      const historial = await fetch(`http://localhost:5000/api/estudiantes/historial/${idEstudiante}`)
        .then(response => response.json());
      return historial;
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  };

  const verHistorial = async (estudiante) => {
    try {
      const historial = await obtenerHistorialAcademico(estudiante.id);
      setPrediccionSeleccionada({ ...estudiante, historial });
      setMostrarModal(true);
    } catch (error) {
      console.error('Error al cargar historial', error);
    }
  };


  const guardarAcciones = async () => {
    // Validate all fields are filled
    if (!accionesEstudiante.descripcion.trim() ||
      !accionesEstudiante.recomendacion.trim() ||
      !accionesEstudiante.seguimiento.trim()) {

      // Set error alert
      setAlertInfo({
        show: true,
        type: 'error',
        message: 'Todos los campos son obligatorios. Por favor completa todos los campos.'
      });

      // Hide alert after 5 seconds
      setTimeout(() => {
        setAlertInfo({ show: false, type: '', message: '' });
      }, 5000);

      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/estudiantes/acciones/guardar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: estudianteSeleccionado.id,
          descripcion: accionesEstudiante.descripcion,
          recomendacion: accionesEstudiante.recomendacion,
          seguimiento: accionesEstudiante.seguimiento,
        }),
      });

      if (response.ok) {
        // Set success alert
        setAlertInfo({
          show: true,
          type: 'success',
          message: 'Acciones guardadas exitosamente.'
        });

        // Hide alert after 5 seconds
        setTimeout(() => {
          setAlertInfo({ show: false, type: '', message: '' });
        }, 5000);

        // Reset form and close modal
        setAccionesEstudiante({ descripcion: "", recomendacion: "", seguimiento: "" });
        setModalAcciones(false);
      } else {
        // Set error alert for API error
        setAlertInfo({
          show: true,
          type: 'error',
          message: 'Error al guardar acciones. Inténtalo nuevamente.'
        });
      }
    } catch (error) {
      console.error("Error guardando acciones:", error);

      // Set error alert for network/unexpected errors
      setAlertInfo({
        show: true,
        type: 'error',
        message: 'Error al guardar acciones. Verifica tu conexión.'
      });
    }
  };

  const enviarReporteABienestar = () => {
    if (showErrorAlert) {
      return (
        <Alert severity="error" onClose={() => setShowErrorAlert(false)}>
          <AlertTitle>Error</AlertTitle>
          <strong>¡No hay predicciones disponibles!</strong>
        </Alert>
      );
    }

    // 📌 Obtener reportes anteriores de localStorage
    const reportesGuardados = JSON.parse(localStorage.getItem("reportes")) || [];

    // 🗂️ Clasificar estudiantes por nivel de riesgo y nivel académico
    const reporteAgrupado = {};
    predicciones.forEach((estudiante) => {
      const { nivel, probabilidad } = estudiante;

      if (!reporteAgrupado[nivel]) {
        reporteAgrupado[nivel] = {
          nivel,
          alto: [],
          medio: [],
        };
      }

      if (probabilidad >= 0.5) {
        reporteAgrupado[nivel].alto.push(estudiante);
      } else if (probabilidad >= 0.4) {
        reporteAgrupado[nivel].medio.push(estudiante);
      }
    });

    // 📅 Generar el nuevo reporte
    const nuevoReporte = {
      nombrePrediccion: `Reporte - ${new Date().toLocaleDateString()}`,
      fecha: new Date().toLocaleString(),
      estudiantes: reporteAgrupado,
    };

    // 📌 Guardar los reportes en localStorage
    const nuevosReportes = [...reportesGuardados, nuevoReporte];
    localStorage.setItem("reportes", JSON.stringify(nuevosReportes));

    alert("Reporte enviado a Bienestar Estudiantil ✅");

    const prediccionesConPeriodo = predicciones.map(prediccion => ({
      ...prediccion,
      // Usar el periodo directamente sin fallback
      periodo: prediccion.periodo
    }));

    console.log("Predicciones a enviar:", prediccionesConPeriodo); // Debug

    // Navigate to ReportesPage.jsx with data
    navigate('/reportes', {
      state: {
        predicciones: prediccionesConPeriodo

      }
    });
  };

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(predicciones.length / studentsPerPage);

  const visiblePages = () => {
    let start = Math.max(1, currentPage - 5);
    let end = Math.min(totalPages, currentPage + 5);
    let pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-3xl font-bold mb-4">Predicciones de Riesgo de Deserción</h1>

      <div className="flex justify-between items-center mb-4">
        {/* 🔍 Barra de búsqueda con lupa */}
        <div className="relative w-1/2">
          <input
            type="text"
            placeholder="Buscar estudiante..."
            className="w-full p-2 pl-10 border rounded"
            value={searchTerm}
            onChange={handleSearch}
          />
          <svg
            className="absolute left-3 top-3 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m-2.15 0A7.5 7.5 0 10 3 10.5a7.5 7.5 0 0010.5 7.15z" />
          </svg>
        </div>

        <button
          onClick={enviarReporteABienestar}
          disabled={predicciones.length === 0}
          className="bg-green-500 text-white p-2 rounded disabled:opacity-50"
        >
          Enviar Reporte
        </button>
      </div>

      {/* Tabla de predicciones */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="border p-2">Estudiante</th>
            <th className="border p-2">Probabilidad</th>
            <th className="border p-2">Nivel de Riesgo</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredPredicciones.slice(indexOfFirstStudent, indexOfLastStudent).map((prediccion, index) => (
            <tr key={index} className={`${getColorForProbability(prediccion.probabilidad)} hover:bg-gray-100`}>
              <td className="border p-2">{prediccion.estudiante}</td>
              <td className="border p-2">
                {parseFloat(prediccion.probabilidad * 100).toFixed(2)}%
              </td>
              <td className="border p-2">{prediccion.nivel}</td>
              <td className="border p-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => verHistorial(prediccion)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Ver Historial
                  </button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 mr-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
        >
          Anterior
        </button>

        {visiblePages().map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => paginate(pageNumber)}
            className={`px-3 py-2 mx-1 rounded ${currentPage === pageNumber ? 'bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 ml-2 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
        >
          Siguiente
        </button>
      </div>

      {showErrorAlert && (
        <Alert severity="error" onClose={() => setShowErrorAlert(false)}>
          <AlertTitle>Error</AlertTitle>
          Todos los campos son obligatorios. — <strong>¡Por favor complétalos!</strong>
        </Alert>
      )}

      {showSuccessAlert && (
        <Alert severity="success" onClose={() => setShowSuccessAlert(false)}>
          <AlertTitle>Success</AlertTitle>
          Acciones guardadas exitosamente. — <strong>¡Bien hecho!</strong>
        </Alert>
      )}

      {/* Modal de Historial Académico */}
      {mostrarModal && prediccionSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-2/3 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Historial de {prediccionSeleccionada.estudiante}
            </h2>
            <div className="overflow-auto max-h-96">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-blue-500 text-white">
                  <tr>
                    <th className="border p-2">Período</th>
                    <th className="border p-2">Asignatura</th>
                    <th className="border px-4 py-2">Nota 1P</th>
                    <th className="border px-4 py-2">Nota 2P</th>
                    <th className="border px-4 py-2">Nota 3P</th>
                    <th className="border p-2">Promedio</th>
                    <th className="border p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {prediccionSeleccionada.historial.map((registro, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="border p-2">{registro.periodo}</td>
                      <td className="border p-2">{registro.nombre_asignatura}</td>
                      <td className="border px-4 py-2 text-center">{registro.nota_1p}</td>
                      <td className="border px-4 py-2 text-center">{registro.nota_2p}</td>
                      <td className="border px-4 py-2 text-center">{registro.nota_3p}</td>
                      <td className="border px-4 py-2 text-center">{registro.promedio}</td>
                      <td className="border p-2">{registro.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setMostrarModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Acciones */}
      {modalAcciones && estudianteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">
              Acciones para {estudianteSeleccionado.estudiante}
            </h2>
            <div className="mb-4">
              <label className="block mb-2">Descripción de la Situación</label>
              <textarea
                value={accionesEstudiante.descripcion}
                onChange={(e) => setAccionesEstudiante(prev => ({
                  ...prev,
                  descripcion: e.target.value
                }))}
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Describa la situación del estudiante..."
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Recomendación</label>
              <select
                value={accionesEstudiante.recomendacion}
                onChange={(e) => setAccionesEstudiante(prev => ({
                  ...prev,
                  recomendacion: e.target.value
                }))}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccione una recomendación</option>
                <option value="Tutoría Académica">Tutoría Académica</option>
                <option value="Seguimiento Psicológico">Seguimiento Psicológico</option>
                <option value="Apoyo Económico">Apoyo Económico</option>
                <option value="Seguimiento Individual">Seguimiento Individual</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Plan de Seguimiento</label>
              <textarea
                value={accionesEstudiante.seguimiento}
                onChange={(e) => setAccionesEstudiante(prev => ({
                  ...prev,
                  seguimiento: e.target.value
                }))}
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Detalle el plan de seguimiento..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModalAcciones(false)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={guardarAcciones}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Guardar Acciones
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centralized Alert Component */}
      {alertInfo.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <Alert
            severity={alertInfo.type}
            onClose={() => setAlertInfo({ show: false, type: '', message: '' })}
          >
            <AlertTitle>{alertInfo.type === 'error' ? 'Error' : 'Éxito'}</AlertTitle>
            {alertInfo.message}
          </Alert>
        </div>
      )}
    </div>
  );
};

export default PrediccionesPage;