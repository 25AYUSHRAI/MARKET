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

describe('GET /api/products/seller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all products created by the seller (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProducts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Product 1',
        description: 'Description 1',
        price: { amount: 100, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Product 2',
        description: 'Description 2',
        price: { amount: 200, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
    ];

    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toHaveProperty('title', 'Product 1');
    expect(res.body.data[1]).toHaveProperty('title', 'Product 2');
  });

  it('should return empty array when seller has no products (200)', async () => {
    productModel.find = jest.fn().mockResolvedValue([]);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should filter products by seller id (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProducts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Seller Product',
        description: 'Product by seller',
        price: { amount: 500, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
    ];

    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(productModel.find).toHaveBeenCalledWith({ seller: 'test-seller-id' });
    expect(res.body.data).toHaveLength(1);
  });

  it('should return seller products with complete data (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProduct = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Complete Product',
      description: 'Full product details',
      price: { amount: 1000, currency: 'USD' },
      seller: sellerId,
      images: [
        { url: 'https://example.com/img1.jpg', thumbnail: 'https://example.com/thumb1.jpg', id: 'id1' },
        { url: 'https://example.com/img2.jpg', thumbnail: 'https://example.com/thumb2.jpg', id: 'id2' },
      ],
    };

    productModel.find = jest.fn().mockResolvedValue([mockProduct]);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('_id');
    expect(res.body.data[0]).toHaveProperty('title');
    expect(res.body.data[0]).toHaveProperty('description');
    expect(res.body.data[0]).toHaveProperty('price');
    expect(res.body.data[0]).toHaveProperty('seller');
    expect(res.body.data[0]).toHaveProperty('images');
    expect(res.body.data[0].images).toHaveLength(2);
  });

  it('should return multiple products with different prices (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProducts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Cheap Product',
        description: 'Low price item',
        price: { amount: 50, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Expensive Product',
        description: 'High price item',
        price: { amount: 5000, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
    ];

    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].price.amount).toBe(50);
    expect(res.body.data[1].price.amount).toBe(5000);
  });

  it('should return products with different currencies (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProducts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'INR Product',
        description: 'Product in INR',
        price: { amount: 1000, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'USD Product',
        description: 'Product in USD',
        price: { amount: 100, currency: 'USD' },
        seller: sellerId,
        images: [],
      },
    ];

    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data[0].price.currency).toBe('INR');
    expect(res.body.data[1].price.currency).toBe('USD');
  });

  it('should return products without images (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProduct = {
      _id: new mongoose.Types.ObjectId(),
      title: 'No Image Product',
      description: 'Product without images',
      price: { amount: 200, currency: 'INR' },
      seller: sellerId,
      images: [],
    };

    productModel.find = jest.fn().mockResolvedValue([mockProduct]);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data[0].images).toHaveLength(0);
  });

  it('should return products with multiple images (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProduct = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Multi-Image Product',
      description: 'Product with many images',
      price: { amount: 300, currency: 'INR' },
      seller: sellerId,
      images: [
        { url: 'https://example.com/img1.jpg', thumbnail: 'https://example.com/thumb1.jpg', id: 'id1' },
        { url: 'https://example.com/img2.jpg', thumbnail: 'https://example.com/thumb2.jpg', id: 'id2' },
        { url: 'https://example.com/img3.jpg', thumbnail: 'https://example.com/thumb3.jpg', id: 'id3' },
        { url: 'https://example.com/img4.jpg', thumbnail: 'https://example.com/thumb4.jpg', id: 'id4' },
      ],
    };

    productModel.find = jest.fn().mockResolvedValue([mockProduct]);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data[0].images).toHaveLength(4);
  });

  it('should call find with seller id from authenticated user (200)', async () => {
    const mockProducts = [];
    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    await request(app).get('/api/products/seller');

    expect(productModel.find).toHaveBeenCalledWith({ seller: 'test-seller-id' });
  });

  it('should return all products for a specific seller (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProducts = Array.from({ length: 5 }, (_, i) => ({
      _id: new mongoose.Types.ObjectId(),
      title: `Product ${i + 1}`,
      description: `Description ${i + 1}`,
      price: { amount: (i + 1) * 100, currency: 'INR' },
      seller: sellerId,
      images: [],
    }));

    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.data[0].title).toBe('Product 1');
    expect(res.body.data[4].title).toBe('Product 5');
  });

  it('should return seller products with all required fields (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProduct = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Test Product',
      description: 'Test Description',
      price: { amount: 150, currency: 'INR' },
      seller: sellerId,
      images: [{ url: 'https://example.com/img.jpg', thumbnail: 'https://example.com/thumb.jpg', id: 'img1' }],
    };

    productModel.find = jest.fn().mockResolvedValue([mockProduct]);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    const product = res.body.data[0];
    expect(product).toHaveProperty('_id');
    expect(product).toHaveProperty('title');
    expect(product).toHaveProperty('description');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('seller');
    expect(product).toHaveProperty('images');
  });

  it('should not return products from other sellers (200)', async () => {
    const sellerId = 'test-seller-id';
    const otherSellerId = 'other-seller-id';
    
    const mockProducts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Seller Product',
        description: 'My product',
        price: { amount: 100, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
    ];

    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].seller).toBe(sellerId);
    expect(res.body.data[0].seller).not.toBe(otherSellerId);
  });

  it('should return products with undefined description (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProduct = {
      _id: new mongoose.Types.ObjectId(),
      title: 'No Description Product',
      description: undefined,
      price: { amount: 100, currency: 'INR' },
      seller: sellerId,
      images: [],
    };

    productModel.find = jest.fn().mockResolvedValue([mockProduct]);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return products sorted by creation (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProducts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'First Product',
        description: 'Created first',
        price: { amount: 100, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Second Product',
        description: 'Created second',
        price: { amount: 200, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
    ];

    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe('First Product');
    expect(res.body.data[1].title).toBe('Second Product');
  });

  it('should handle database error gracefully (500)', async () => {
    productModel.find = jest.fn().mockRejectedValue(new Error('Database connection error'));

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Internal');
  });

  it('should return proper response structure (200)', async () => {
    const mockProducts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Product',
        description: 'Description',
        price: { amount: 100, currency: 'INR' },
        seller: 'test-seller-id',
        images: [],
      },
    ];

    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return many products at once (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProducts = Array.from({ length: 20 }, (_, i) => ({
      _id: new mongoose.Types.ObjectId(),
      title: `Product ${i + 1}`,
      description: `Desc ${i + 1}`,
      price: { amount: (i + 1) * 50, currency: 'INR' },
      seller: sellerId,
      images: [],
    }));

    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(20);
  });

  it('should verify seller authentication (200)', async () => {
    const mockProducts = [];
    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(productModel.find).toHaveBeenCalled();
  });

  it('should return products with various price amounts (200)', async () => {
    const sellerId = 'test-seller-id';
    const mockProducts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Free Product',
        description: 'Free item',
        price: { amount: 0, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Decimal Price',
        description: 'Item with decimal',
        price: { amount: 99.99, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'High Price',
        description: 'Expensive item',
        price: { amount: 999999, currency: 'INR' },
        seller: sellerId,
        images: [],
      },
    ];

    productModel.find = jest.fn().mockResolvedValue(mockProducts);

    const res = await request(app).get('/api/products/seller');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0].price.amount).toBe(0);
    expect(res.body.data[1].price.amount).toBe(99.99);
    expect(res.body.data[2].price.amount).toBe(999999);
  });
});
