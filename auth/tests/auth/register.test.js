const request = require('supertest');
const app = require('../../src/app');

describe('/api/auth/register', () => {
  it('should register a user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        fullName: { firstName: 'Test', lastName: 'User' }
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User created successfully');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('username', 'testuser');
  });

  it('should return validation error for missing username', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        password: 'password123',
        email: 'test@example.com',
        fullName: { firstName: 'Test', lastName: 'User' }
      });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'username' })])
    );
  });

  it('should return validation error for missing password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser2',
        email: 'test2@example.com',
        fullName: { firstName: 'Test', lastName: 'User' }
      });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'password' })])
    );
  });
});
