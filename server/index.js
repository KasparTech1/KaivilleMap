// Production-ready server configuration
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const basicRoutes = require("./routes/index");

// Environment info
console.log('Starting server with environment:', process.env.NODE_ENV || 'development');

const app = express();
const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// CORS configuration
const corsOptions = {
  origin: isProduction 
    ? [
        'https://kaiville-railway-01.up.railway.app',
        process.env.RAILWAY_PUBLIC_DOMAIN && `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      ].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pretty-print JSON responses
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

// Trust proxy in production (Railway runs behind a proxy)
if (isProduction) {
  app.set('trust proxy', 1);
}

// No database connection needed - using Supabase

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'Supabase',
    port: port
  });
});

// API Routes (before static files)
app.use('/api', basicRoutes);

// Serve static files in production
if (isProduction) {
  // Serve React build files
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Serve uploaded files if you have any
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  // Catch all handler - send React app for any route not handled by API
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
} else {
  // Development mode - just handle API routes
  app.get('/', (req, res) => {
    res.json({ 
      message: 'KaivilleMap API Server',
      environment: 'development',
      note: 'React dev server should be running on port 3000'
    });
  });
}

// 404 handler for unmatched routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else if (isProduction) {
    // In production, serve React app for any unmatched route
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).send('Page not found.');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  
  // Don't leak error details in production
  const message = isProduction 
    ? 'There was an error serving your request.' 
    : err.message;
    
  res.status(500).json({ 
    error: message,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Start server - bind to all interfaces in production
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (isProduction) {
    console.log('Serving React build from /public directory');
    console.log('Health check available at /api/health');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});