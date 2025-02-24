import React, { useCallback, useEffect, useState } from 'react';
import {
  obtenerDatosGeneralEstadisticas,
  obtenerDatosRendimientoEstadisticas,
  obtenerDistribucionNotasEstadisticas,
  obtenerRendimientoAsignaturasEstadisticas,
  obtenerCantidadEstudiantesPorNivel
} from '../services/estudiantesService';

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';

const EstadisticasPage = () => {
  const [datosGenerales, setDatosGenerales] = useState({});
  const [datosRendimiento, setDatosRendimiento] = useState([]);
  const [distribucionNotas, setDistribucionNotas] = useState([]);
  const [rendimientoAsignaturas, setRendimientoAsignaturas] = useState([]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState('todos');
  const [niveles, setNiveles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cantidadEstudiantes, setCantidadEstudiantes] = useState([]);
  const [mostrarRecientes, setMostrarRecientes] = useState(false);

  // Obtener niveles al inicio
  useEffect(() => {
    const fetchNiveles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/niveles');
        const data = await response.json();
        setNiveles(data);
      } catch (error) {
        console.error('Error al obtener niveles:', error);
      }
    };
    fetchNiveles();
  }, []);

  useEffect(() => {
    console.log("📊 Estado de datos generales actualizado:", datosGenerales);
  }, [datosGenerales]);


  // Función principal para obtener datos

  const fetchDatos = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = `?nivel=${encodeURIComponent(nivelSeleccionado)}${mostrarRecientes ? '&recientes=true' : ''}`;

      console.log("🔍 Nivel enviado a la API:", nivelSeleccionado);
      console.log("🔗 URL de la API:", `http://localhost:5000/api/estadisticas/datos-generales${queryParams}`);

      // Obtener datos generales
      const generalesRes = await obtenerDatosGeneralEstadisticas(queryParams);
      console.log("📊 Datos generales recibidos:", generalesRes);

      setDatosGenerales({ ...generalesRes });  // 🔥 Asegurar re-renderizado

      // Obtener rendimiento por parcial
      const rendimientoRes = await obtenerDatosRendimientoEstadisticas(queryParams);
      console.log("📊 Datos de rendimiento por parcial recibidos:", rendimientoRes);

      setDatosRendimiento([...rendimientoRes]);  // 🔥 Asegurar actualización
      console.log("📊 Estado actualizado de Rendimiento por Parcial:", datosRendimiento);


      // Obtener distribución de notas
      const distribucionRes = await obtenerDistribucionNotasEstadisticas(queryParams);
      setDistribucionNotas(distribucionRes);

      // Obtener rendimiento por asignaturas
      const asignaturasRes = await obtenerRendimientoAsignaturasEstadisticas(queryParams);
      console.log("📊 Datos de rendimiento por asignatura recibidos:", asignaturasRes);

      setRendimientoAsignaturas(
        nivelSeleccionado === "todos" ? asignaturasRes : asignaturasRes.filter(a => a.nivel === nivelSeleccionado)
      );


      // Obtener cantidad de estudiantes
      const cantidadEstudiantesRes = await obtenerCantidadEstudiantesPorNivel();
      setCantidadEstudiantes(cantidadEstudiantesRes);

    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
    } finally {
      setLoading(false);
    }
  }, [nivelSeleccionado, mostrarRecientes]);  // 🔥 Añadimos dependencias

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);  // 🔥 Se ejecuta cuando cambia `fetchDatos`




  // Obtener la cantidad de estudiantes para el nivel seleccionado
  const getEstudiantesPorNivel = () => {
    if (!Array.isArray(cantidadEstudiantes)) return 0;
    const nivelData = cantidadEstudiantes.find(n => n.nivel === nivelSeleccionado);
    return nivelData ? nivelData.cantidadEstudiantes : 0;
  };

  // Renderizar gráficos solo si hay datos
  const renderizarGraficos = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gráfico de Rendimiento por Parcial */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Rendimiento por Parcial</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datosRendimiento}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="parcial" />
            <YAxis domain={[0, 20]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="promedio" stroke="#8884d8" name="Promedio" />
            <Line type="monotone" dataKey="minimo" stroke="#82ca9d" name="Mínimo" />
            <Line type="monotone" dataKey="maximo" stroke="#ff7300" name="Máximo" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rendimiento por Asignatura */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Rendimiento por Asignatura</h2>
        {rendimientoAsignaturas.length === 0 ? (
          <p className="text-center text-gray-500">No hay datos disponibles para este nivel.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rendimientoAsignaturas.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="asignatura" />
              <YAxis domain={[0, 20]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="promedio" fill="#8884d8" name="Promedio" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>


      {/* Distribución de Notas */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Distribución de Notas</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distribucionNotas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rango" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad" fill="#82ca9d" name="Cantidad de Notas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cantidad de Estudiantes por Nivel */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Cantidad de Estudiantes por Nivel</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cantidadEstudiantes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nivel" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidadEstudiantes" fill="#8884d8" name="Cantidad de Estudiantes" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Estadísticas Académicas</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={nivelSeleccionado}
          onChange={(e) => setNivelSeleccionado(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="todos">Todos los Niveles</option>
          {niveles.map((nivel) => (
            <option key={nivel.nombre} value={nivel.nombre}>
              {nivel.nombre}
            </option>
          ))}
        </select>


      </div>

      {/* Dashboard de métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h3 className="font-bold">Promedio General</h3>
          <p className="text-2xl">{datosGenerales?.promedioGeneral || 'Cargando...'}</p>
        </div>
        {nivelSeleccionado === "todos" && (
          <>
            <div className="bg-green-100 p-4 rounded-lg shadow">
              <h3 className="font-bold">Créditos Cursados</h3>
              <p className="text-2xl">{datosGenerales?.creditosCursados || 'Cargando...'}</p>
            </div>

            <div className="bg-yellow-100 p-4 rounded-lg shadow">
              <h3 className="font-bold">Asignaturas</h3>
              <p className="text-2xl">{datosGenerales?.asignaturas || 'Cargando...'}</p>
            </div>
          </>
        )}

        <div className="bg-purple-100 p-4 rounded-lg shadow">
          <h3 className="font-bold">Estudiantes en el Nivel</h3>
          <p className="text-2xl">{getEstudiantesPorNivel()}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Cargando datos...</div>
      ) : (
        renderizarGraficos()
      )}
    </div>
  );
};

export default EstadisticasPage;