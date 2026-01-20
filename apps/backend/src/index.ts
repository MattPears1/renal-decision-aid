import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes/index.js';
import { requestLogger, appLogger, logError } from './services/logger.js';
import { globalRateLimiter, burstRateLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5006;

// Trust proxy for Heroku (required for rate limiting and IP detection)
app.set('trust proxy', 1);

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:3006', 'http://localhost:5173'];

const corsOptions: cors.CorsOptions = {
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id', 'X-Request-Id'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Security middleware - disable CSP for WebGL/Three.js compatibility
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging middleware (adds requestId to all requests)
app.use(requestLogger);

// Global rate limiting
app.use(globalRateLimiter);
app.use(burstRateLimiter);

// Health check endpoint (before API routes for faster response)
app.get('/api/health', (_req: Request, res: Response) => {
  appLogger.healthCheck('healthy');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount routes
app.use('/api', routes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Navigate from backend workspace to frontend dist folder
  const frontendPath = path.resolve(process.cwd(), '../frontend/dist');
  app.use(express.static(frontendPath));

  // Handle SPA routing - serve index.html for non-API routes
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 404 handler for API routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
  });
});

// Global error handler
interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

app.use((err: AppError, req: Request, res: Response, _next: NextFunction) => {
  logError(err, {
    requestId: req.requestId,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  appLogger.shutdown('SIGTERM received');
  process.exit(0);
});

process.on('SIGINT', () => {
  appLogger.shutdown('SIGINT received');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  appLogger.startup(PORT, process.env.NODE_ENV || 'development');

  // Log configuration (only in development)
  if (process.env.NODE_ENV !== 'production') {
    appLogger.configLoaded({
      port: PORT,
      corsOrigins,
      sessionStorage: process.env.SESSION_STORAGE || 'memory',
      logLevel: process.env.LOG_LEVEL || 'debug',
      openaiConfigured: !!process.env.OPENAI_API_KEY,
    });
  }
});

export default app;
