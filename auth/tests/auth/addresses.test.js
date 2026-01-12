const request = require('supertest');
const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret';

describe('Addresses API /api/auth/users/me/addresses', () => {
  it('GET should return addresses for authenticated user', async () => {
    const hash = await bcryptjs.hash('password123', 13);
    const created = await userModel.create({
      username: 'addruser1',
      email: 'addr1@example.com',
      password: hash,
      fullName: { firstName: 'Addr', lastName: 'User' },
      address: [
        { street: '1 A St', city: 'CityA', state: 'S', pincode: '10001', country: 'Country' },
      ],
    });

    const token = jwt.sign(
      { id: created._id, username: created.username, email: created.email, role: created.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    const res = await request(app)
      .get('/api/auth/users/me/addresses')
      .set('Cookie', [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.addresses || res.body)).toBe(true);
    const addresses = res.body.addresses || res.body;
    expect(addresses.length).toBeGreaterThanOrEqual(1);
    expect(addresses[0]).toHaveProperty('street', '1 A St');
  });

  it('POST should add an address for authenticated user', async () => {
    const hash = await bcryptjs.hash('password123', 13);
    const user = await userModel.create({
      username: 'addruser2',
      email: 'addr2@example.com',
      password: hash,
      fullName: { firstName: 'Addr', lastName: 'Two' },
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    const newAddr = { street: '2 B Rd', city: 'CityB', state: 'S2', pincode: '20002', country: 'CountryB' };

    const res = await request(app)
      .post('/api/auth/users/me/addresses')
      .set('Cookie', [`token=${token}`])
      .send(newAddr);

    expect([200, 201]).toContain(res.status);
    // confirm DB updated
    const refreshed = await userModel.findById(user._id).lean();
    expect(Array.isArray(refreshed.address)).toBe(true);
    expect(refreshed.address).toEqual(
      expect.arrayContaining([expect.objectContaining({ street: '2 B Rd', city: 'CityB' })])
    );
  });

  it('DELETE should remove the address by id for authenticated user', async () => {
    const hash = await bcryptjs.hash('password123', 13);
    const created = await userModel.create({
      username: 'addruser3',
      email: 'addr3@example.com',
      password: hash,
      fullName: { firstName: 'Addr', lastName: 'Three' },
      address: [
        { street: '3 C Ln', city: 'CityC', state: 'S3', pincode: '30003', country: 'CountryC' },
      ],
    });

    const addrId = String(created.address[0]._id);
    const token = jwt.sign(
      { id: created._id, username: created.username, email: created.email, role: created.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    const res = await request(app)
      .delete(`/api/auth/users/me/addresses/${addrId}`)
      .set('Cookie', [`token=${token}`]);

    expect([200, 204]).toContain(res.status);
    const refreshed = await userModel.findById(created._id).lean();
    expect(refreshed.address.find(a => String(a._id) === addrId)).toBeUndefined();
  });

  it('should return 401 for unauthenticated requests', async () => {
    const resGet = await request(app).get('/api/auth/users/me/addresses');
    expect([401, 403]).toContain(resGet.status);

    const resPost = await request(app).post('/api/auth/users/me/addresses').send({
      street: 'NoAuth', city: 'X', state: 'Y', pincode: '00000', country: 'Z'
    });
    expect([401, 403]).toContain(resPost.status);

    const resDelete = await request(app).delete('/api/auth/users/me/addresses/anyid');
    expect([401, 403]).toContain(resDelete.status);
  });
});