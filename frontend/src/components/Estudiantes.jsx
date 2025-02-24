import React, { useState, useEffect } from "react";
import axios from "axios";

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);

  useEffect(() => {
    // Cargar los datos de los estudiantes desde el backend
    const fetchEstudiantes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/estudiantes");
        setEstudiantes(response.data);
      } catch (error) {
        console.error("Error al obtener los estudiantes:", error);
      }
    };

    fetchEstudiantes();
  }, []);

  return (
    <div>
      <h2>Lista de Estudiantes</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Cédula</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((estudiante) => (
            <tr key={estudiante.id_estudiante}>
              <td>{estudiante.id_estudiante}</td>
              <td>{estudiante.nombres}</td>
              <td>{estudiante.apellidos}</td>
              <td>{estudiante.cedula}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Estudiantes;
