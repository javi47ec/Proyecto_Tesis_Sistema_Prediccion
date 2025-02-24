import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerDetalleEstudiante } from '../../services/estudiantesService';


const EstudianteDetail = () => {
  const { id } = useParams();
  const [detalles, setDetalles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDetalles = async () => {
      try {
        const data = await obtenerDetalleEstudiante(id);
        setDetalles(data);
      } catch (error) {
        console.error('Error al cargar detalles del estudiante:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDetalles();
  }, [id]);

  if (loading) {
    return <p>Cargando detalles...</p>;
  }

  if (!detalles) {
    return <p>No se encontraron detalles para este estudiante.</p>;
  }

  const { estudiante, historial, estadisticas } = detalles;

  return (
    <div>
      <h2>Detalles de {estudiante.nombres} {estudiante.apellidos}</h2>
      <p>ID: {estudiante.id}</p>
      <p><strong>Promedio General:</strong> {estudiante?.promedio_general?.toFixed(2) || 'No disponible'}</p>
      <p>Materias Reprobadas: {estadisticas.materias_reprobadas}</p>
      <p>Nivel de Riesgo: {estudiante.nivel_riesgo}</p>
      <p>Probabilidad: {(estudiante.probabilidad * 100).toFixed(2)}%</p>

      <h3>Historial Académico</h3>
      <table>
        <thead>
          <tr>
            <th>Periodo</th>
            <th>Asignatura</th>
            <th>Estado</th>
            <th>Promedio</th>
          </tr>
        </thead>
        <tbody>
          {historial.map((item, index) => (
            <tr key={index}>
              <td>{item.periodo}</td>
              <td>{item.nombre_asignatura}</td>
              <td>{item.estado}</td>
              <td>{item.promedio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EstudianteDetail;
