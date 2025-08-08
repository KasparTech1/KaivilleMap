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
 * Research source types (matching database enum)
 */
const SOURCE_TYPES = [
  'peer-reviewed', 'whitepaper', 'standard', 'blog', 'news', 'report', 'other'
];

/**
 * Helpful mappings for LLM prompt
 */
const SOURCE_TYPE_EXAMPLES = {
  'peer-reviewed': 'academic papers, journal articles, conference papers, theses',
  'whitepaper': 'white papers, technical specifications',
  'standard': 'industry standards, technical standards',
  'blog': 'blog posts, technical articles, online articles',
  'news': 'news articles, press releases',
  'report': 'industry reports, case studies, government reports, technical reports',
  'other': 'anything else'
};

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
    
    // VALIDATION: Check if LLM preserved the text
    const formattedBody = formatted.split('---')[2] || '';
    const originalLength = rawText.length;
    const formattedLength = formattedBody.length;
    
    // If the formatted text is significantly shorter (lost >20% of content), use fallback
    if (formattedLength < originalLength * 0.8) {
      console.warn(`LLM removed too much content! Original: ${originalLength} chars, Formatted: ${formattedLength} chars`);
      console.warn('Falling back to heuristic formatting to preserve full text');
      
      // Use heuristic formatter which preserves everything
      const heuristicResult = heuristicFormat(rawText);
      return {
        formatted: heuristicResult,
        confidence: { overall: 0.5 },
        llmUsed: false,
        llmModel: 'heuristic-fallback',
        error: 'LLM removed content'
      };
    }
    
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
  const prompt = `You are a formatting assistant. Your ONLY job is to:
1. Extract metadata for YAML frontmatter
2. Pass through the ENTIRE original text with better markdown formatting

⚠️ CRITICAL: DO NOT REMOVE ANY TEXT! DO NOT SUMMARIZE! DO NOT SHORTEN!

Your output MUST follow this EXACT structure:

---
title: "Extract the title"
authors: ["Extract any authors"]
year: Extract year or null
publisher: "Extract publisher or null"
source_url: "Extract URL or null"
source_type: "Choose from: ${SOURCE_TYPES.join(', ')}"
region: "Extract region or null"
domains: ["Choose from: ${VALID_DOMAINS.join(', ')}"]
topics: ["Extract specific technical topics"]
keywords: ["Extract keywords"]
summary: "> Write a NEW 1-paragraph summary (don't extract, GENERATE this)"
key_points: ["Extract key point 1", "Extract key point 2", "Extract key point 3"]
---

[PASTE THE ENTIRE ORIGINAL TEXT HERE WITH ONLY THESE CHANGES:
- Fix line breaks between paragraphs (add blank lines)
- Convert headers to proper markdown (# ## ###)
- Fix list formatting (- or 1. 2. 3.)
- NO OTHER CHANGES! DO NOT REMOVE ANY SENTENCES, PARAGRAPHS, SECTIONS, OR WORDS!]

EXAMPLE - If the original text is:
"Introduction This is a paper about welding. Methods We used TIG welding. Results It worked well. References [1] Smith 2023"

Your body should be:
# Introduction
This is a paper about welding.

## Methods
We used TIG welding.

## Results
It worked well.

## References
[1] Smith 2023

⚠️ FINAL WARNING: The body section must contain EVERY SINGLE WORD from the original text!
Only improve formatting - DO NOT DELETE ANYTHING!

ORIGINAL TEXT TO FORMAT:
${rawText}

REMEMBER: Start with --- then frontmatter then --- then THE COMPLETE TEXT!`;
  
  return prompt;
}

/**
 * Parse and validate LLM response
 * @private
 */
function parseLLMResponse(responseText) {
  try {
    // Clean up response - sometimes LLM adds extra text before/after
    let cleaned = responseText.trim();
    
    // If response doesn't start with ---, try to find it
    if (!cleaned.startsWith('---')) {
      const yamlStart = cleaned.indexOf('---');
      if (yamlStart > 0) {
        console.warn('LLM response had text before YAML, cleaning...');
        cleaned = cleaned.substring(yamlStart);
      }
    }
    
    // Validate it has proper frontmatter structure
    const fmMatch = cleaned.match(/^---\n[\s\S]*?\n---\n[\s\S]*$/);
    if (!fmMatch) {
      console.error('LLM response missing valid YAML frontmatter structure');
      // Last resort: if we have ---, try to ensure proper format
      if (cleaned.includes('---')) {
        const parts = cleaned.split('---');
        if (parts.length >= 3) {
          // Reconstruct with proper format
          cleaned = `---\n${parts[1].trim()}\n---\n${parts.slice(2).join('---').trim()}`;
        }
      }
    }
    
    return cleaned;
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
 * Clean text while preserving all content
 * @param {string} text
 * @returns {string} Cleaned text
 */
function cleanTextMinimal(text) {
  // Fix common formatting issues while preserving all content
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\t/g, '    ') // Convert tabs to spaces
    .replace(/\n{3,}/g, '\n\n') // Reduce multiple blank lines to double
    .replace(/^\s+$/gm, '') // Remove whitespace-only lines
    .trim();
}

/**
 * Fallback formatter using heuristics
 * @param {string} rawText
 * @returns {string} Best-effort formatted text
 */
function heuristicFormat(rawText) {
  try {
    const cleanedText = cleanTextMinimal(rawText);
    const lines = cleanedText.split('\n');
    const frontmatter = {
      title: null,
      year: null,
      domains: [],
      topics: [],
      summary: null,
      key_points: []
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
    
    // Generate a simple summary from first paragraph
    const firstParagraph = lines
      .slice(1) // Skip title
      .find(line => line.trim().length > 50);
    if (firstParagraph) {
      frontmatter.summary = `> ${firstParagraph.trim().substring(0, 200)}...`;
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
    if (frontmatter.summary) yaml += `summary: "${frontmatter.summary}"\n`;
    yaml += `key_points: []\n`;
    yaml += '---\n\n';
    
    // Add the COMPLETE cleaned body
    yaml += cleanedText;
    
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