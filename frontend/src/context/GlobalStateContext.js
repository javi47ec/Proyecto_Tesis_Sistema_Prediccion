import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [periodoActivo, setPeriodoActivo] = useState('Cargando...');

  // Fetch the active period when the provider mounts
  useEffect(() => {
    const fetchPeriodoActivo = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/periodos/periodo-activo");
        setPeriodoActivo(response.data.periodo);
      } catch (error) {
        console.error("Error al obtener período activo:", error);
        setPeriodoActivo('Error al cargar');
      }
    };

    fetchPeriodoActivo();
  }, []);

  return (
    <GlobalStateContext.Provider value={{ periodoActivo, setPeriodoActivo }}>
      {children}
    </GlobalStateContext.Provider>
  );
};