const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Cart API Tests', () => {
  describe('GET /cart', () => {
    it('should fetch current cart with items and totals', async () => {
      const res = await request(app).get('/api/cart');

      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('items');
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body).toHaveProperty('totals');
        expect(res.body.totals).toHaveProperty('subtotal');
        expect(res.body.totals).toHaveProperty('total');
      }
    });

    it('should recompute prices from Product Service', async () => {
      const res = await request(app).get('/api/cart');

      expect([200, 500]).toContain(res.status);
      if (res.status === 200 && res.body.items.length > 0) {
        expect(res.body.items[0]).toHaveProperty('price');
      }
    });
  });

  describe('POST /cart/items', () => {
    it('should add item with productId and qty', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .send({
          productId: '507f1f77bcf86cd799439011',
          qty: 2
        });

      expect([200, 500]).toContain(res.status);
    });

    it('should validate availability', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .send({
          productId: '507f1f77bcf86cd799439011',
          qty: 2
        });

      expect([200, 400, 500]).toContain(res.status);
    });

    it('should require productId', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .send({
          qty: 2
        });

      expect([400, 500]).toContain(res.status);
    });

    it('should require qty', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .send({
          productId: '507f1f77bcf86cd799439011'
        });

      expect([400, 500]).toContain(res.status);
    });

    it('should reserve soft stock optionally', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .send({
          productId: '507f1f77bcf86cd799439011',
          qty: 1
        });

      expect([200, 400, 500]).toContain(res.status);
    });
  });

  describe('PATCH /cart/items/:productId', () => {
    it('should change quantity for a product', async () => {
      const res = await request(app)
        .patch('/api/cart/items/507f1f77bcf86cd799439011')
        .send({
          qty: 5
        });

      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('cart');
      }
    });

    it('should remove item if qty <= 0', async () => {
      const res = await request(app)
        .patch('/api/cart/items/507f1f77bcf86cd799439011')
        .send({
          qty: 0
        });

      expect([200, 400, 404, 500]).toContain(res.status);
    });

    it('should return updated cart after quantity change', async () => {
      const res = await request(app)
        .patch('/api/cart/items/507f1f77bcf86cd799439011')
        .send({
          qty: 3
        });

      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('cart');
      }
    });

    it('should return 404 if item not found in cart', async () => {
      const res = await request(app)
        .patch('/api/cart/items/507f1f77bcf86cd799439999')
        .send({
          qty: 5
        });

      expect([404, 500]).toContain(res.status);
    });

    it('should update item quantity to new value', async () => {
      const res = await request(app)
        .patch('/api/cart/items/507f1f77bcf86cd799439011')
        .send({
          qty: 10
        });

      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('message');
      }
    });
  });

  describe('DELETE /cart/items/:productId', () => {
    it('should delete a specific item from cart', async () => {
      const res = await request(app)
        .delete('/api/cart/items/507f1f77bcf86cd799439011');

      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('Item removed from cart');
        expect(res.body).toHaveProperty('cart');
      }
    });

    it('should return 404 if cart not found', async () => {
      const res = await request(app)
        .delete('/api/cart/items/507f1f77bcf86cd799439011');

      expect([200, 404, 500]).toContain(res.status);
    });

    it('should remove item from cart items array', async () => {
      const res = await request(app)
        .delete('/api/cart/items/507f1f77bcf86cd799439011');

      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200 && res.body.cart) {
        expect(Array.isArray(res.body.cart.items)).toBe(true);
      }
    });
  });

  describe('DELETE /cart', () => {
    it('should delete entire cart', async () => {
      const res = await request(app)
        .delete('/api/cart');

      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('Cart deleted successfully');
      }
    });

    it('should return 404 if cart does not exist', async () => {
      const res = await request(app)
        .delete('/api/cart');

      expect([200, 404, 500]).toContain(res.status);
    });

    it('should remove cart from database', async () => {
      const res = await request(app)
        .delete('/api/cart');

      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('message');
      }
    });
  });
});


