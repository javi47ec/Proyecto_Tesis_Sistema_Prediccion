const { expect } = require('chai');
const { obtenerEstudiantesFiltrados } = require('../frontend/src/services/estudiantesService');

describe('Estudiantes Service', () => {
  it('should fetch filtered students', async () => {
    const estudiantes = await obtenerEstudiantesFiltrados('nivel1', '202450');
    expect(estudiantes).to.be.an('array');
  });
});
