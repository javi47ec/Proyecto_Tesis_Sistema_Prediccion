import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { obtenerEstudiantes, predecirRiesgo } from '../../services/estudiantesService';
import { useNavigate } from 'react-router-dom';

const EstudiantesList = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState('1');
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar estudiantes por nivel, curso y periodo
  const cargarEstudiantes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerEstudiantes(nivelSeleccionado, cursoSeleccionado, periodoSeleccionado);
      setEstudiantes(data);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    } finally {
      setLoading(false);
    }
  }, [nivelSeleccionado, cursoSeleccionado, periodoSeleccionado]);

  useEffect(() => {
    cargarEstudiantes();
  }, [cargarEstudiantes]);

  // Realizar predicción de riesgo
  const realizarPrediccion = async () => {
    setLoading(true);
    try {
      const predicciones = await predecirRiesgo(nivelSeleccionado, cursoSeleccionado, periodoSeleccionado);
      setEstudiantes(predicciones);
    } catch (error) {
      console.error('Error al predecir riesgo:', error);
    } finally {
      setLoading(false);
    }
  };

  const EstudianteCard = ({ estudiante }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{estudiante.nombres} {estudiante.apellidos}</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            Nivel {estudiante.nivel}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>ID: {estudiante.id_estudiante}</p>
          <p>Promedio General: {estudiante.promedio_general?.toFixed(2)}</p>
          <p>Materias Aprobadas: {estudiante.materias_aprobadas}</p>
          <p>Materias Reprobadas: {estudiante.materias_reprobadas}</p>
          <button 
            onClick={() => navigate(`/estudiantes/${estudiante.id_estudiante}`)}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Detalles
          </button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lista de Estudiantes</h2>

        {/* Selección de filtros */}
        <div className="flex space-x-4">
          {/* Filtro por nivel */}
          <Select value={nivelSeleccionado} onValueChange={setNivelSeleccionado}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Seleccionar nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Nivel 1</SelectItem>
              <SelectItem value="2">Nivel 2</SelectItem>
              <SelectItem value="3">Nivel 3</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro por curso */}
          <Select value={cursoSeleccionado} onValueChange={setCursoSeleccionado}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Seleccionar curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Curso1">Curso 1</SelectItem>
              <SelectItem value="Curso2">Curso 2</SelectItem>
              {/* Agregar otros cursos */}
            </SelectContent>
          </Select>

          {/* Filtro por periodo */}
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-I">2025-I</SelectItem>
              <SelectItem value="2025-II">2025-II</SelectItem>
              {/* Agregar otros periodos */}
            </SelectContent>
          </Select>
        </div>

        {/* Botón para realizar la predicción */}
        <button 
          onClick={realizarPrediccion} 
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Realizar Predicción
        </button>
      </div>

      {/* Mostrar carga mientras se obtienen los datos */}
      {loading ? (
        <div className="flex justify-center">
          <p>Cargando estudiantes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estudiantes.map((estudiante) => (
            <EstudianteCard key={estudiante.id_estudiante} estudiante={estudiante} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EstudiantesList;
