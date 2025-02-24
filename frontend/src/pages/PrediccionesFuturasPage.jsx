import React, { useState } from 'react';
import SubirExcel from '../components/SubirExcel';

const PrediccionesFuturasPage = () => {
  const [predicciones, setPredicciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 10; // Puedes cambiar este valor según lo necesites

  const handlePrediccionesRecibidas = (nuevasPredicciones) => {
    if (nuevasPredicciones?.predicciones) {
      setPredicciones(nuevasPredicciones.predicciones);
      setPaginaActual(1); // Reiniciar a la primera página cuando se cargan nuevas predicciones
    } else {
      
    }
    setLoading(false);
  };

  const handleLoadingChange = (isLoading) => {
    setLoading(isLoading);
    if (isLoading) {
      setError(null);
    }
  };

  // Función para filtrar predicciones
  const filtrarPredicciones = (termino) => {
    return predicciones.filter(pred => {
      const idCoincide = pred.ID.toUpperCase().includes(termino.toUpperCase());
      const nombreCoincide = pred.nombre.toUpperCase().includes(termino.toUpperCase());
      const cedulaCoincide = pred.cedula.toUpperCase().includes(termino.toUpperCase());
      return idCoincide || nombreCoincide || cedulaCoincide;
    });
  };

  // Calcular el índice de los elementos a mostrar en la página actual
  const prediccionesFiltradas = filtrarPredicciones(terminoBusqueda);
  const indiceInicial = (paginaActual - 1) * filasPorPagina;
  const indiceFinal = indiceInicial + filasPorPagina;
  const prediccionesPaginadas = prediccionesFiltradas
    .slice(indiceInicial, indiceFinal)
    .map(pred => ({
      ...pred,
      promedio: pred.promedio || 0, // Asignar 0 si pred.promedio es undefined o null
    }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📊 Predicción Futura de Riesgo de Deserción</h1>
      <p className="mb-4">Sube un archivo Excel con datos académicos para predecir riesgos de deserción.</p>

      <SubirExcel
        onUploadSuccess={handlePrediccionesRecibidas}
        onLoadingChange={handleLoadingChange}
      />

      {loading && (
        <div className="my-4 text-center">
          <p>Procesando datos...</p>
        </div>
      )}

      {error && (
        <div className="my-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      )}

      {predicciones.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">📊 Resultados de la Predicción</h2>

          {/* Barra de búsqueda */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por ID, nombre o cédula..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tabla de resultados */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left">ID Estudiante</th>
                  <th className="px-6 py-3 border-b text-left">Nombre</th>
                  <th className="px-6 py-3 border-b text-left">Cédula</th>
                  <th className="px-6 py-3 border-b text-center">1P</th>
                  <th className="px-6 py-3 border-b text-center">2P</th>
                  <th className="px-6 py-3 border-b text-center">3P</th>
                  <th className="px-6 py-3 border-b text-left">Nivel de Riesgo</th>
                  <th className="px-6 py-3 border-b text-left">Comentario</th>
                </tr>
              </thead>
              <tbody>
                {prediccionesPaginadas.map((pred, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 border-b">{pred.ID}</td>
                    <td className="px-6 py-4 border-b">{pred.nombre}</td>
                    <td className="px-6 py-4 border-b">{pred.cedula}</td>
                    <td className="px-6 py-4 border-b text-center">{pred.nota1 || ''}</td>
                    <td className="px-6 py-4 border-b text-center">{pred.nota2 || ''}</td>
                    <td className="px-6 py-4 border-b text-center">{pred.nota3 || ''}</td>
                    <td className="px-6 py-4 border-b">
                      <span className={`px-2 py-1 rounded ${pred.nivelRiesgo === 'ALTO' ? 'bg-red-100 text-red-800' :
                          pred.nivelRiesgo === 'MEDIO' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {pred.nivelRiesgo}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b">{pred.comentario || "Sin comentario"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación */}
          <div className="flex justify-between items-center mt-4">
            <button
              className={`px-4 py-2 rounded ${paginaActual === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
              onClick={() => setPaginaActual(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              ⬅ Anterior
            </button>

            <p className="text-sm font-medium">
              Página {paginaActual} de {Math.ceil(prediccionesFiltradas.length / filasPorPagina)}
            </p>

            <button
              className={`px-4 py-2 rounded ${indiceFinal >= prediccionesFiltradas.length ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
              onClick={() => setPaginaActual(paginaActual + 1)}
              disabled={indiceFinal >= prediccionesFiltradas.length}
            >
              Siguiente ➡
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrediccionesFuturasPage;