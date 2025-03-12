import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HistorialPage  = () => {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await axios.get('http://localhost:3000:/historial');
        setHistorial(response.data);
      } catch (error) {
        console.error('Error al obtener el historial:', error);
      }
    };

    fetchHistorial();
  }, []);

  return (
    <div>
     
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Nombres</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Cédula</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Área de Conocimiento</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Curso</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Asignatura</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>NRC</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Estado</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Promedio</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Periodo</th>

          </tr>
        </thead>
        <tbody>
          {historial.map((registro, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{registro.NOMBRES}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{registro.ID}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{registro.CÉDULA}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{registro['AREA DE CONOCIMIENTO']}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{registro.CURSO}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{registro.ASIGNATURA}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{registro.NRC}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{registro.EST}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{registro.PROMEDIO}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{registro.PERIODO}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistorialPage;
