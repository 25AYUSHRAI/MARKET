jest.mock('../src/models/product.model');
jest.mock('../src/middlewares/auth.middleware', () => {
  return {
    createAuthMiddleware: jest.fn(() => {
      return function mockAuthMiddleware(req, res, next) {
        req.user = {
          id: 'test-seller-id',
          role: 'seller',
        };
        next();
      };
    }),
  };
});

const request = require('supertest');
const app = require('../src/app');
const productModel = require('../src/models/product.model');
const mongoose = require('mongoose');

describe('DELETE /api/products/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete product when seller is the owner (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product to Delete',
      description: 'This product will be deleted',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('deleted');
  });

  it('should return 404 when product not found (404)', async () => {
    const productId = new mongoose.Types.ObjectId();

    productModel.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('not found');
  });

  it('should return 404 when seller is not the product owner (404)', async () => {
    const productId = new mongoose.Types.ObjectId();
    const differentSellerId = 'different-seller-id';

    productModel.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('not found');
  });

  it('should call findOne with correct parameters (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    await request(app).delete(`/api/products/${productId}`);

    expect(productModel.findOne).toHaveBeenCalledWith({
      _id: productId.toString(),
      seller: 'test-seller-id',
    });
  });

  it('should call deleteOne with correct product id (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(productModel.deleteOne).toHaveBeenCalledWith({ _id: productId.toString() });
  });

  it('should return 400 for invalid product id (400)', async () => {
    const res = await request(app).delete('/api/products/invalid-id');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid');
  });

  it('should return success message after deletion (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBeTruthy();
    expect(typeof res.body.message).toBe('string');
  });

  it('should not delete product if seller is different (404)', async () => {
    const productId = new mongoose.Types.ObjectId();

    productModel.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(404);
    expect(productModel.deleteOne).not.toHaveBeenCalled();
  });

  it('should handle deletion of product with images (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product with Images',
      description: 'Product containing images',
      price: { amount: 500, currency: 'INR' },
      seller: 'test-seller-id',
      images: [
        { url: 'https://example.com/img1.jpg', thumbnail: 'https://example.com/thumb1.jpg', id: 'id1' },
        { url: 'https://example.com/img2.jpg', thumbnail: 'https://example.com/thumb2.jpg', id: 'id2' },
      ],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(productModel.deleteOne).toHaveBeenCalled();
  });

  it('should handle deletion of product without images (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product without Images',
      description: 'Product without any images',
      price: { amount: 200, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(productModel.deleteOne).toHaveBeenCalled();
  });

  it('should delete product with any currency type (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'USD' },
      seller: 'test-seller-id',
      images: [],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(productModel.deleteOne).toHaveBeenCalled();
  });

  it('should handle deletion when product has long description (200)', async () => {
    const productId = new mongoose.Types.ObjectId();
    const longDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10);

    const mockProduct = {
      _id: productId,
      title: 'Product with Long Description',
      description: longDescription,
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(productModel.deleteOne).toHaveBeenCalled();
  });

  it('should handle ObjectId validation (400)', async () => {
    const invalidId = 'not-a-valid-id';

    const res = await request(app).delete(`/api/products/${invalidId}`);

    expect(res.status).toBe(400);
  });

  it('should verify seller ownership before deletion (404)', async () => {
    const productId = new mongoose.Types.ObjectId();

    productModel.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(404);
    expect(productModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        seller: 'test-seller-id',
      })
    );
  });

  it('should return error message for internal server error (500)', async () => {
    const productId = new mongoose.Types.ObjectId();

    productModel.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Internal');
  });

  it('should handle deleteOne returning 0 deleted count (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(200);
  });

  it('should delete product even with undefined description (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: undefined,
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(productModel.deleteOne).toHaveBeenCalled();
  });

  it('should ensure only authenticated sellers can delete (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(productModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        seller: expect.any(String),
      })
    );
  });

  it('should return proper response structure after successful deletion (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);
    productModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
  });
});
