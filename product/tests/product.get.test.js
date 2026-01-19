jest.mock('../src/models/product.model');

const request = require('supertest');
const app = require('../src/app');
const productModel = require('../src/models/product.model');

describe('GET /api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all products without any filters (200)', async () => {
    const mockProducts = [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'Product 1',
        description: 'Description 1',
        price: { amount: 100, currency: 'INR' },
        seller: '507f1f77bcf86cd799439012',
        images: [],
      },
      {
        _id: '507f1f77bcf86cd799439013',
        title: 'Product 2',
        description: 'Description 2',
        price: { amount: 200, currency: 'INR' },
        seller: '507f1f77bcf86cd799439014',
        images: [],
      },
    ];

    productModel.find = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockProducts),
      }),
    });

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0]).toHaveProperty('title', 'Product 1');
  });

  it('should return products with search query parameter (200)', async () => {
    const mockProducts = [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Product',
        description: 'A searchable product',
        price: { amount: 150, currency: 'INR' },
        seller: '507f1f77bcf86cd799439012',
        images: [],
      },
    ];

    productModel.find = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockProducts),
      }),
    });

    const res = await request(app).get('/api/products?q=Test');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0]).toHaveProperty('title', 'Test Product');
    expect(productModel.find).toHaveBeenCalledWith({
      $text: { $search: 'Test' },
    });
  });

  it('should filter products by minimum price (200)', async () => {
    const mockProducts = [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'Expensive Product',
        description: 'Higher price product',
        price: { amount: 5000, currency: 'INR' },
        seller: '507f1f77bcf86cd799439012',
        images: [],
      },
    ];

    productModel.find = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockProducts),
      }),
    });

    const res = await request(app).get('/api/products?minprice=1000');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].price.amount).toBeGreaterThanOrEqual(1000);
    expect(productModel.find).toHaveBeenCalledWith({
      'price.amount': { $gte: 1000 },
    });
  });

  it('should filter products by maximum price (200)', async () => {
    const mockProducts = [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'Cheap Product',
        description: 'Lower price product',
        price: { amount: 300, currency: 'INR' },
        seller: '507f1f77bcf86cd799439012',
        images: [],
      },
    ];

    productModel.find = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockProducts),
      }),
    });

    const res = await request(app).get('/api/products?maxprice=500');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].price.amount).toBeLessThanOrEqual(500);
    expect(productModel.find).toHaveBeenCalledWith({
      'price.amount': { $lte: 500 },
    });
  });

  it('should filter products by both min and max price range (200)', async () => {
    const mockProducts = [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'Mid-Range Product',
        description: 'Medium price product',
        price: { amount: 1500, currency: 'INR' },
        seller: '507f1f77bcf86cd799439012',
        images: [],
      },
    ];

    productModel.find = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockProducts),
      }),
    });

    const res = await request(app).get('/api/products?minprice=1000&maxprice=2000');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].price.amount).toBeGreaterThanOrEqual(1000);
    expect(res.body.data[0].price.amount).toBeLessThanOrEqual(2000);
    expect(productModel.find).toHaveBeenCalledWith({
      'price.amount': { $gte: 1000, $lte: 2000 },
    });
  });

  it('should apply skip parameter for pagination (200)', async () => {
    const mockProducts = [
      {
        _id: '507f1f77bcf86cd799439015',
        title: 'Product 3',
        description: 'Third product',
        price: { amount: 300, currency: 'INR' },
        seller: '507f1f77bcf86cd799439016',
        images: [],
      },
    ];

    const mockFind = jest.fn();
    const mockSkip = jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue(mockProducts),
    });

    productModel.find = mockFind.mockReturnValue({
      skip: mockSkip,
    });

    const res = await request(app).get('/api/products?skip=2');

    expect(res.status).toBe(200);
    expect(mockSkip).toHaveBeenCalledWith(2);
    expect(res.body.data.length).toBe(1);
  });

  it('should apply limit parameter for pagination (200)', async () => {
    const mockProducts = [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'Product 1',
        description: 'First product',
        price: { amount: 100, currency: 'INR' },
        seller: '507f1f77bcf86cd799439012',
        images: [],
      },
    ];

    const mockFind = jest.fn();
    const mockSkip = jest.fn();
    const mockLimit = jest.fn().mockResolvedValue(mockProducts);

    mockSkip.mockReturnValue({
      limit: mockLimit,
    });

    productModel.find = mockFind.mockReturnValue({
      skip: mockSkip,
    });

    const res = await request(app).get('/api/products?list=10');

    expect(res.status).toBe(200);
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(res.body.data.length).toBe(1);
  });

  it('should combine multiple filters (200)', async () => {
    const mockProducts = [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'Laptop',
        description: 'High-end laptop',
        price: { amount: 50000, currency: 'INR' },
        seller: '507f1f77bcf86cd799439012',
        images: [],
      },
    ];

    productModel.find = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockProducts),
      }),
    });

    const res = await request(app).get(
      '/api/products?q=Laptop&minprice=40000&maxprice=60000&skip=0&list=10'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(productModel.find).toHaveBeenCalledWith({
      $text: { $search: 'Laptop' },
      'price.amount': { $gte: 40000, $lte: 60000 },
    });
  });

  it('should return empty array when no products match filters (200)', async () => {
    productModel.find = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
    });

    const res = await request(app).get('/api/products?minprice=1000000');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should use default skip value of 0 when not provided (200)', async () => {
    const mockProducts = [];

    const mockFind = jest.fn();
    const mockSkip = jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue(mockProducts),
    });

    productModel.find = mockFind.mockReturnValue({
      skip: mockSkip,
    });

    await request(app).get('/api/products');

    expect(mockSkip).toHaveBeenCalledWith(0);
  });

  it('should use default limit value of 20 when not provided (200)', async () => {
    const mockProducts = [];

    const mockFind = jest.fn();
    const mockSkip = jest.fn();
    const mockLimit = jest.fn().mockResolvedValue(mockProducts);

    mockSkip.mockReturnValue({
      limit: mockLimit,
    });

    productModel.find = mockFind.mockReturnValue({
      skip: mockSkip,
    });

    await request(app).get('/api/products');

    expect(mockLimit).toHaveBeenCalledWith(20);
  });

  it('should enforce minimum limit of 5 items (200)', async () => {
    const mockProducts = [];

    const mockFind = jest.fn();
    const mockSkip = jest.fn();
    const mockLimit = jest.fn().mockResolvedValue(mockProducts);

    mockSkip.mockReturnValue({
      limit: mockLimit,
    });

    productModel.find = mockFind.mockReturnValue({
      skip: mockSkip,
    });

    const res = await request(app).get('/api/products?list=2');

    expect(res.status).toBe(200);
    expect(mockLimit).toHaveBeenCalledWith(5);
  });

  it('should enforce maximum limit of 100 items (200)', async () => {
    const mockProducts = [];

    const mockFind = jest.fn();
    const mockSkip = jest.fn();
    const mockLimit = jest.fn().mockResolvedValue(mockProducts);

    mockSkip.mockReturnValue({
      limit: mockLimit,
    });

    productModel.find = mockFind.mockReturnValue({
      skip: mockSkip,
    });

    const res = await request(app).get('/api/products?list=500');

    expect(res.status).toBe(200);
    expect(mockLimit).toHaveBeenCalledWith(100);
  });

  it('should accept limit within valid range (200)', async () => {
    const mockProducts = [];

    const mockFind = jest.fn();
    const mockSkip = jest.fn();
    const mockLimit = jest.fn().mockResolvedValue(mockProducts);

    mockSkip.mockReturnValue({
      limit: mockLimit,
    });

    productModel.find = mockFind.mockReturnValue({
      skip: mockSkip,
    });

    const res = await request(app).get('/api/products?list=15');

    expect(res.status).toBe(200);
    expect(mockLimit).toHaveBeenCalledWith(15);
  });

  it('should handle string query parameters correctly (200)', async () => {
    const mockProducts = [];

    productModel.find = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockProducts),
      }),
    });

    const res = await request(app).get(
      '/api/products?skip=5&list=15&minprice=100&maxprice=1000'
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});
