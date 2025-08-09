/**
 * Circle Y Database Integration for Research Prompt Builder
 * Handles the integration of Circle Y business data into research prompts
 */

const circleyQueryService = require('./circleyQueryService');
const { getQueriesForDomain, getAllDomains } = require('./circleyQueryMappings');

/**
 * Process Circle Y data inclusion for research prompts
 */
async function processCircleYDataInclusion(promptSegments, includeGlobalData) {
  if (!includeGlobalData) {
    return { circleyContext: '', metadata: null };
  }

  try {
    // Extract business unit and research domains from prompt segments
    const businessUnit = promptSegments.business_unit?.key;
    const researchDomains = promptSegments.research_domain ? 
      (Array.isArray(promptSegments.research_domain) ? 
        promptSegments.research_domain.map(d => d.key) : 
        [promptSegments.research_domain.key]) : [];
    
    // Check if Circle Y is selected
    const isCircleY = businessUnit === 'circle_y' || 
                     businessUnit === 'circley' || 
                     promptSegments.business_unit?.text?.toLowerCase().includes('circle y');
    
    if (!isCircleY) {
      return { circleyContext: '', metadata: null };
    }

    console.log('Processing Circle Y data inclusion for domains:', researchDomains);

    // Map research domains to database query domains
    const domainMappings = {
      'manufacturing': 'manufacturing_optimization',
      'production': 'manufacturing_optimization',
      'quality': 'quality_automation',
      'automation': 'quality_automation',
      'supply_chain': 'supply_chain',
      'logistics': 'supply_chain',
      'market': 'market_analysis',
      'sales': 'market_analysis',
      'customer': 'market_analysis',
      'product': 'product_innovation',
      'innovation': 'product_innovation',
      'r&d': 'product_innovation'
    };

    // Determine which query domains to use
    const queryDomains = new Set();
    researchDomains.forEach(domain => {
      const mapped = domainMappings[domain.toLowerCase()];
      if (mapped) {
        queryDomains.add(mapped);
      }
    });

    // If no specific domains mapped, use recommended queries based on prompt text
    if (queryDomains.size === 0) {
      const promptText = JSON.stringify(promptSegments).toLowerCase();
      const recommendations = circleyQueryService.getRecommendedQueries(promptText);
      Object.keys(recommendations).forEach(domain => queryDomains.add(domain));
    }

    // Execute queries for selected domains
    const domainQueryMap = {};
    queryDomains.forEach(domain => {
      domainQueryMap[domain] = null; // null means execute all queries for domain
    });

    console.log('Executing Circle Y queries for domains:', Object.keys(domainQueryMap));
    const queryResults = await circleyQueryService.executeMultiDomainQueries(domainQueryMap);
    
    // Format results for prompt inclusion
    const formattedContext = circleyQueryService.formatResultsForPrompt(queryResults);
    
    // Prepare metadata for tracking
    const metadata = {
      circleyDataIncluded: true,
      domainsQueried: Object.keys(domainQueryMap),
      queryCount: Object.values(queryResults).reduce((count, domain) => {
        return count + (domain.results ? Object.keys(domain.results).length : 0);
      }, 0),
      totalRows: Object.values(queryResults).reduce((total, domain) => {
        if (!domain.results) return total;
        return total + Object.values(domain.results).reduce((sum, query) => {
          return sum + (query.rowCount || 0);
        }, 0);
      }, 0),
      executionTime: new Date().toISOString()
    };

    console.log('Circle Y data processing complete:', metadata);

    return {
      circleyContext: formattedContext,
      metadata
    };
  } catch (error) {
    console.error('Error processing Circle Y data:', error);
    return {
      circleyContext: '',
      metadata: {
        circleyDataIncluded: false,
        error: error.message
      }
    };
  }
}

/**
 * Get available Circle Y query domains for UI
 */
function getCircleYDomains() {
  return getAllDomains().map(domain => ({
    ...domain,
    displayName: domain.name,
    icon: getIconForDomain(domain.key)
  }));
}

/**
 * Get queries available for a specific domain
 */
function getCircleYQueriesForDomain(domainKey) {
  const queries = getQueriesForDomain(domainKey);
  if (!queries) return null;
  
  return {
    ...queries,
    queries: queries.queries.map(q => ({
      ...q,
      isDefault: true // All queries are selected by default
    }))
  };
}

/**
 * Get icon for domain (for UI display)
 */
function getIconForDomain(domainKey) {
  const icons = {
    'manufacturing_optimization': '🏭',
    'quality_automation': '✅',
    'supply_chain': '📦',
    'market_analysis': '📊',
    'product_innovation': '💡'
  };
  return icons[domainKey] || '📋';
}

/**
 * Enhance research prompt with Circle Y context
 */
function enhancePromptWithCircleYData(basePrompt, circleyContext) {
  if (!circleyContext) {
    return basePrompt;
  }

  const enhancedPrompt = `${basePrompt}

${circleyContext}

IMPORTANT: The above data is from Circle Y Saddles' internal business systems and should be considered in your analysis. Use this real-time business data to provide specific, actionable insights relevant to Circle Y's operations.`;

  return enhancedPrompt;
}

/**
 * Validate Circle Y database connection
 */
async function validateCircleYConnection() {
  try {
    await circleyQueryService.connect();
    
    // Test with a simple query
    const testQuery = 'SELECT TOP 1 1 as test FROM INFORMATION_SCHEMA.TABLES';
    await circleyQueryService.executeQuery(testQuery);
    
    return {
      connected: true,
      message: 'Circle Y database connection successful'
    };
  } catch (error) {
    return {
      connected: false,
      message: `Circle Y database connection failed: ${error.message}`
    };
  }
}

module.exports = {
  processCircleYDataInclusion,
  getCircleYDomains,
  getCircleYQueriesForDomain,
  enhancePromptWithCircleYData,
  validateCircleYConnection
};