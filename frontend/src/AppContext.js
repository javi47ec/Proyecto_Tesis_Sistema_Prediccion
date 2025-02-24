import React, { createContext, useContext, useState } from "react";

// Crear el contexto
const AppContext = createContext();

// Hook personalizado para usar el contexto
export const useAppContext = () => useContext(AppContext);

// Proveedor del contexto
export const AppProvider = ({ children }) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedHistorial, setSelectedHistorial] = useState(null);

  // Función para cargar los estudiantes
  const cargarEstudiantes = async () => {
    try {
      const response = await fetch("/api/estudiantes"); // Ruta para obtener estudiantes
      const data = await response.json();
      setEstudiantes(data);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
    }
  };

  // Función para cargar el historial de un estudiante
  const cargarHistorial = async (idEstudiante) => {
    try {
      const response = await fetch(`/api/historial/${idEstudiante}`);
      const historial = await response.json();
      setSelectedHistorial(historial);
    } catch (error) {
      console.error("Error al cargar el historial:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        estudiantes,
        selectedHistorial,
        cargarEstudiantes,
        cargarHistorial,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
