import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import sessionRouter from './session.js';
import { sessionStore } from '../services/sessionStore.js';

// Create test app without rate limiters
const app = express();
app.use(express.json());

// Add requestId middleware for testing (mimics the production setup)
app.use((req, _res, next) => {
  req.requestId = 'test-request-id';
  next();
});

app.use('/api/session', sessionRouter);

describe('Session API', () => {
  beforeEach(() => {
    // Clear all sessions before each test
    sessionStore.clear();
  });

  afterEach(() => {
    // Clean up after tests
    sessionStore.clear();
  });

  describe('POST /api/session', () => {
    it('should create a new session', async () => {
      const res = await request(app).post('/api/session');
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('sessionId');
      expect(res.body).toHaveProperty('expiresAt');
    });
  });

  describe('GET /api/session/:id', () => {
    it('should get session data', async () => {
      // First create a session
      const createRes = await request(app).post('/api/session');
      const id = createRes.body.sessionId;

      const res = await request(app).get(`/api/session/${id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('sessionId', id);
    });

    it('should return 404 for non-existent session', async () => {
      const res = await request(app).get('/api/session/non-existent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/session/:id', () => {
    it('should delete a session', async () => {
      const createRes = await request(app).post('/api/session');
      const id = createRes.body.sessionId;

      const res = await request(app).delete(`/api/session/${id}`);
      expect(res.status).toBe(200);

      // Verify session is deleted
      const getRes = await request(app).get(`/api/session/${id}`);
      expect(getRes.status).toBe(404);
    });
  });
});
