import request from 'supertest';
import express from 'express';
import adminRoutes from '../../routes/adminRoutes';
import prisma from '../../config/prisma';

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin routes integration test', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/admin/overview should require authentication (401)', async () => {
    const response = await request(app).get('/api/admin/overview');
    expect(response.statusCode).toBe(401);
  });
});
