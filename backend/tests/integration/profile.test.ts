import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../../server';
import prisma from '../../config/prisma';
import ProfileImage from '../../models/ProfileImage';
import connDB from '../../config/mDB';

const JWT_SECRET = process.env.JWT_SECRET as string || 'jobopssecret';

jest.setTimeout(30000);

describe('Profile Image & Update Integration Tests', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Connect to MongoDB
    await connDB();

    // Clean up any existing test user
    await prisma.user.deleteMany({
      where: { email: 'profile-test@example.com' }
    });

    // Create a new test user in MySQL
    testUser = await prisma.user.create({
      data: {
        name: 'Profile Tester',
        email: 'profile-test@example.com',
        password: 'securepassword123',
        avatar: ''
      }
    });

    // Create a valid auth token
    authToken = jwt.sign(
      { id: testUser.id, isAdmin: false },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up MySQL data
    if (testUser?.id) {
      await prisma.user.delete({
        where: { id: testUser.id }
      });
    }

    // Clean up MongoDB data
    if (testUser?.id) {
      await ProfileImage.findOneAndDelete({ userId: testUser.id });
    }

    // Disconnect DB clients
    await prisma.$disconnect();
    await mongoose.connection.close();
  });

  test('PUT /api/auth/profile - update name and email only', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Tester Name',
        email: 'profile-test@example.com' // keeping it same
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe('Updated Tester Name');
    expect(res.body.user.avatar).toBe(''); // unchanged
  });

  test('PUT /api/auth/profile - upload base64 avatar and store in MongoDB', async () => {
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Tester Name',
        email: 'profile-test@example.com',
        avatar: base64Image
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.avatar).toContain('/api/auth/profile/image?userId=');

    // Verify MongoDB stores the image
    const mongoDoc = await ProfileImage.findOne({ userId: testUser.id });
    expect(mongoDoc).toBeDefined();
    expect(mongoDoc?.contentType).toBe('image/png');
    expect(mongoDoc?.imageData).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');

    // Verify MySQL user avatar column has the path
    const mysqlUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    expect(mysqlUser?.avatar).toContain('/api/auth/profile/image?userId=');
  });

  test('GET /api/auth/profile/image - retrieve image from MongoDB', async () => {
    const res = await request(app)
      .get(`/api/auth/profile/image?userId=${testUser.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('image/png');
    
    // Check if returned data is the original image buffer
    const expectedBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    expect(res.body).toEqual(expectedBuffer);
  });

  test('PUT /api/auth/profile - update to Dicebear URL and delete MongoDB copy', async () => {
    const dicebearUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test';

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        avatar: dicebearUrl
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.avatar).toBe(dicebearUrl);

    // Verify MongoDB document is deleted
    const mongoDoc = await ProfileImage.findOne({ userId: testUser.id });
    expect(mongoDoc).toBeNull();
  });
});
