/**
 * Circle Y Database Integration Routes
 * API endpoints for Circle Y data inclusion in research
 */

const express = require('express');
const router = express.Router();
const {
  getCircleYConfigHandler,
  getCircleYDomainQueriesHandler,
  testCircleYQueryHandler
} = require('../services/research/enhancedControllers');

// Get Circle Y configuration and available domains
router.get('/config', getCircleYConfigHandler);

// Get queries for a specific domain
router.get('/domains/:domainKey/queries', getCircleYDomainQueriesHandler);

// Test query execution (admin/debug endpoint)
router.post('/test-query', testCircleYQueryHandler);

module.exports = router;