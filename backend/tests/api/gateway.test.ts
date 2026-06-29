import request from 'supertest';
import app from '../../server';


describe("API Gateway & Routing Integration Testing", () => {
    // 1. Test Routing to Non-Existent Endpoints (404 Handling)
    describe('GET /api/v1/invalid-route-path', () => {
        it('should catch unknown routes gracefully and return a 404 JSON response', async () => {
            const response = await request(app)
                .get('/api/v1/invalid-route-path')
                .set('Accept', 'application/json');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/not found/i);
        });
    });

    // 2. Test Global Authentication Guarding (Protected Route Interception)
    describe('Protected route gateway Enforcement', () => {
        it('should block incoming request to protected routes if no Authorization header is presented', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Accept', 'application/json');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });

        it('should block requests if the provided Bearer token is malformed or invalid', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid_garbage_token_string');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/invalid/i);
        });
    });


    // 3. Test Rate Limiting Guardrails (Optional — requires rate-limit middleware)
    describe('API Gateway Rate Limit', () => {
        it.todo('should trigger a 429 Too Many Requests status code when request thresholds are breached');

        // NOTE: Uncomment the test below once express-rate-limit (or similar) is
        // added to server.ts. The current server has no rate-limiting middleware,
        // so this test would always fail.

        // it('should trigger a 429 Too Many Requests status code when request thresholds are breached', async () => {
        //     const requests = Array.from({ length: 105 }).map(() =>
        //         request(app).get('/api/user/login').send()
        //     );
        //
        //     const responses = await Promise.all(requests);
        //
        //     const rateLimitedResponses = responses.filter(res => res.status === 429);
        //     expect(rateLimitedResponses.length).toBeGreaterThan(0);
        // });
    });
});