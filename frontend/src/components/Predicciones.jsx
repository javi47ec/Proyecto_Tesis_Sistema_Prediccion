import React, { useState, useEffect } from "react";
import axios from "axios";

const Predicciones = () => {
  const [predicciones, setPredicciones] = useState([]);

  useEffect(() => {
    const fetchPredicciones = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/predicciones");
        setPredicciones(response.data);
      } catch (error) {
        console.error("Error al obtener las predicciones:", error);
      }
    };

    fetchPredicciones();
  }, []);

  return (
    <div>
      <h2>Predicciones</h2>
      <table>
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Resultado</th>
            <th>Confianza (%)</th>
          </tr>
        </thead>
        <tbody>
          {predicciones.map((prediccion, index) => (
            <tr key={index}>
              <td>{prediccion.estudiante}</td>
              <td>{prediccion.resultado}</td>
              <td>{prediccion.confianza}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Predicciones;
