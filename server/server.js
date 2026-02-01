// ============================================================================
// ALTERNATIVE SERVER ENTRY POINT (Legacy/Development)
// ============================================================================
//
// This is an ALTERNATIVE entry point for the Express server.
// The PRIMARY entry point is index.js (used in production/Railway).
//
// ROLE:
// - Simplified server configuration for local development
// - Legacy entry point (kept for compatibility)
// - Minimal middleware setup
// - Does NOT serve static files
//
// WHEN TO USE:
// - Local development (npm run server)
// - Testing API endpoints independently
// - Simple Node.js server without production features
//
// PRIMARY ENTRY POINT:
// - index.js (recommended for most use cases)
//   - Production-ready configuration
//   - CORS, static file serving, health checks
//   - Used by Railway deployment
//
// DIFFERENCES FROM index.js:
// - No static file serving
// - No production optimizations
// - No health check endpoint
// - Simpler CORS configuration
// - Default port: 3000 (vs 3001 in index.js)
//
// TO RUN:
// - node server/server.js
// - npm run server (if configured in package.json)
//
// NOTE: Both server.js and index.js can run independently.
// They don't conflict - use whichever fits your workflow.
//
// ============================================================================

// Load environment variables
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const basicRoutes = require("./routes/index");
const cors = require("cors");

// ============================================================================
// DATABASE ARCHITECTURE NOTE
// ============================================================================
// This project uses SUPABASE (PostgreSQL) as its primary database.
// MongoDB/Mongoose were legacy dependencies and are no longer used.
//
// For database operations, see:
// - server/services/research/supabaseClient.js (primary DB client)
// - Supabase configuration in .env (SUPABASE_URL, SUPABASE_KEY, etc.)
//
// DO NOT add Mongoose models or MongoDB connections.
// ============================================================================

// Note: DATABASE_URL check removed - not needed for Supabase
// Supabase connection is handled via environment variables in supabaseClient.js

const app = express();
const port = process.env.PORT || 3000;
// Pretty-print JSON responses
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

app.use(cors({}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Basic Routes
app.use(basicRoutes);

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
