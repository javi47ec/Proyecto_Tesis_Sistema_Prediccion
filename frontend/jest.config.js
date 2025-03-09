// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    // Manejar importaciones de archivos estáticos
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // Transformar axios y otros módulos ESM
    'node_modules/(?!(axios|react-router-dom)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.(js|jsx)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
  ],
};