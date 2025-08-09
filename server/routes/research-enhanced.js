/**
 * Enhanced Research Routes with Circle Y Integration
 * This shows how to integrate Circle Y functionality into existing routes
 */

const express = require('express');
const router = express.Router();
const circleyRoutes = require('./circleyRoutes');

// Import original controllers
const {
  pasteHandler,
  uploadHandler,
  importUrlHandler,
  listArticlesHandler,
  getArticleBySlugHandler,
  getTagsHandler,
  relatedArticlesHandler,
  reprocessHandler,
  deleteArticleHandler,
  generateResearchHandler,
  getTemplatesHandler,
  getTemplateByIdHandler,
  getDefaultTemplateHandler,
  createTemplateHandler,
  updateTemplateHandler,
  getPromptHistoryHandler,
  getPromptByIdHandler,
  getPromptStatsHandler,
  clonePromptHandler,
  createSegmentOptionHandler,
  updateSegmentOptionHandler,
  getStatusHandler,
  testGrokHandler
} = require('../services/research/controllers');

// Import Circle Y enhanced handler
const { generateResearchWithCircleYHandler } = require('../services/research/enhancedControllers');

// Routes (unchanged)
router.post('/paste', pasteHandler);
router.post('/upload', uploadHandler);
router.post('/import-url', importUrlHandler);

router.get('/articles', listArticlesHandler);
router.get('/articles/:slug', getArticleBySlugHandler);
router.get('/articles/:id/related', relatedArticlesHandler);
router.get('/tags', getTagsHandler);

router.post('/articles/:id/reprocess', reprocessHandler);
router.delete('/articles/:id', deleteArticleHandler);

// AI Research Generation - ENHANCED with Circle Y support
router.post('/generate', (req, res) => {
  // Use enhanced handler if Circle Y data is requested
  if (req.body.includeCircleYData) {
    return generateResearchWithCircleYHandler(req, res, generateResearchHandler);
  }
  // Otherwise use original handler
  return generateResearchHandler(req, res);
});

// Template Management (unchanged)
router.get('/templates', getTemplatesHandler);
router.get('/templates/default', getDefaultTemplateHandler);
router.get('/templates/:id', getTemplateByIdHandler);
router.post('/templates', createTemplateHandler);
router.put('/templates/:id', updateTemplateHandler);

// Prompt History (unchanged)
router.get('/prompts/history', getPromptHistoryHandler);
router.get('/prompts/stats', getPromptStatsHandler);
router.get('/prompts/:id', getPromptByIdHandler);
router.post('/prompts/:id/clone', clonePromptHandler);

// Segment Options Management (unchanged)
router.post('/segment-options', createSegmentOptionHandler);
router.put('/segment-options/:id', updateSegmentOptionHandler);

// Status check (unchanged)
router.get('/status', getStatusHandler);
router.get('/test-grok', testGrokHandler);

// Mount Circle Y specific routes
router.use('/circley', circleyRoutes);

module.exports = router;