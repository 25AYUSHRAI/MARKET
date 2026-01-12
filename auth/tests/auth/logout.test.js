const request = require('supertest');
const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret';

describe('/api/auth/logout', () => {
  it('should clear token cookie and return success when authenticated', async () => {
    const password = 'password123';
    const hash = await bcryptjs.hash(password, 13);
    const user = await userModel.create({
      username: 'logoutuser',
      email: 'logout@example.com',
      password: hash,
      fullName: { firstName: 'Logout', lastName: 'User' },
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    const res = await request(app)
      .get('/api/auth/logout')            // changed from POST to GET
      .set('Cookie', [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    const cookieStr = res.headers['set-cookie'].join(';');
    expect(cookieStr).toEqual(expect.stringContaining('token='));
    expect(
      cookieStr.includes('Max-Age=0') ||
        /expires=/i.test(cookieStr) ||
        cookieStr.includes('token=;')
    ).toBeTruthy();
  });

  it('should respond successfully and be idempotent when no token cookie provided', async () => {
    const res = await request(app).get('/api/auth/logout'); // changed to GET
    expect(res.status).toBe(200);
    if (res.headers['set-cookie']) {
      const cookieStr = res.headers['set-cookie'].join(';');
      expect(cookieStr).toEqual(expect.stringContaining('token='));
      expect(
        cookieStr.includes('Max-Age=0') ||
          /expires=/i.test(cookieStr) ||
          cookieStr.includes('token=;')
      ).toBeTruthy();
    }
  });
});