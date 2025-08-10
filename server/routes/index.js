const express = require('express');
const router = express.Router();

// Subrouters
const researchRouter = require('./research');
const debugRouter = require('./debug');

// Root path response
router.get("/", (req, res) => {
  res.status(200).send("Welcome to Your Website!");
});

router.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Research API routes
router.use('/research', researchRouter);

// Debug API routes (for schema checking)
router.use('/debug', debugRouter);

module.exports = router;
