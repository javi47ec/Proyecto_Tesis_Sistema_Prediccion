import React, { useState } from 'react';
import axios from 'axios';
import SubirExcel from '../components/SubirExcel';

const SuperUserDashboard = () => {
  const [nuevoPeriodo, setNuevoPeriodo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const actualizarPeriodo = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/periodos/periodo-activo", { periodo: nuevoPeriodo });
      setMensaje(response.data.message);
      // Aquí podrías actualizar algún estado global si necesitas que se refleje el cambio en otras vistas
        

    } catch (error) {
      console.error("Error al actualizar período:", error.response?.data || error.message);
      setMensaje("Error al actualizar período");
    }
  };

  const handleUploadSuccess = (data) => {
    // Aquí puedes mostrar un mensaje o actualizar un estado para confirmar que las predicciones se generaron.
    console.log("Predicciones recibidas:", data.predicciones);
    setMensaje("Data cargada y predicciones generadas correctamente");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panel del Director de Carrera</h1>
      
      {/* Sección para actualizar el período */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Actualizar Período Activo</h2>
        <input
          type="text"
          placeholder="Ingrese nuevo período (ej. 202550)"
          value={nuevoPeriodo}
          onChange={(e) => setNuevoPeriodo(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={actualizarPeriodo} className="bg-blue-500 text-white p-2 rounded">
          Actualizar Período
        </button>
        {mensaje && <p className="mt-2">{mensaje}</p>}
      </div>

      {/* Sección para cargar la data de notas */}
      <div>
        <h2 className="text-lg font-semibold">Cargar Data de Notas</h2>
        <SubirExcel onUploadSuccess={handleUploadSuccess} onLoadingChange={(loading) => { /* opcional */ }} />
      </div>
    </div>
  );
};

export default SuperUserDashboard;
