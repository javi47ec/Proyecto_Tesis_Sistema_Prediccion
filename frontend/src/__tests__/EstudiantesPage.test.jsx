import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EstudiantesPage from '../pages/EstudiantesPage';
import '@testing-library/jest-dom/extend-expect';

test('renders EstudiantesPage component', () => {
  render(<EstudiantesPage currentUser={{ role: 'DOCENTE', id_docente: 1 }} />);
  expect(screen.getByText('Predicción de Riesgo de Deserción')).toBeInTheDocument();
});

test('opens and closes seguimiento modal', () => {
  render(<EstudiantesPage currentUser={{ role: 'DOCENTE', id_docente: 1 }} />);
  fireEvent.click(screen.getByText('Registrar Seguimiento'));
  expect(screen.getByText('Registrar Seguimiento')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Cancelar'));
  expect(screen.queryByText('Registrar Seguimiento')).not.toBeInTheDocument();
});
