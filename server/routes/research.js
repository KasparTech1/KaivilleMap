const express = require('express');
const router = express.Router();

// Controllers (scaffold)
const {
  pasteHandler,
  uploadHandler,
  importUrlHandler,
  listArticlesHandler,
  getArticleBySlugHandler,
  getTagsHandler,
  relatedArticlesHandler,
  reprocessHandler,
  updateArticleHandler,
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
  testGrokHandler,
  testGPT5Handler,
  getRecentPromptsHandler,
  queueArticleHandler
} = require('../services/research/controllers');

// Routes
router.post('/paste', pasteHandler);
router.post('/upload', uploadHandler);
router.post('/import-url', importUrlHandler);

router.get('/articles', listArticlesHandler);
router.get('/articles/:slug', getArticleBySlugHandler);
router.get('/articles/:id/related', relatedArticlesHandler);
router.get('/tags', getTagsHandler);

router.post('/articles/:id/reprocess', reprocessHandler);
router.put('/articles/:id', updateArticleHandler);
router.delete('/articles/:id', deleteArticleHandler);

// AI Research Generation
router.post('/generate', generateResearchHandler);
router.post('/queue-article', queueArticleHandler);

// Template Management
router.get('/templates', getTemplatesHandler);
router.get('/templates/default', getDefaultTemplateHandler);
router.get('/templates/:id', getTemplateByIdHandler);
router.post('/templates', createTemplateHandler);
router.put('/templates/:id', updateTemplateHandler);

// Prompt History
router.get('/prompts/history', getPromptHistoryHandler);
router.get('/prompts/stats', getPromptStatsHandler);
router.get('/prompts/recent', getRecentPromptsHandler);
router.get('/prompts/:id', getPromptByIdHandler);
router.post('/prompts/:id/clone', clonePromptHandler);

// Segment Options Management
router.post('/segment-options', createSegmentOptionHandler);
router.put('/segment-options/:id', updateSegmentOptionHandler);

// Status check
router.get('/status', getStatusHandler);
router.get('/test-grok', testGrokHandler);
router.get('/test-gpt5', testGPT5Handler);

module.exports = router;

