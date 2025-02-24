const { expect } = require('chai');
const api = require('../frontend/src/services/api');

describe('API Configuration', () => {
  it('should have a base URL', () => {
    expect(api.defaults.baseURL).to.be.a('string');
  });

  it('should have a timeout set', () => {
    expect(api.defaults.timeout).to.be.a('number');
  });
});
