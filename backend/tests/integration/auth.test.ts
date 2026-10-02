import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/userRoutes';
import prisma from '../../config/prisma';

const app = express();
app.use(express.json());
// Mount your authentication router under a test path prefix
app.use('/api/user',authRoutes);

describe("Authentication API integration test",()=>{
    // Clean up or seed test data before running the test suite
    beforeAll(async ()=>{
        await prisma.user.deleteMany({
            where: {email: 'integration-test@jobops.com'}
        });
    });

    // Always disconnect from the Prisma database loop when all checks are complete
    afterAll(async()=>{
        await prisma.$disconnect();
    })

    test('POST api/user/register - should successfully validate data and create a user record', async ()=>{
        const response = await request(app)
        .post('/api/user/register')
        .send({
            username: 'Integration Tester',
            email: 'integration-test@jobops.com',
            password: 'SecurePassword123!'
        });

        // Assert that the server replies with a 201 Created status code
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('message');
        expect(response.body.user).toHaveProperty('email', 'integration-test@jobops.com');
    });

    test("POST api/user/login - should block invalid credentials with an error payload", async ()=>{
        const response = await request(app)
        .post('/api/user/login')
        .send({
            email:'integration-test@jobops.com',
            password: "WrongPassword"
        });


        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(response.headers['set-cookie']).toBeUndefined();
    })
})
