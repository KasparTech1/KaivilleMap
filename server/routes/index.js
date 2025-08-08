const express = require('express');
const router = express.Router();

// Subrouters
const researchRouter = require('./research');

// Root path response
router.get("/", (req, res) => {
  res.status(200).send("Welcome to Your Website!");
});

router.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Research API routes
router.use('/research', researchRouter);

module.exports = router;
