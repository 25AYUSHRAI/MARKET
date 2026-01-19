jest.mock('../src/models/product.model');

const request = require('supertest');
const app = require('../src/app');
const productModel = require('../src/models/product.model');
const mongoose = require('mongoose');

describe('GET /api/products/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a single product by ID (200)', async () => {
    const productId = new mongoose.Types.ObjectId();
    const mockProduct = {
      _id: productId,
      title: 'Test Product',
      description: 'A test product',
      price: { amount: 100, currency: 'INR' },
      seller: new mongoose.Types.ObjectId(),
      images: [
        { url: 'https://example.com/image.jpg', thumbnail: 'https://example.com/thumb.jpg', id: '123' },
      ],
    };

    productModel.findById = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('product');
    expect(res.body.product).toHaveProperty('_id', productId.toString());
    expect(res.body.product).toHaveProperty('title', 'Test Product');
    expect(res.body.product).toHaveProperty('description', 'A test product');
    expect(productModel.findById).toHaveBeenCalledWith(productId.toString());
  });

  it('should return 404 when product not found (404)', async () => {
    const productId = new mongoose.Types.ObjectId();

    productModel.findById = jest.fn().mockResolvedValue(null);

    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Product Not found ');
    expect(productModel.findById).toHaveBeenCalledWith(productId.toString());
  });

  it('should return product with price details (200)', async () => {
    const productId = new mongoose.Types.ObjectId();
    const sellerId = new mongoose.Types.ObjectId();
    const mockProduct = {
      _id: productId,
      title: 'Premium Product',
      description: 'A premium product with high price',
      price: { amount: 50000, currency: 'USD' },
      seller: sellerId,
      images: [],
    };

    productModel.findById = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.product).toHaveProperty('price');
    expect(res.body.product.price).toHaveProperty('amount', 50000);
    expect(res.body.product.price).toHaveProperty('currency', 'USD');
  });

  it('should return product with seller information (200)', async () => {
    const productId = new mongoose.Types.ObjectId();
    const sellerId = new mongoose.Types.ObjectId();
    const mockProduct = {
      _id: productId,
      title: 'Seller Product',
      description: 'Product from a specific seller',
      price: { amount: 1000, currency: 'INR' },
      seller: sellerId,
      images: [],
    };

    productModel.findById = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.product).toHaveProperty('seller', sellerId.toString());
  });

  it('should return product with multiple images (200)', async () => {
    const productId = new mongoose.Types.ObjectId();
    const mockProduct = {
      _id: productId,
      title: 'Multi-Image Product',
      description: 'Product with multiple images',
      price: { amount: 2000, currency: 'INR' },
      seller: new mongoose.Types.ObjectId(),
      images: [
        { url: 'https://example.com/img1.jpg', thumbnail: 'https://example.com/thumb1.jpg', id: 'id1' },
        { url: 'https://example.com/img2.jpg', thumbnail: 'https://example.com/thumb2.jpg', id: 'id2' },
        { url: 'https://example.com/img3.jpg', thumbnail: 'https://example.com/thumb3.jpg', id: 'id3' },
      ],
    };

    productModel.findById = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.product.images).toHaveLength(3);
    expect(res.body.product.images[0]).toHaveProperty('url');
    expect(res.body.product.images[0]).toHaveProperty('thumbnail');
    expect(res.body.product.images[0]).toHaveProperty('id');
  });

  it('should return product with no images (200)', async () => {
    const productId = new mongoose.Types.ObjectId();
    const mockProduct = {
      _id: productId,
      title: 'No Image Product',
      description: 'Product with no images',
      price: { amount: 500, currency: 'INR' },
      seller: new mongoose.Types.ObjectId(),
      images: [],
    };

    productModel.findById = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.product.images).toHaveLength(0);
    expect(Array.isArray(res.body.product.images)).toBe(true);
  });

  it('should return product with optional description (200)', async () => {
    const productId = new mongoose.Types.ObjectId();
    const mockProduct = {
      _id: productId,
      title: 'Product Without Description',
      price: { amount: 750, currency: 'INR' },
      seller: new mongoose.Types.ObjectId(),
      images: [],
    };

    productModel.findById = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.product).toHaveProperty('title');
    expect(res.body.product).toHaveProperty('price');
    expect(res.body.product).toHaveProperty('_id');
  });

  it('should call findById with correct ID parameter (200)', async () => {
    const productId = new mongoose.Types.ObjectId();
    const mockProduct = {
      _id: productId,
      title: 'Test Product',
      description: 'Test',
      price: { amount: 100, currency: 'INR' },
      seller: new mongoose.Types.ObjectId(),
      images: [],
    };

    productModel.findById = jest.fn().mockResolvedValue(mockProduct);

    await request(app).get(`/api/products/${productId}`);

    expect(productModel.findById).toHaveBeenCalledTimes(1);
    expect(productModel.findById).toHaveBeenCalledWith(productId.toString());
  });

  it('should return product data in correct structure (200)', async () => {
    const productId = new mongoose.Types.ObjectId();
    const sellerId = new mongoose.Types.ObjectId();
    const mockProduct = {
      _id: productId,
      title: 'Structured Product',
      description: 'Product with proper structure',
      price: { amount: 1500, currency: 'INR' },
      seller: sellerId,
      images: [{ url: 'https://example.com/image.jpg', thumbnail: 'https://example.com/thumb.jpg', id: 'img1' }],
    };

    productModel.findById = jest.fn().mockResolvedValue(mockProduct);

    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('product');
    expect(typeof res.body.product).toBe('object');
    expect(res.body.product).toHaveProperty('_id');
    expect(res.body.product).toHaveProperty('title');
    expect(res.body.product).toHaveProperty('description');
    expect(res.body.product).toHaveProperty('price');
    expect(res.body.product).toHaveProperty('seller');
    expect(res.body.product).toHaveProperty('images');
  });

  it('should handle invalid MongoDB ID format (200 - will call findById)', async () => {
    productModel.findById = jest.fn().mockResolvedValue(null);

    const res = await request(app).get('/api/products/invalid-id');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should return different products for different IDs (200)', async () => {
    const productId1 = new mongoose.Types.ObjectId();
    const productId2 = new mongoose.Types.ObjectId();

    const mockProduct1 = {
      _id: productId1,
      title: 'Product 1',
      description: 'First product',
      price: { amount: 100, currency: 'INR' },
      seller: new mongoose.Types.ObjectId(),
      images: [],
    };

    const mockProduct2 = {
      _id: productId2,
      title: 'Product 2',
      description: 'Second product',
      price: { amount: 200, currency: 'INR' },
      seller: new mongoose.Types.ObjectId(),
      images: [],
    };

    productModel.findById = jest
      .fn()
      .mockResolvedValueOnce(mockProduct1)
      .mockResolvedValueOnce(mockProduct2);

    const res1 = await request(app).get(`/api/products/${productId1}`);
    const res2 = await request(app).get(`/api/products/${productId2}`);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body.product.title).toBe('Product 1');
    expect(res2.body.product.title).toBe('Product 2');
    expect(res1.body.product._id).not.toBe(res2.body.product._id);
  });
});
