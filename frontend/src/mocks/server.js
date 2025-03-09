// src/mocks/server.js
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Datos de ejemplo para las pruebas
export const estudiantesData = [
  { id: 1, nombres: "Juan", apellidos: "Pérez", cedula: "1234567890" },
  { id: 2, nombres: "Maria", apellidos: "González", cedula: "0987654321" }
];

export const docentesData = [
  { id: 1, nombres: "Carlos", apellidos: "Rodríguez", cedula: "1122334455" },
  { id: 2, nombres: "Ana", apellidos: "Martínez", cedula: "5544332211" }
];

// Crear handlers para los endpoints
const handlers = [
  // Endpoint para obtener estudiantes
  rest.get('http://localhost:5000/api/estudiantes', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(estudiantesData)
    );
  }),
  
  // Endpoint para obtener un estudiante por ID
  rest.get('http://localhost:5000/api/estudiantes/:id', (req, res, ctx) => {
    const { id } = req.params;
    const estudiante = estudiantesData.find(e => e.id === parseInt(id));
    
    if (estudiante) {
      return res(ctx.status(200), ctx.json(estudiante));
    } else {
      return res(ctx.status(404), ctx.json({ message: 'Estudiante no encontrado' }));
    }
  }),
  
  // Endpoint para obtener docentes
  rest.get('http://localhost:5000/api/docentes', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(docentesData)
    );
  }),
  
  // Puedes agregar más endpoints según necesites
];

// Configurar el servidor
export const server = setupServer(...handlers);