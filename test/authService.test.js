const { expect } = require('chai');
const { login, logout, isAuthenticated } = require('../frontend/src/services/authService');

describe('Auth Service', () => {
  it('should login a user', async () => {
    const credentials = { username: 'testuser', password: 'password' };
    const response = await login(credentials);
    expect(response).to.have.property('token');
  });

  it('should logout a user', () => {
    logout();
    expect(isAuthenticated()).to.be.false;
  });

  it('should check if a user is authenticated', () => {
    const authenticated = isAuthenticated();
    expect(authenticated).to.be.a('boolean');
  });
});
