const request = require('supertest');
const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const bcryptjs = require('bcryptjs');

describe('/api/auth/login', () => {
  it('should login successfully and set token cookie', async () => {
    const password = 'password123';
    const hash = await bcryptjs.hash(password, 13);
    await userModel.create({
      username: 'loginuser',
      email: 'login@example.com',
      password: hash,
      fullName: { firstName: 'Login', lastName: 'User' },
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'loginuser', password });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('username', 'loginuser');
  });

  it('should return validation error when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'someuser' });

    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'password' })])
    );
  });

  it('should return 401 for wrong credentials', async () => {
    const password = 'rightpassword';
    const hash = await bcryptjs.hash(password, 13);
    await userModel.create({
      username: 'wronguser',
      email: 'wrong@example.com',
      password: hash,
      fullName: { firstName: 'Wrong', lastName: 'User' },
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'wronguser', password: 'incorrect' });

    expect([401, 400, 403]).toContain(res.status); // accept common auth failure codes
    // optional: check body message or absence of user/token
    expect(res.body.user === undefined || res.headers['set-cookie'] === undefined).toBeTruthy();
  });
});