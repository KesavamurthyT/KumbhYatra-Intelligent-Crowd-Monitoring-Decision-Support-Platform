require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sosRoutes = require('./routes/sosRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration for frontend integration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:8084',
    'http://localhost:5173', // Vite default
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:8082',
    'http://127.0.0.1:8083',
    'http://127.0.0.1:8084',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'KumbhYatra SOS Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', sosRoutes);
app.use('/api', lostFoundRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'KumbhYatra Emergency SOS Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      sos: {
        create: 'POST /api/sos',
        list: 'GET /api/sos',
        get: 'GET /api/sos/:id',
        update: 'PATCH /api/sos/:id',
        delete: 'DELETE /api/sos/:id',
        stats: 'GET /api/sos-stats'
      },
      lostFound: {
        create: 'POST /api/lost-found',
        list: 'GET /api/lost-found',
        get: 'GET /api/lost-found/:id',
        update: 'PATCH /api/lost-found/:id',
        delete: 'DELETE /api/lost-found/:id',
        aiMatch: 'POST /api/lost-found/ai-match',
        stats: 'GET /api/lost-found/stats',
        cleanup: 'POST /api/lost-found/cleanup',
        types: 'GET /api/lost-found/types',
        statuses: 'GET /api/lost-found/statuses'
      }
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    ok: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚨 KumbhYatra Emergency SOS Backend Started 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server URL: http://localhost:${PORT}
🏥 Health Check: http://localhost:${PORT}/health
📖 API Docs: http://localhost:${PORT}
⏰ Started at: ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Available Endpoints:
   POST   /api/sos           - Create SOS incident
   GET    /api/sos           - List all incidents
   GET    /api/sos/:id       - Get single incident
   PATCH  /api/sos/:id       - Update incident status
   DELETE /api/sos/:id       - Delete incident
   GET    /api/sos-stats     - Get statistics
   
   POST   /api/lost-found    - Create lost/found item
   GET    /api/lost-found    - List all items
   GET    /api/lost-found/:id - Get single item
   PATCH  /api/lost-found/:id - Update item
   DELETE /api/lost-found/:id - Delete item
   POST   /api/lost-found/ai-match - AI matching
   GET    /api/lost-found/stats - Get statistics
   POST   /api/lost-found/cleanup - Cleanup expired items
   GET    /api/lost-found/types - Get item types
   GET    /api/lost-found/statuses - Get statuses

🔒 Security Features:
   ✅ Rate limiting (5 SOS/min, 10 LF/min, 30 API/min per IP)
   ✅ Input validation & sanitization
   ✅ CORS enabled for frontend
   ✅ Helmet security headers
   ✅ Request logging

💾 Storage:
   ✅ In-memory with file persistence
   ✅ Auto-deduplication
   ✅ Status history tracking
   ✅ AI-powered matching
   ✅ Expired item cleanup
  `);
});

module.exports = app;
