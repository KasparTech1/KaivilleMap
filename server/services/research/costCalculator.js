// Token pricing as of 2025 (prices per 1K tokens)
const TOKEN_PRICING = {
  claude: {
    'claude-opus-4-1-20250805': {
      input: 0.015,  // $15 per 1M tokens
      output: 0.075  // $75 per 1M tokens
    },
    'claude-3-opus-20240229': {
      input: 0.015,
      output: 0.075
    },
    'claude-3-5-sonnet-20241022': {
      input: 0.003,
      output: 0.015
    }
  },
  gpt5: {
    'gpt-5': {
      input: 0.00125,  // $1.25 per 1M tokens
      output: 0.01     // $10 per 1M tokens
    },
    'gpt-5-mini': {
      input: 0.0006,
      output: 0.002
    },
    'gpt-5-nano': {
      input: 0.0003,
      output: 0.001
    }
  },
  gpt4: {
    'gpt-4-0125-preview': {
      input: 0.01,
      output: 0.03
    }
  },
  grok: {
    'grok-4-0709': {
      input: 0.003,   // $3 per 1M tokens
      output: 0.015   // $15 per 1M tokens
    },
    'grok-2-1212': {
      input: 0.003,
      output: 0.015
    }
  }
};

class CostCalculator {
  calculateCost(model, modelVersion, inputTokens, outputTokens) {
    // Find the pricing for the model
    let pricing = null;
    
    // Check each provider
    for (const [provider, models] of Object.entries(TOKEN_PRICING)) {
      if (models[modelVersion]) {
        pricing = models[modelVersion];
        break;
      }
    }
    
    // Fallback to default pricing if model not found
    if (!pricing) {
      console.warn(`Pricing not found for model ${modelVersion}, using defaults`);
      pricing = { input: 0.01, output: 0.03 };
    }
    
    // Calculate costs (convert from per 1K to actual token count)
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    const totalCost = inputCost + outputCost;
    
    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: Math.round(inputCost * 10000) / 10000, // Round to 4 decimal places
      outputCost: Math.round(outputCost * 10000) / 10000,
      totalCost: Math.round(totalCost * 10000) / 10000,
      costPerThousandTokens: pricing,
      currency: 'USD'
    };
  }
  
  // Estimate tokens from text (rough approximation)
  estimateTokens(text) {
    // Rough estimate: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
  
  // Format cost for display
  formatCost(cost) {
    return `$${cost.toFixed(4)} USD`;
  }
  
  // Get monthly usage estimate
  getMonthlyEstimate(dailyRequests, avgTokensPerRequest, model) {
    const monthlyRequests = dailyRequests * 30;
    const monthlyTokens = monthlyRequests * avgTokensPerRequest;
    
    // Assume 30% input, 70% output for typical research
    const inputTokens = monthlyTokens * 0.3;
    const outputTokens = monthlyTokens * 0.7;
    
    const cost = this.calculateCost(model, model, inputTokens, outputTokens);
    
    return {
      monthlyRequests,
      monthlyTokens,
      estimatedMonthlyCost: cost.totalCost,
      breakdown: cost
    };
  }
}

module.exports = new CostCalculator();