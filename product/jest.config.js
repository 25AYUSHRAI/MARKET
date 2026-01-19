// Jest configuration file
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/'],
};