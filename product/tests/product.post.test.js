jest.mock('imagekit');

// 🔐 Auth mock (FACTORY-safe)
jest.mock('../src/middlewares/auth.middleware', () => {
  const mongoose = require('mongoose');

  return {
    createAuthMiddleware: jest.fn(() => {
      return function mockAuthMiddleware(req, res, next) {
        req.user = {
          id: new mongoose.Types.ObjectId().toString(),
          role: 'seller',
        };
        next();
      };
    }),
  };
});

const request = require('supertest');
const app = require('../src/app');

describe('POST /api/products', () => {
  it('uploads images and returns product object (201)', async () => {
    const res = await request(app)
      .post('/api/products')
      .field('title', 'Test Product')
      .field('description', 'A test product')
      .attach('images', Buffer.from('hello'), 'test1.jpg')
      .attach('images', Buffer.from('world'), 'test2.jpg');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('title', 'Test Product');
    expect(res.body).toHaveProperty('images');
    expect(Array.isArray(res.body.images)).toBe(true);
    expect(res.body.images.length).toBe(2);
    expect(res.body.images[0]).toHaveProperty('url');
  });
});
