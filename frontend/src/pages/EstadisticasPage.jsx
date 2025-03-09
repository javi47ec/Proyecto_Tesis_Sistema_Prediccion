import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  obtenerDatosGeneralEstadisticas,
  obtenerDatosRendimientoEstadisticas,
  obtenerDistribucionNotasEstadisticas,
  obtenerRendimientoAsignaturasEstadisticas,
  obtenerCantidadEstudiantesPorNivel,
  obtenerEstadisticasConPredicciones
} from '../services/estudiantesService';
import api from '../services/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell
} from 'recharts';

// Función para oscurecer un color - movida fuera del componente para evitar recreaciones
const oscurecerColor = (hex, factor) => {
  // Convertir hex a RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Oscurecer
  const newR = Math.floor(r * (1 - factor));
  const newG = Math.floor(g * (1 - factor));
  const newB = Math.floor(b * (1 - factor));

  // Convertir de nuevo a hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// Colores constantes definidos fuera del componente
const COLORES_RIESGO = {
  ALTO: '#FF0000',    // Rojo para riesgo alto
  MEDIO: '#FFA500',   // Naranja para riesgo medio
  BAJO: '#008000'     // Verde para riesgo bajo
};

// Mantener los colores del primer código también para compatibilidad
const COLORES_RIESGO_ORIGINAL = {
  ALTO: { enCaliente: '#FF5733', historico: '#C70039' },  // Naranja - Rojo oscuro
  MEDIO: { enCaliente: '#FFC300', historico: '#FF8C00' },  // Amarillo - Naranja oscuro
  BAJO: { enCaliente: '#2ECC71', historico: '#1E8449' }    // Verde claro - Verde oscuro
};

// Tonalidades para diferenciar entre en caliente e histórico
const MODIFICADORES = {
  enCaliente: 0,      // Sin modificación para datos en caliente
  historico: 0.3      // Oscurecer ligeramente para datos históricos
};

const EstadisticasPage = () => {
  const [datosGenerales, setDatosGenerales] = useState({});
  const [datosRendimiento, setDatosRendimiento] = useState([]);
  const [distribucionNotas, setDistribucionNotas] = useState([]);
  const [rendimientoAsignaturas, setRendimientoAsignaturas] = useState([]);
  const [cantidadEstudiantes, setCantidadEstudiantes] = useState([]);

  const [nivelSeleccionado, setNivelSeleccionado] = useState('todos');
  const [niveles, setNiveles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarRecientes] = useState(false);
  const [estadisticas, setEstadisticas] = useState({ enCaliente: [], historico: [] });
  const [loadingPredicciones, setLoadingPredicciones] = useState(true);
  const [usarEstiloOriginal] = useState(false); // Toggle para cambiar entre estilos de colores
  const [limite] = useState(100);
  const [datos, setDatos] = useState([]); // Añadimos el estado datos para resolver el error


  useEffect(() => {
    api.get(`/estadisticas?limite=${limite}`)
      .then(res => setDatos(res.data))
      .catch(err => console.error("Error:", err));
  }, [limite]);

  useEffect(() => {
    fetch('/api/estadisticas')
      .then(res => res.json())
      .then(data => {
        setEstadisticas({
          enCaliente: data.enCaliente,
          historico: data.historico
        });
      })
      .catch(error => console.error("❌ Error al cargar estadísticas:", error));
  }, []);


  // Obtener niveles al inicio - solo una vez
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

  

  // Función para obtener datos de predicciones
  const fetchPredicciones = useCallback(async () => {
    try {
      setLoadingPredicciones(true);
      const data = await obtenerEstadisticasConPredicciones();
  
      if (!data || (!data.enCaliente && !data.historico)) {
        console.warn("⚠ No se encontraron datos de predicciones.");
        setEstadisticas({ enCaliente: [], historico: [] });
        return;
      }
  
      // Filtrar solo los estudiantes con nivel de riesgo ALTO o MEDIO
      const filtradoEnCaliente = data.enCaliente?.filter(item => item.nivel_riesgo === 'ALTO' || item.nivel_riesgo === 'MEDIO');
      const filtradoHistorico = data.historico?.filter(item => item.nivel_riesgo === 'ALTO' || item.nivel_riesgo === 'MEDIO');
  
      setEstadisticas({
        enCaliente: filtradoEnCaliente.map(item => ({ ...item, fuente: 'enCaliente' })) || [],
        historico: filtradoHistorico.map(item => ({ ...item, fuente: 'historico' })) || []
      });
  
      console.log("✅ Datos de predicciones cargados:", data);
  
    } catch (error) {
      console.error('❌ Error al obtener datos de predicciones:', error);
      setEstadisticas({ enCaliente: [], historico: [] });
    } finally {
      setLoadingPredicciones(false);
    }
  }, []);


  // Función principal para obtener datos - usado con carga condicional
  const fetchDatos = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = `?nivel=${encodeURIComponent(nivelSeleccionado)}${mostrarRecientes ? '&recientes=true' : ''}`;

      // Cargar los datos en paralelo para mejorar el rendimiento
      const [generalesRes, rendimientoRes, distribucionRes, asignaturasRes, cantidadEstudiantesRes] = await Promise.all([
        obtenerDatosGeneralEstadisticas(queryParams),
        obtenerDatosRendimientoEstadisticas(queryParams),
        obtenerDistribucionNotasEstadisticas(queryParams),
        obtenerRendimientoAsignaturasEstadisticas(queryParams),
        obtenerCantidadEstudiantesPorNivel()
      ]);

      // Actualizar estados solo si los datos son válidos
      if (generalesRes) {
        setDatosGenerales({ ...generalesRes });
      }

      if (Array.isArray(rendimientoRes)) {
        setDatosRendimiento(rendimientoRes);
      }

      if (Array.isArray(distribucionRes)) {
        setDistribucionNotas(distribucionRes);
      }

      if (Array.isArray(asignaturasRes)) {
        setRendimientoAsignaturas(
          nivelSeleccionado === "todos"
            ? asignaturasRes
            : asignaturasRes.filter(a => a.nivel === nivelSeleccionado)
        );
      }

      if (Array.isArray(cantidadEstudiantesRes)) {
        setCantidadEstudiantes(cantidadEstudiantesRes);
      }
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
    } finally {
      setLoading(false);
    }
  }, [nivelSeleccionado, mostrarRecientes]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  // Efecto separado para cargar predicciones
  useEffect(() => {
    fetchPredicciones();
  }, [fetchPredicciones]);

  // Obtener la cantidad de estudiantes para el nivel seleccionado - memoizado
  const estudiantesEnNivel = useMemo(() => {
    if (!Array.isArray(cantidadEstudiantes)) return 0;
    const nivelData = cantidadEstudiantes.find(n => n.nivel === nivelSeleccionado);
    return nivelData ? nivelData.cantidadEstudiantes : 0;
  }, [cantidadEstudiantes, nivelSeleccionado]);

  // Datos para el gráfico de predicciones - memoizado para evitar recálculos
  const datosPrediccion = useMemo(() => {
    const tieneCaliente = estadisticas.enCaliente && estadisticas.enCaliente.length > 0;
    const tieneHistorico = estadisticas.historico && estadisticas.historico.length > 0;

    if (!tieneCaliente && !tieneHistorico) return [];

    // Crear un solo array de datos con fuente claramente identificada
    const datos = [];

    if (tieneCaliente) {
      datos.push(...estadisticas.enCaliente);
    }

    if (tieneHistorico) {
      datos.push(...estadisticas.historico);
    }

    return datos;
  }, [estadisticas]);

  // Función para obtener el color según nivel de riesgo y fuente - memoizada
  const getColor = useCallback((nivel_riesgo, fuente) => {
    if (usarEstiloOriginal) {
      // Usar el esquema de colores del primer código
      return COLORES_RIESGO_ORIGINAL[nivel_riesgo]?.[fuente] || '#808080'; // Gris por defecto
    } else {
      // Usar el esquema de colores del segundo código
      const colorBase = COLORES_RIESGO[nivel_riesgo] || '#808080'; // Gris por defecto

      if (fuente === 'historico') {
        // Oscurecer el color para datos históricos
        return oscurecerColor(colorBase, MODIFICADORES[fuente]);
      }

      return colorBase;
    }
  }, [usarEstiloOriginal]);

  // Renderizar gráficos solo si hay datos
  const renderizarGraficos = useCallback(() => {
    // Verificar si hay datos para mostrar
    const hayCantidadEstudiantes = Array.isArray(cantidadEstudiantes) && cantidadEstudiantes.length > 0;
    const hayRendimientoAsignaturas = Array.isArray(rendimientoAsignaturas) && rendimientoAsignaturas.length > 0;
    const hayDistribucionNotas = Array.isArray(distribucionNotas) && distribucionNotas.length > 0;
    const hayDatosRendimiento = Array.isArray(datosRendimiento) && datosRendimiento.length > 0;

    if (!hayCantidadEstudiantes && !hayRendimientoAsignaturas && !hayDistribucionNotas && !hayDatosRendimiento) {
      return <p className="text-center text-gray-500 py-4">No hay datos estadísticos disponibles.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Rendimiento por Parcial */}
        {hayDatosRendimiento && (
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
        )}

        {/* Rendimiento por Asignatura */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Rendimiento por Asignatura</h2>
          {!hayRendimientoAsignaturas ? (
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
        {hayDistribucionNotas && (
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
        )}

        {/* Cantidad de Estudiantes por Nivel */}
        {hayCantidadEstudiantes && (
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
        )}
      </div>
    );
  }, [cantidadEstudiantes, datosRendimiento, distribucionNotas, rendimientoAsignaturas]);

  // Renderizar gráfico de predicciones mejorado
  const renderizarGraficoPredicciones = useCallback(() => {
    if (!Array.isArray(datosPrediccion) || datosPrediccion.length === 0) {
      return (
        <p className="text-center text-gray-500 py-4">No hay datos de predicciones disponibles.</p>
      );
    }

    return (
      <>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosPrediccion}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nivel_riesgo" />
            <YAxis />
            <Tooltip
              formatter={(value, name, props) => {
                if (props && props.payload) {
                  const { nivel_riesgo, fuente } = props.payload;
                  return [
                    `${value}`,
                    `${nivel_riesgo} - ${fuente === 'enCaliente' ? 'Actuales' : 'Histórico'}`
                  ];
                }
                return [value, name];
              }}
            />
            <Bar dataKey="probabilidad" name="Predicción">
              {datosPrediccion.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.nivel_riesgo, entry.fuente)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Leyenda mejorada con todos los tipos de riesgo */}
        <div className="flex flex-wrap justify-center mt-4 gap-4">
          <div className="border p-2 rounded">
            <h4 className="font-semibold text-center mb-2">Niveles de Riesgo</h4>
            <div className="flex gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#FF0000] mr-2"></div>
                <span>ALTO</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#FFA500] mr-2"></div>
                <span>MEDIO</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#008000] mr-2"></div>
                <span>BAJO</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }, [datosPrediccion, getColor]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Estadísticas Académicas</h1>

      <div className="flex flex-wrap gap-4 mb-6">
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
          <p className="text-2xl">{estudiantesEnNivel}</p>
        </div>
      </div>

      {/* Sección de Predicciones - Carga Separada */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Predicciones de Deserción</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Predicciones Actuales</h2>
          {loadingPredicciones ? (
            <div className="text-center py-4">Cargando predicciones...</div>
          ) : renderizarGraficoPredicciones()}
        </div>
      </div>

      {/* Gráficos estadísticos */}
      <h2 className="text-xl font-bold mb-4">Estadísticas Generales</h2>
      {loading ? (
        <div className="text-center py-4">Cargando datos...</div>
      ) : (
        renderizarGraficos()
      )}
    </div>
  );
};

export default EstadisticasPage;


