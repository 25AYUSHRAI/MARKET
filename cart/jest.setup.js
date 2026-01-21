// Set test environment before loading modules
process.env.NODE_ENV = 'test';
process.env.MONGO_URL = 'mongodb://localhost:27017/cart-test';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';

// Global test setup
beforeAll(() => {
  // Suppress console output during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  // Restore console
  console.log.mockRestore();
  console.error.mockRestore();
});


