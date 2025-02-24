import React from 'react';

const PredictionDetails = ({ prediccion }) => {
  if (!prediccion) return <p>Selecciona una predicción para ver más detalles.</p>; // Si no hay predicción seleccionada, no muestra nada.

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd' }}>
      <h2>Detalles de la Predicción</h2>
      <p><strong>ID:</strong> {prediccion.id}</p>
      <p><strong>Estudiante:</strong> {prediccion.estudiante}</p>
      <p><strong>Periodo:</strong> {prediccion.periodo}</p>
      <p><strong>Promedio:</strong> {prediccion.promedio}</p>
      <p><strong>Materias Aprobadas:</strong> {prediccion.aprobadas}</p>
      <p><strong>Materias Reprobadas:</strong> {prediccion.reprobadas}</p>
      <p><strong>Probabilidad:</strong> {prediccion.probabilidad}%</p>
      <p><strong>Materias Cursando:</strong> {prediccion.materias}</p>
    </div>
  );
};

export default PredictionDetails;
