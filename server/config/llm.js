/**
 * @file llm.js
 * @description LLM API configuration and client initialization
 * @author Kaiville Development Team
 * @created 2025-08-08
 * 
 * ARCHITECTURE PLANNING BLOCK
 * ==========================
 * 
 * PURPOSE:
 * - Centralize LLM provider configuration
 * - Support multiple providers (OpenAI, Anthropic, Azure)
 * - Handle API key management and validation
 * - Provide unified interface regardless of provider
 * 
 * DEPENDENCIES:
 * - openai (if using OpenAI)
 * - @anthropic-ai/sdk (if using Anthropic)
 * - dotenv (for environment variables)
 * 
 * TODO:
 * [ ] Implement provider detection from env
 * [ ] Create unified client interface
 * [ ] Add rate limiting configuration
 * [ ] Implement cost tracking hooks
 * [ ] Add provider health checks
 * [ ] Support for Azure OpenAI endpoints
 * 
 * CONFIGURATION:
 * Set in .env:
 * - LLM_PROVIDER=openai|anthropic|azure
 * - OPENAI_API_KEY=sk-...
 * - ANTHROPIC_API_KEY=sk-ant-...
 * - AZURE_OPENAI_ENDPOINT=https://...
 * - AZURE_OPENAI_KEY=...
 * - LLM_MODEL=gpt-4|claude-3-opus|etc
 * - LLM_MAX_TOKENS=2000
 * - LLM_TEMPERATURE=0.3
 * 
 * USAGE:
 * const { getLLMClient } = require('./config/llm');
 * const client = getLLLClient();
 * const response = await client.complete(prompt);
 */

require('dotenv').config();

// Provider constants
const PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  AZURE: 'azure',
  PERPLEXITY: 'perplexity'
};

// Model mappings
const MODELS = {
  [PROVIDERS.OPENAI]: {
    default: 'gpt-4-turbo-preview',
    fast: 'gpt-3.5-turbo',
    smart: 'gpt-4'
  },
  [PROVIDERS.ANTHROPIC]: {
    default: 'claude-3-opus-20240229',
    fast: 'claude-3-haiku-20240307',
    smart: 'claude-3-opus-20240229'
  },
  [PROVIDERS.AZURE]: {
    default: 'gpt-4',
    fast: 'gpt-35-turbo',
    smart: 'gpt-4'
  },
  [PROVIDERS.PERPLEXITY]: {
    default: 'llama-3.1-sonar-large-128k-online',
    fast: 'llama-3.1-sonar-small-128k-online',
    smart: 'llama-3.1-sonar-large-128k-online'
  }
};

/**
 * LLM Configuration
 */
class LLMConfig {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || PROVIDERS.OPENAI;
    this.apiKey = this.getApiKey();
    this.model = process.env.LLM_MODEL || MODELS[this.provider].default;
    this.maxTokens = parseInt(process.env.LLM_MAX_TOKENS || '2000');
    this.temperature = parseFloat(process.env.LLM_TEMPERATURE || '0.3');
    
    // Validate configuration
    this.validate();
  }
  
  getApiKey() {
    switch (this.provider) {
      case PROVIDERS.OPENAI:
        return process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
      case PROVIDERS.ANTHROPIC:
        return process.env.ANTHROPIC_API_KEY;
      case PROVIDERS.AZURE:
        return process.env.AZURE_OPENAI_KEY;
      case PROVIDERS.PERPLEXITY:
        return process.env.PERPLEXITY_API_KEY;
      default:
        throw new Error(`Unknown LLM provider: ${this.provider}`);
    }
  }
  
  validate() {
    if (!this.apiKey) {
      console.warn(`No API key found for ${this.provider}. LLM features disabled.`);
    }
    
    if (!Object.values(PROVIDERS).includes(this.provider)) {
      throw new Error(`Invalid LLM provider: ${this.provider}`);
    }
  }
  
  isEnabled() {
    return !!this.apiKey;
  }
}

/**
 * Unified LLM Client Interface
 */
class UnifiedLLMClient {
  constructor(config) {
    this.config = config;
    this.client = null;
    
    if (config.isEnabled()) {
      this.initializeClient();
    }
  }
  
  initializeClient() {
    switch (this.config.provider) {
      case PROVIDERS.OPENAI:
        const OpenAI = require('openai');
        this.client = new OpenAI({ apiKey: this.config.apiKey });
        break;

      case PROVIDERS.ANTHROPIC:
        // ====================================================================
        // ANTHROPIC PROVIDER - NOT IMPLEMENTED
        // ====================================================================
        // The Anthropic SDK is installed but not yet configured.
        // To use Anthropic, complete the implementation below.
        //
        // TODO: Uncomment and configure:
        // const Anthropic = require('@anthropic-ai/sdk');
        // this.client = new Anthropic({ apiKey: this.config.apiKey });
        //
        // For now, use LLM_PROVIDER=openai instead.
        // ====================================================================
        throw new Error(
          'Anthropic LLM provider is not fully implemented. ' +
          'Please set LLM_PROVIDER=openai in your .env file. ' +
          'See server/config/llm.js lines 137-144 for implementation details.'
        );

      case PROVIDERS.AZURE:
        // ====================================================================
        // AZURE OPENAI PROVIDER - NOT IMPLEMENTED
        // ====================================================================
        // Azure OpenAI requires different initialization than standard OpenAI.
        // To use Azure, complete the implementation below.
        //
        // TODO: Implement Azure OpenAI client:
        // const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
        // this.client = new OpenAIClient(
        //   process.env.AZURE_OPENAI_ENDPOINT,
        //   new AzureKeyCredential(this.config.apiKey)
        // );
        //
        // For now, use LLM_PROVIDER=openai instead.
        // ====================================================================
        throw new Error(
          'Azure OpenAI provider is not fully implemented. ' +
          'Please set LLM_PROVIDER=openai in your .env file. ' +
          'See server/config/llm.js lines 141-154 for implementation details.'
        );

      case PROVIDERS.PERPLEXITY:
        // ====================================================================
        // PERPLEXITY PROVIDER - OpenAI-Compatible API
        // ====================================================================
        // Perplexity uses OpenAI-compatible API with custom base URL
        // Models: llama-3.1-sonar-large-128k-online (research-enhanced)
        // ====================================================================
        const PerplexityOpenAI = require('openai');
        this.client = new PerplexityOpenAI({
          apiKey: this.config.apiKey,
          baseURL: 'https://api.perplexity.ai'
        });
        break;

      default:
        throw new Error(`Unknown LLM provider: ${this.config.provider}`);
    }
  }
  
  /**
   * Complete a prompt with the LLM
   * @param {string} prompt - The prompt to complete
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} The completion result
   */
  async complete(prompt, options = {}) {
    if (!this.config.isEnabled()) {
      throw new Error('LLM not configured. Please set API keys in .env');
    }
    
    try {
      switch (this.config.provider) {
        case PROVIDERS.OPENAI:
        case PROVIDERS.PERPLEXITY:
          // Both use OpenAI-compatible API
          const completion = await this.client.chat.completions.create({
            model: this.config.model,
            messages: [
              {
                role: 'system',
                content: 'You are a formatting assistant for the Kaiville Research Center. Your PRIMARY DIRECTIVE is to PRESERVE ALL ORIGINAL TEXT. Never summarize or remove content - only extract metadata and improve formatting.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
            ...options
          });

          return {
            text: completion.choices[0].message.content,
            usage: {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens
            },
            model: completion.model,
            provider: this.config.provider
          };

        case PROVIDERS.ANTHROPIC:
        case PROVIDERS.AZURE:
          throw new Error(
            `LLM provider '${this.config.provider}' is not fully implemented. ` +
            `This should have been caught during initialization. ` +
            `Please set LLM_PROVIDER=openai in your .env file.`
          );

        default:
          throw new Error(
            `Unknown LLM provider: ${this.config.provider}. ` +
            `Supported providers: ${Object.values(PROVIDERS).join(', ')}. ` +
            `Currently implemented: ${PROVIDERS.OPENAI}, ${PROVIDERS.PERPLEXITY}`
          );
      }
    } catch (error) {
      console.error('LLM completion error:', error);
      throw error;
    }
  }
  
  /**
   * Complete a prompt with automatic failover to backup providers
   * @param {string} prompt - The prompt to complete
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} The completion result
   */
  async completeWithFailover(prompt, options = {}) {
    // Define failover chain: primary → Perplexity → (future: Anthropic)
    const providers = [
      this.config.provider,           // Primary (usually OpenAI)
      PROVIDERS.PERPLEXITY,           // Fallback 1 (research-enhanced)
      // PROVIDERS.ANTHROPIC           // Future: Fallback 2
    ].filter((p, index, self) => self.indexOf(p) === index); // Remove duplicates

    let lastError = null;

    for (const provider of providers) {
      try {
        // Temporarily switch provider
        const originalProvider = this.config.provider;
        const originalClient = this.client;

        this.config.provider = provider;
        this.config.apiKey = this.getApiKey();

        // Skip if no API key for this provider
        if (!this.config.apiKey) {
          console.warn(`No API key for ${provider}, skipping...`);
          continue;
        }

        this.initializeClient();

        console.log(`Attempting LLM completion with provider: ${provider}`);
        const result = await this.complete(prompt, options);

        // Restore original provider
        this.config.provider = originalProvider;
        this.client = originalClient;

        console.log(`Successfully completed with provider: ${provider}`);
        return result;

      } catch (error) {
        console.warn(`Provider ${provider} failed: ${error.message}`);
        lastError = error;
        continue;
      }
    }

    throw new Error(
      `All LLM providers failed. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Stream a completion
   * @param {string} prompt
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<void>}
   */
  async streamComplete(prompt, onChunk) {
    // TODO: Implement streaming for supported providers
  }
  
  /**
   * Estimate tokens for a prompt
   * @param {string} text
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    // Rough estimate: 1 token per 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Health check for a specific provider
   * @param {string} provider - Provider to check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck(provider) {
    const testPrompt = "Say 'OK'";

    try {
      const originalProvider = this.config.provider;
      const originalClient = this.client;

      this.config.provider = provider;
      this.config.apiKey = this.getApiKey();

      if (!this.config.apiKey) {
        return {
          provider,
          status: 'unconfigured',
          message: 'No API key configured',
          timestamp: Date.now()
        };
      }

      this.initializeClient();

      const startTime = Date.now();
      await this.complete(testPrompt, { max_tokens: 5 });
      const responseTime = Date.now() - startTime;

      // Restore original
      this.config.provider = originalProvider;
      this.client = originalClient;

      return {
        provider,
        status: 'healthy',
        responseTime,
        timestamp: Date.now()
      };

    } catch (error) {
      return {
        provider,
        status: 'unhealthy',
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
}

// Singleton instance
let llmClient = null;

/**
 * Get the LLM client instance
 * @returns {UnifiedLLMClient}
 */
function getLLMClient() {
  if (!llmClient) {
    const config = new LLMConfig();
    llmClient = new UnifiedLLMClient(config);
  }
  return llmClient;
}

/**
 * Check if LLM is available
 * @returns {boolean}
 */
function isLLMAvailable() {
  const config = new LLMConfig();
  return config.isEnabled();
}

module.exports = {
  getLLMClient,
  isLLMAvailable,
  PROVIDERS,
  MODELS
};