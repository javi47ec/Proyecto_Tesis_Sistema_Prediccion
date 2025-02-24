import React, { useState, useEffect } from "react";
import axios from "axios";

const Docentes = () => {
  const [docentes, setDocentes] = useState([]);

  useEffect(() => {
    // Cargar los datos de los docentes desde el backend
    const fetchDocentes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/docentes");
        setDocentes(response.data);
      } catch (error) {
        console.error("Error al obtener los docentes:", error);
      }
    };

    fetchDocentes();
  }, []);

  return (
    <div>
      <h2>Lista de Docentes</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombres</th>
            <th>Apellidos</th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((docente) => (
            <tr key={docente.id_docente}>
              <td>{docente.id_docente}</td>
              <td>{docente.nombres}</td>
              <td>{docente.apellidos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Docentes;
