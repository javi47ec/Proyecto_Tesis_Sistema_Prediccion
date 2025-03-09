// src/setupTests.js
import '@testing-library/jest-dom';

// Mock global para fetch
global.fetch = jest.fn();

// Configuración opcional para silenciar errores en consola durante pruebas
const originalError = console.error;
console.error = (...args) => {
  // Filtra mensajes de error específicos que son esperados durante las pruebas
  if (args[0].includes('Warning: An update to') && args[0].includes('inside a test was not wrapped in act')) {
    return;
  }
  originalError(...args);
};