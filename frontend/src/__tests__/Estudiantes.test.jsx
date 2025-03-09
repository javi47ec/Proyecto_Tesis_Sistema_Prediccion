// src/__tests__/Estudiantes.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Estudiantes from '../components/Estudiantes';
const axios = require('axios');

// Datos de ejemplo para las pruebas
const estudiantesData = [
  { id: 1, nombres: 'Juan', apellidos: 'Pérez', email: 'juan@example.com' },
  { id: 2, nombres: 'María', apellidos: 'López', email: 'maria@example.com' }
];

// Mock de axios
jest.mock('axios');

describe('Estudiantes Component Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: estudiantesData });
  });

  test('Carga y muestra la lista de estudiantes correctamente', async () => {
    // Renderiza el componente
    render(<Estudiantes />);
    
    // Verifica que se muestre el título
    expect(screen.getByText('Lista de Estudiantes')).toBeInTheDocument();
    
    // Espera a que se carguen los datos
    await waitFor(() => {
      // Verifica que se muestren los estudiantes de ejemplo
      estudiantesData.forEach(estudiante => {
        expect(screen.getByText(estudiante.nombres)).toBeInTheDocument();
        expect(screen.getByText(estudiante.apellidos)).toBeInTheDocument();
      });
    });

    // Verifica que se haya llamado a axios.get con la URL correcta
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/estudiantes');
  });
});