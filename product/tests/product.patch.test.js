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

describe('PATCH /api/products/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update product title (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Old Title',
      description: 'Original description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ title: 'New Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('New Title');
    expect(mockProduct.save).toHaveBeenCalled();
  });

  it('should update product description (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product Title',
      description: 'Old description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ description: 'New description' });

    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('New description');
  });

  it('should update product price amount (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ price: { amount: 500 } });

    expect(res.status).toBe(200);
    expect(res.body.data.price.amount).toBe(500);
  });

  it('should update product currency (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ price: { currency: 'USD' } });

    expect(res.status).toBe(200);
    expect(res.body.data.price.currency).toBe('USD');
  });

  it('should update multiple fields at once (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Old Title',
      description: 'Old description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({
        title: 'New Title',
        description: 'New description',
        price: { amount: 750, currency: 'USD' },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('New Title');
    expect(res.body.data.description).toBe('New description');
    expect(res.body.data.price.amount).toBe(750);
    expect(res.body.data.price.currency).toBe('USD');
  });

  it('should return 404 when product not found (404)', async () => {
    const productId = new mongoose.Types.ObjectId();

    productModel.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ title: 'New Title' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Procduct not found ');
  });

  it('should return 404 when seller is not the product owner (404)', async () => {
    const productId = new mongoose.Types.ObjectId();

    productModel.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ title: 'New Title' });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Procduct');
  });

  it('should update price while keeping original currency if not specified (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ price: { amount: 200 } });

    expect(res.status).toBe(200);
    expect(res.body.data.price.amount).toBe(200);
    expect(res.body.data.price.currency).toBe('INR');
  });

  it('should update currency while keeping original price if not specified (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ price: { currency: 'USD' } });

    expect(res.status).toBe(200);
    expect(res.body.data.price.amount).toBe(100);
    expect(res.body.data.price.currency).toBe('USD');
  });

  it('should not update fields when empty body sent (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('title', 'Product');
    expect(res.body.data).toHaveProperty('description', 'Description');
    expect(res.body.data.price.amount).toBe(100);
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
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    await request(app)
      .patch(`/api/products/${productId}`)
      .send({ title: 'New Title' });

    expect(productModel.findOne).toHaveBeenCalledWith({
      _id: productId.toString(),
      seller: 'test-seller-id',
    });
  });

  it('should return updated product in response (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Old Title',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [{ url: 'https://example.com/image.jpg', thumbnail: 'https://example.com/thumb.jpg', id: 'img1' }],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Product updated');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data._id).toEqual(productId.toString());
    expect(res.body.data.title).toBe('Updated Title');
    expect(res.body.data.images).toHaveLength(1);
  });

  it('should convert price amount to number (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ price: { amount: '999' } });

    expect(res.status).toBe(200);
    expect(typeof res.body.data.price.amount).toBe('number');
    expect(res.body.data.price.amount).toBe(999);
  });

  it('should return 400 for invalid product id (400)', async () => {
    const res = await request(app)
      .patch('/api/products/invalid-id')
      .send({ title: 'New Title' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid product id');
  });

  it('should call product.save() after updating (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(mockProduct.save).toHaveBeenCalled();
    expect(mockProduct.save).toHaveBeenCalledTimes(1);
  });

  it('should not allow updating fields other than title, description, price (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ seller: 'new-seller-id', images: [] });

    expect(res.status).toBe(200);
    expect(res.body.data.seller).toBe('test-seller-id');
  });

  it('should handle partial price updates with amount only (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ price: { amount: 250 } });

    expect(res.status).toBe(200);
    expect(res.body.data.price.amount).toBe(250);
    expect(res.body.data.price.currency).toBe('INR');
  });

  it('should handle partial price updates with currency only (200)', async () => {
    const productId = new mongoose.Types.ObjectId();

    const mockProduct = {
      _id: productId,
      title: 'Product',
      description: 'Description',
      price: { amount: 100, currency: 'INR' },
      seller: 'test-seller-id',
      images: [],
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findOne = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .send({ price: { currency: 'GBP' } });

    expect(res.status).toBe(200);
    expect(res.body.data.price.amount).toBe(100);
    expect(res.body.data.price.currency).toBe('GBP');
  });
});
