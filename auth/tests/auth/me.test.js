const request = require('supertest');
const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret';

describe('GET /api/auth/me', () => {
  it('should return current user when authenticated via cookie', async () => {
    const password = 'password123';
    const hash = await bcryptjs.hash(password, 13);
    const user = await userModel.create({
      username: 'meuser',
      email: 'me@example.com',
      password: hash,
      fullName: { firstName: 'Me', lastName: 'User' },
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id', user._id.toString());
    expect(res.body.user).toHaveProperty('username', 'meuser');
    expect(res.body.user).toHaveProperty('email', 'me@example.com');
  });

  it('should return 401 when not authenticated (no token)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return 401 when token is invalid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', ['token=invalidtoken']);

    expect(res.status).toBe(401);
  });
});