/**
 * @file templates.js
 * @description Research Center templates and categories configuration
 * @author Kaiville Development Team
 * @created 2026-02-01
 *
 * RESEARCH CENTER TEMPLATES (Q5: Optional Templates)
 * - Provides structured templates for research submissions
 * - Users can choose a template or submit free-form
 * - Templates guide quality without forcing structure
 *
 * RESEARCH CATEGORIES (Q7: Fixed Category List)
 * - 6 core categories for organizing research articles
 * - Simple dropdown selection during submission
 * - Predictable organization and filtering
 */

/**
 * Research Article Templates
 * These provide optional structure for submissions
 */
const RESEARCH_TEMPLATES = {
  scientific: {
    id: 'scientific',
    name: 'Scientific Paper',
    description: 'Formal research paper structure',
    icon: '🔬',
    structure: {
      sections: ['Abstract', 'Introduction', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References']
    },
    placeholder: `# [Your Title]

## Abstract
Brief summary of your research (150-250 words)...

## Introduction
Background, context, and research question...

## Methodology
How you conducted the research...
- Research approach
- Data collection methods
- Analysis techniques

## Results
What you found...
- Key findings
- Data presentation
- Observations

## Discussion
Interpretation of results...
- What the findings mean
- Comparison with existing research
- Implications

## Conclusion
Key takeaways and future directions...

## References
1. Source 1
2. Source 2
`,
    recommendedFor: ['experiments', 'theory', 'technical_analysis']
  },

  analysis: {
    id: 'analysis',
    name: 'Analysis & Commentary',
    description: 'Analytical piece or opinion on phenomena',
    icon: '📊',
    structure: {
      sections: ['Summary', 'Analysis', 'Implications']
    },
    placeholder: `# [Your Title]

## Summary
Brief overview of what you're analyzing...

## Analysis
Your detailed examination...
- Key observations
- Patterns identified
- Supporting evidence
- Alternative interpretations

## Implications
What this means for understanding the phenomenon...
- Theoretical implications
- Practical applications
- Future research directions
`,
    recommendedFor: ['anomalies', 'field_reports', 'theory']
  },

  tutorial: {
    id: 'tutorial',
    name: 'Tutorial/Guide',
    description: 'Step-by-step instructional guide or methodology',
    icon: '📝',
    structure: {
      sections: ['Overview', 'Prerequisites', 'Steps', 'Troubleshooting']
    },
    placeholder: `# [Your Title]

## Overview
What this guide covers and who it's for...

## Prerequisites
What you need before starting...
- Required knowledge
- Equipment/tools
- Safety considerations

## Steps

### Step 1: [First Step Title]
Detailed instructions...

### Step 2: [Second Step Title]
Detailed instructions...

### Step 3: [Third Step Title]
Detailed instructions...

## Troubleshooting
Common issues and solutions...

## Additional Resources
Links and references for further learning...
`,
    recommendedFor: ['experiments', 'technical_analysis']
  },

  field_report: {
    id: 'field_report',
    name: 'Field Report',
    description: 'On-site investigation or observation report',
    icon: '📍',
    structure: {
      sections: ['Location & Date', 'Observations', 'Evidence', 'Conclusions']
    },
    placeholder: `# [Your Title]

## Location & Date
**Location:** [Specific location]
**Date/Time:** [When the observation occurred]
**Duration:** [How long]
**Conditions:** [Weather, lighting, etc.]

## Observations
Detailed account of what was observed...
- Initial conditions
- Sequence of events
- Notable phenomena
- Environmental factors

## Evidence
Documentation collected...
- Photographs
- Measurements
- Recordings
- Physical samples

## Analysis
Interpretation of observations...

## Conclusions
Summary and significance of findings...

## Recommendations
Suggestions for follow-up investigation...
`,
    recommendedFor: ['field_reports', 'anomalies']
  },

  general: {
    id: 'general',
    name: 'General Research',
    description: 'Free-form research article',
    icon: '📄',
    structure: null,
    placeholder: `# [Your Title]

Write your research article here in your own structure...

## Introduction
Introduce your topic...

## Main Content
Your research content...

## Conclusion
Wrap up your findings...
`,
    recommendedFor: ['historical_research', 'anomalies', 'theory']
  }
};

/**
 * Research Categories (Fixed List)
 * Maps to database enum: public.research_category
 */
const RESEARCH_CATEGORIES = [
  {
    id: 'anomalies',
    name: 'Anomalies',
    icon: '❓',
    description: 'Unexplained phenomena and strange occurrences',
    examples: ['Unexplained readings', 'Strange behaviors', 'Mysterious events', 'Unusual patterns'],
    color: '#9333ea' // purple
  },
  {
    id: 'experiments',
    name: 'Experiments',
    icon: '🧪',
    description: 'Scientific experiments and systematic observations',
    examples: ['Controlled tests', 'Replications', 'New methodologies', 'Experimental results'],
    color: '#3b82f6' // blue
  },
  {
    id: 'theory',
    name: 'Theory',
    icon: '💭',
    description: 'Theoretical frameworks and hypotheses',
    examples: ['Explanatory models', 'Conceptual frameworks', 'Predictions', 'Mathematical models'],
    color: '#06b6d4' // cyan
  },
  {
    id: 'field_reports',
    name: 'Field Reports',
    icon: '📍',
    description: 'On-site investigation reports and field observations',
    examples: ['Site investigations', 'Observational studies', 'Location surveys', 'Environmental monitoring'],
    color: '#10b981' // green
  },
  {
    id: 'technical_analysis',
    name: 'Technical Analysis',
    icon: '⚙️',
    description: 'Technical deep-dives and analytical breakdowns',
    examples: ['System analysis', 'Data interpretation', 'Technical reviews', 'Engineering insights'],
    color: '#f59e0b' // amber
  },
  {
    id: 'historical_research',
    name: 'Historical Research',
    icon: '📚',
    description: 'Historical context and archival documentation',
    examples: ['Historical records', 'Timeline analysis', 'Archival findings', 'Context research'],
    color: '#8b5cf6' // violet
  }
];

/**
 * Get template by ID
 * @param {string} templateId - Template identifier
 * @returns {Object|null} Template object or null if not found
 */
function getTemplate(templateId) {
  return RESEARCH_TEMPLATES[templateId] || null;
}

/**
 * Get category by ID
 * @param {string} categoryId - Category identifier
 * @returns {Object|null} Category object or null if not found
 */
function getCategory(categoryId) {
  return RESEARCH_CATEGORIES.find(cat => cat.id === categoryId) || null;
}

/**
 * Get recommended templates for a category
 * @param {string} categoryId - Category identifier
 * @returns {Array} Array of recommended template IDs
 */
function getRecommendedTemplates(categoryId) {
  const recommended = [];

  Object.values(RESEARCH_TEMPLATES).forEach(template => {
    if (template.recommendedFor && template.recommendedFor.includes(categoryId)) {
      recommended.push(template.id);
    }
  });

  return recommended;
}

/**
 * Validate category ID
 * @param {string} categoryId - Category to validate
 * @returns {boolean} True if valid category
 */
function isValidCategory(categoryId) {
  return RESEARCH_CATEGORIES.some(cat => cat.id === categoryId);
}

/**
 * Validate template ID
 * @param {string} templateId - Template to validate
 * @returns {boolean} True if valid template
 */
function isValidTemplate(templateId) {
  return templateId in RESEARCH_TEMPLATES;
}

module.exports = {
  RESEARCH_TEMPLATES,
  RESEARCH_CATEGORIES,
  getTemplate,
  getCategory,
  getRecommendedTemplates,
  isValidCategory,
  isValidTemplate
};
