import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom'; // Import useLocation
import * as XLSX from "xlsx";

const ReportesPage = () => {
  const location = useLocation(); // Initialize useLocation
  const [reportes, setReportes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    const reportesGuardados = JSON.parse(localStorage.getItem("reportes")) || [];

    // Check if there are predicciones passed from PrediccionesPage
    if (location.state && location.state.predicciones) {
      // Create a new report object with the predicciones
      const nuevoReporte = {
        nombrePrediccion: `Reporte - ${new Date().toLocaleDateString()}`,
        fecha: new Date().toLocaleString(),
        estudiantes: location.state.predicciones.map(prediccion => ({
          id_estudiante: prediccion.id || prediccion.id_estudiante,
          estudiante: prediccion.estudiante,
          probabilidad: prediccion.probabilidad,
          nivel: prediccion.nivel,
          carrera: prediccion.carrera || "N/A",
          periodo: prediccion.periodo
        }))
      };

      // Combine existing reports with new report
      const updatedReportes = [...reportesGuardados, nuevoReporte];

      // Update localStorage and state
      localStorage.setItem("reportes", JSON.stringify(updatedReportes));
      setReportes(updatedReportes);
    } else {
      // If no new predictions, just set existing reports
      setReportes(reportesGuardados);
    }
  }, [location.state]);

  // Función para generar comentarios dinámicos
  const generarComentario = (probabilidad) => {
    if (probabilidad >= 0.8) return "Riesgo Muy Alto - Requiere Intervención Inmediata";
    if (probabilidad >= 0.5) return "Riesgo Alto - Seguimiento Cercano";
    if (probabilidad >= 0.4) return "Riesgo Medio - Monitoreo Preventivo";
    return "Riesgo Bajo - Sin Necesidad de Intervención";
  };

  // Agrupar estudiantes por nivel de riesgo y nivel de carrera
  const agruparPorNivelYRiesgo = () => {
    const agrupados = { alto: [], medio: [] };
    reportes.forEach((reporte) => {
      const estudiantesConDetalles = Array.isArray(reporte.estudiantes) ? reporte.estudiantes.map(estudiante => ({
        ...estudiante,
        periodo: estudiante.periodo,
        comentario: generarComentario(estudiante.probabilidad)
      })) : [];

      estudiantesConDetalles.forEach(est => {
        if (est.probabilidad >= 0.5) {
          agrupados.alto.push(est);
        } else if (est.probabilidad >= 0.4) {
          agrupados.medio.push(est);
        }
      });
    });
    return agrupados;
  };

  // Asignar color según nivel de riesgo
  const getColorForProbability = (probabilidad) => {
    if (probabilidad >= 0.8) return "bg-red-700 text-white";
    if (probabilidad >= 0.5) return "bg-red-300";
    if (probabilidad >= 0.4) return "bg-yellow-200";
    return "bg-green-200";
  };

  const datosAgrupados = agruparPorNivelYRiesgo();

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(reportes.length / studentsPerPage);

  const visiblePages = () => {
    let start = Math.max(1, currentPage - 5);
    let end = Math.min(totalPages, currentPage + 5);
    let pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Generar y descargar Excel
  const descargarExcel = () => {
    const wb = XLSX.utils.book_new();
    ["alto", "medio"].forEach((riesgo) => {
      const data = datosAgrupados[riesgo].map((est) => ({
        ID: est.id_estudiante,
        Estudiante: est.estudiante,
        Nivel: est.nivel,
        Periodo: est.periodo || 'PERIODO_DESCONOCIDO',
        "Probabilidad de Deserción (%)": (est.probabilidad * 100).toFixed(2),
        Comentario: est.comentario || "N/A",
      }));

      if (data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, riesgo.toUpperCase());
      }
    });

    XLSX.writeFile(wb, "Reporte_Estudiantes.xlsx");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">📊 Reportes de Riesgo de Deserción</h1>
        {/* Botón para descargar Excel */}
        <button
          onClick={descargarExcel}
          className={`
    ${reportes.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'}
    font-semibold py-2 px-4 rounded-lg inline-flex items-center transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50
  `}
          disabled={reportes.length === 0}
        >
          <svg
            className="fill-current w-5 h-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
          </svg>
          <span>Descargar Excel</span>
        </button>
      </div>

      {Object.keys(datosAgrupados).length === 0 ? (
        <p>No hay reportes generados.</p>
      ) : (
        <div>
          {["alto", "medio"].map((riesgo) => (
            datosAgrupados[riesgo] && datosAgrupados[riesgo].length > 0 && ( // ✅ Solo mostrar si hay datos
              <div key={riesgo} className="mb-6 border p-4 rounded shadow">
                <h3 className="text-xl font-semibold mb-2">Riesgo: {riesgo.toUpperCase()}</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-500 text-white">
                      <th className="border p-2">ID</th>
                      <th className="border p-2">Estudiante</th>

                      <th className="border p-2">Probabilidad (%)</th>
                      <th className="border p-2">Comentarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosAgrupados[riesgo]
                      .slice(indexOfFirstStudent, indexOfLastStudent)
                      .map((est, idx) => (
                        <tr key={idx} className={getColorForProbability(est.probabilidad)}>
                          <td className="border p-2">{est.id_estudiante}</td>
                          <td className="border p-2">{est.estudiante}</td>

                          <td className="border p-2">{(est.probabilidad * 100).toFixed(2)}%</td>
                          <td className="border p-2">{est.comentario || "N/A"}</td>
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
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportesPage;