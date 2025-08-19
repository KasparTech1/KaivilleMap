const express = require('express');
const { regenerateArticleHTML } = require('../scripts/regenerate-article-html');

const router = express.Router();

// Admin endpoint to regenerate article HTML
router.post('/regenerate-articles', async (req, res) => {
  try {
    console.log('🔧 Admin: Starting article HTML regeneration...');
    await regenerateArticleHTML();
    res.json({ 
      success: true, 
      message: 'Successfully regenerated HTML for all articles' 
    });
  } catch (error) {
    console.error('Admin regeneration failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;