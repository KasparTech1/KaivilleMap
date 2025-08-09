/**
 * Enhanced Research Controllers with Circle Y Integration
 * Extension of the main controllers to add Circle Y database functionality
 */

const { 
  processCircleYDataInclusion, 
  enhancePromptWithCircleYData,
  validateCircleYConnection,
  getCircleYDomains,
  getCircleYQueriesForDomain
} = require('./circleyIntegration');

/**
 * Enhanced generate research handler with Circle Y data
 */
async function generateResearchWithCircleYHandler(req, res, originalHandler) {
  try {
    const { 
      model, 
      prompt, 
      templateId, 
      promptSegments, 
      savePrompt = true,
      includeCircleYData = false,
      circleyQueryDomains = null 
    } = req.body || {};
    
    // Process Circle Y data if requested
    let circleyContext = '';
    let circleyMetadata = null;
    
    if (includeCircleYData) {
      const circleyResult = await processCircleYDataInclusion(
        promptSegments, 
        includeCircleYData
      );
      circleyContext = circleyResult.circleyContext;
      circleyMetadata = circleyResult.metadata;
    }
    
    // Enhance the prompt with Circle Y data
    if (circleyContext) {
      req.body.prompt = enhancePromptWithCircleYData(prompt, circleyContext);
      console.log('Enhanced prompt with Circle Y business data');
    }
    
    // Call the original handler with the enhanced prompt
    const originalResponse = res.json.bind(res);
    res.json = (data) => {
      // Add Circle Y metadata to response
      if (circleyMetadata) {
        data.circleyData = circleyMetadata;
      }
      return originalResponse(data);
    };
    
    return originalHandler(req, res);
  } catch (error) {
    console.error('Error in Circle Y enhanced handler:', error);
    return res.status(500).json({ 
      error: { 
        code: 'circley_integration_error', 
        message: error.message 
      } 
    });
  }
}

/**
 * Get Circle Y configuration for research templates
 */
async function getCircleYConfigHandler(req, res) {
  try {
    // Validate connection
    const connectionStatus = await validateCircleYConnection();
    
    // Get available domains and queries
    const domains = getCircleYDomains();
    
    res.json({
      enabled: connectionStatus.connected,
      connectionStatus,
      domains,
      defaultSettings: {
        includeByDefault: false,
        maxRowsPerQuery: 100,
        queryTimeout: 30000
      }
    });
  } catch (error) {
    console.error('Error getting Circle Y config:', error);
    res.status(500).json({ 
      error: { 
        code: 'circley_config_error', 
        message: error.message 
      } 
    });
  }
}

/**
 * Get Circle Y queries for a specific domain
 */
async function getCircleYDomainQueriesHandler(req, res) {
  try {
    const { domainKey } = req.params;
    
    const queries = getCircleYQueriesForDomain(domainKey);
    
    if (!queries) {
      return res.status(404).json({
        error: {
          code: 'domain_not_found',
          message: `Domain ${domainKey} not found`
        }
      });
    }
    
    res.json(queries);
  } catch (error) {
    console.error('Error getting Circle Y domain queries:', error);
    res.status(500).json({ 
      error: { 
        code: 'circley_queries_error', 
        message: error.message 
      } 
    });
  }
}

/**
 * Test Circle Y query execution
 */
async function testCircleYQueryHandler(req, res) {
  try {
    const { domainKey, queryKey } = req.body;
    
    if (!domainKey || !queryKey) {
      return res.status(400).json({
        error: {
          code: 'bad_request',
          message: 'domainKey and queryKey are required'
        }
      });
    }
    
    // Execute single query for testing
    const circleyQueryService = require('./circleyQueryService');
    const results = await circleyQueryService.executeQueriesForDomain(domainKey, [queryKey]);
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error testing Circle Y query:', error);
    res.status(500).json({ 
      error: { 
        code: 'circley_test_error', 
        message: error.message 
      } 
    });
  }
}

module.exports = {
  generateResearchWithCircleYHandler,
  getCircleYConfigHandler,
  getCircleYDomainQueriesHandler,
  testCircleYQueryHandler
};