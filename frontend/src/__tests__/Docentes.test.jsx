// src/__tests__/Docentes.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Docentes from '../components/Docentes';
const axios = require('axios');

// Datos de ejemplo para las pruebas
const docentesData = [
  { id: 1, nombres: 'Carlos', apellidos: 'Rodríguez', especialidad: 'Matemáticas' },
  { id: 2, nombres: 'Ana', apellidos: 'Gómez', especialidad: 'Literatura' }
];

// Mock de axios
jest.mock('axios');

describe('Docentes Component Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: docentesData });
  });

  test('Carga y muestra la lista de docentes correctamente', async () => {
    // Renderiza el componente
    render(<Docentes />);
    
    // Verifica que se muestre el título
    expect(screen.getByText(/lista de docentes/i)).toBeInTheDocument();
    
    // Espera a que se carguen los datos
    await waitFor(() => {
      // Verifica que se muestren los docentes de ejemplo
      docentesData.forEach(docente => {
        expect(screen.getByText(docente.nombres)).toBeInTheDocument();
        expect(screen.getByText(docente.apellidos)).toBeInTheDocument();
      });
    });

    // Verifica que se haya llamado a axios.get con la URL correcta
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/docentes');
  });
});