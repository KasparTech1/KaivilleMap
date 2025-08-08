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
  reprocessHandler
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

module.exports = router;

