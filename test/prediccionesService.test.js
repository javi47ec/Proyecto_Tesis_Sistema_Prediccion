const { expect } = require('chai');
const { obtenerPrediccion, obtenerPredicciones, obtenerPrediccionesFuturas } = require('../frontend/src/services/prediccionesService');

describe('Predicciones Service', () => {
  it('should fetch a prediction', async () => {
    const historial = [{ curso: 'Matemáticas', nota: 90 }];
    const response = await obtenerPrediccion(historial);
    expect(response).to.have.property('prediccion');
  });

  it('should fetch all predictions', async () => {
    const predicciones = await obtenerPredicciones();
    expect(predicciones).to.be.an('array');
  });

  it('should upload a file and return future predictions', async () => {
    const file = new Blob(['file content'], { type: 'text/csv' });
    const datos = { estudiante: '12345' };
    const response = await obtenerPrediccionesFuturas(file, datos);
    expect(response).to.have.property('predicciones');
  });
});
