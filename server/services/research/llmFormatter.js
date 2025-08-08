/**
 * @file llmFormatter.js
 * @description LLM-powered research submission formatter and normalizer
 * @author Kaiville Development Team
 * @created 2025-08-08
 * 
 * ARCHITECTURE PLANNING BLOCK
 * ==========================
 * 
 * PURPOSE:
 * - Accept messy/unstructured research submissions
 * - Use LLM to intelligently parse and reformat to YAML frontmatter
 * - Extract metadata even from poorly formatted content
 * - Provide fallback when LLM unavailable
 * 
 * DEPENDENCIES:
 * - openai OR @anthropic-ai/sdk (choose one)
 * - ./config/llm.js (API configuration)
 * - ./normalizer.js (fallback processing)
 * 
 * TODO:
 * [ ] Implement formatWithLLM() function
 * [ ] Create intelligent prompt for research parsing
 * [ ] Add confidence scoring for extracted fields
 * [ ] Implement retry logic with exponential backoff
 * [ ] Add telemetry/logging for LLM usage
 * [ ] Cache LLM responses for similar content
 * 
 * INTEGRATION POINTS:
 * - Called by controllers.js pasteHandler before normalizer
 * - Falls back to normalizer.js if LLM fails
 * - Returns formatted YAML frontmatter + body
 * 
 * EXPECTED INPUT:
 * - Raw text (any format)
 * - Optional hints (domain, type)
 * 
 * EXPECTED OUTPUT:
 * {
 *   formatted: string, // YAML frontmatter + markdown body
 *   confidence: {
 *     title: 0.9,
 *     year: 0.8,
 *     domains: 0.7,
 *     // ... etc
 *   },
 *   llmUsed: boolean,
 *   llmModel: string
 * }
 * 
 * ERROR HANDLING:
 * - API timeout: fallback to normalizer
 * - Invalid API key: log and fallback
 * - Rate limits: implement queue/retry
 * - Malformed response: fallback with warning
 */

const { getLLMClient, isLLMAvailable } = require('../../config/llm');
const { normalizeAndValidate } = require('./normalizer');

/**
 * Research domains recognized by Kaiville
 */
const VALID_DOMAINS = [
  'welding', 'cnc', 'leather', 'firearms', 'manufacturing',
  'automotive', 'construction', 'electronics', 'machining',
  'woodworking', 'metalworking', 'safety', 'quality_control'
];

/**
 * Research source types
 */
const SOURCE_TYPES = [
  'research_paper', 'industry_report', 'case_study',
  'technical_article', 'white_paper', 'government_report',
  'academic_thesis', 'conference_paper', 'other'
];

/**
 * Main formatting function with LLM
 * @param {Object} options
 * @param {string} options.rawText - The raw submission text
 * @param {Object} options.hints - Optional hints about content
 * @returns {Promise<Object>} Formatted result with confidence scores
 */
async function formatWithLLM({ rawText, hints = {} }) {
  try {
    const llmClient = getLLMClient();
    
    // Create intelligent prompt
    const prompt = buildFormattingPrompt(rawText, hints);
    
    // Call LLM API
    const response = await llmClient.complete(prompt);
    
    // Parse LLM response
    const formatted = parseLLMResponse(response.text);
    
    // Calculate confidence scores
    const confidence = calculateConfidence(formatted, rawText);
    
    return {
      formatted,
      confidence,
      llmUsed: true,
      llmModel: response.model,
      usage: response.usage
    };
  } catch (error) {
    console.error('LLM formatting failed:', error);
    // Try heuristic formatting as fallback
    const heuristicResult = heuristicFormat(rawText);
    return {
      formatted: heuristicResult,
      confidence: {},
      llmUsed: false,
      llmModel: 'none',
      error: error.message
    };
  }
}

/**
 * Build the LLM prompt for formatting
 * @private
 */
function buildFormattingPrompt(rawText, hints) {
  // TODO: Implement prompt building
  const prompt = `
Convert the following research submission into Kaiville Research Markdown format with YAML frontmatter.

REQUIRED FORMAT:
---
title: "Exact title from the content"
authors: ["Name 1", "Name 2"]
year: YYYY
publisher: "Organization name"
source_url: "https://..."
source_type: "one of: ${SOURCE_TYPES.join(', ')}"
region: "State or Country"
domains: ["choose from: ${VALID_DOMAINS.join(', ')}"]
topics: ["specific technical topics mentioned"]
keywords: ["relevant search terms"]
summary: "> One paragraph summary"
key_points: ["Key finding 1", "Key finding 2"]
---

# Markdown Body
Clean, well-formatted content...

INSTRUCTIONS:
1. Extract metadata from the content intelligently
2. Leave fields blank if uncertain (use null)
3. Ensure valid YAML syntax
4. Clean up the body text to proper Markdown
5. Preserve all important information

CONTENT TO FORMAT:
${rawText}

${hints.domain ? `HINT: This is likely about ${hints.domain}` : ''}
`;
  
  return prompt;
}

/**
 * Parse and validate LLM response
 * @private
 */
function parseLLMResponse(responseText) {
  try {
    // LLM should return properly formatted YAML + Markdown
    // Basic validation that it has frontmatter
    const fmMatch = responseText.match(/^---\n[\s\S]*?\n---\n[\s\S]*$/);
    if (!fmMatch) {
      console.warn('LLM response missing YAML frontmatter');
      return responseText; // Return as-is and let normalizer handle
    }
    
    return responseText.trim();
  } catch (error) {
    console.error('Error parsing LLM response:', error);
    return responseText;
  }
}

/**
 * Calculate confidence scores for extracted fields
 * @private
 */
function calculateConfidence(formatted, original) {
  const confidence = {};
  
  try {
    // Extract frontmatter for analysis
    const fmMatch = formatted.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return confidence;
    
    const yaml = fmMatch[1];
    const yamlLines = yaml.split('\n');
    
    // Check for key fields
    const hasTitle = yamlLines.some(line => line.match(/^title:\s*.+/));
    const hasYear = yamlLines.some(line => line.match(/^year:\s*\d{4}/));
    const hasDomains = yamlLines.some(line => line.match(/^domains:\s*\[.+\]/));
    const hasTopics = yamlLines.some(line => line.match(/^topics:\s*\[.+\]/));
    
    // Assign confidence based on field presence and quality
    confidence.title = hasTitle ? 0.9 : 0.0;
    confidence.year = hasYear ? 0.95 : 0.0;
    confidence.domains = hasDomains ? 0.8 : 0.0;
    confidence.topics = hasTopics ? 0.7 : 0.0;
    
    // Overall confidence
    const scores = Object.values(confidence);
    confidence.overall = scores.length > 0 ? 
      scores.reduce((a, b) => a + b) / scores.length : 0.0;
    
  } catch (error) {
    console.error('Error calculating confidence:', error);
  }
  
  return confidence;
}

/**
 * Fallback formatter using heuristics
 * @param {string} rawText
 * @returns {string} Best-effort formatted text
 */
function heuristicFormat(rawText) {
  try {
    const lines = rawText.split('\n');
    const frontmatter = {
      title: null,
      year: null,
      domains: [],
      topics: []
    };
    
    // Try to extract title from first non-empty line
    const firstLine = lines.find(line => line.trim().length > 0);
    if (firstLine) {
      frontmatter.title = firstLine.trim().replace(/^#\s*/, '');
    }
    
    // Look for year patterns
    const yearMatch = rawText.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) {
      frontmatter.year = parseInt(yearMatch[1]);
    }
    
    // Search for domain keywords
    const domainKeywords = {
      welding: /\b(weld|welding|welder|mig|tig|arc)\b/i,
      cnc: /\b(cnc|machining|mill|lathe|gcode)\b/i,
      leather: /\b(leather|hide|tanning|leatherwork)\b/i,
      firearms: /\b(firearm|gun|rifle|pistol|ammunition)\b/i,
      manufacturing: /\b(manufactur|production|assembly|fabricat)\b/i
    };
    
    for (const [domain, regex] of Object.entries(domainKeywords)) {
      if (regex.test(rawText)) {
        frontmatter.domains.push(domain);
      }
    }
    
    // Build YAML frontmatter
    let yaml = '---\n';
    if (frontmatter.title) yaml += `title: "${frontmatter.title}"\n`;
    if (frontmatter.year) yaml += `year: ${frontmatter.year}\n`;
    if (frontmatter.domains.length > 0) {
      yaml += `domains: [${frontmatter.domains.map(d => `"${d}"`).join(', ')}]\n`;
    }
    yaml += `topics: []\n`;
    yaml += `source_type: "other"\n`;
    yaml += '---\n\n';
    
    // Add the body
    yaml += rawText;
    
    return yaml;
  } catch (error) {
    console.error('Heuristic formatting failed:', error);
    return rawText;
  }
}

module.exports = {
  formatWithLLM,
  heuristicFormat,
  isLLMAvailable,
  VALID_DOMAINS,
  SOURCE_TYPES
};