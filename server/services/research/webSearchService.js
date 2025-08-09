const axios = require('axios');

class WebSearchService {
  constructor() {
    // You can use various search APIs:
    // - Serper API (recommended for quality)
    // - SerpAPI
    // - Bing Search API
    // - Google Custom Search API
    this.serperApiKey = process.env.SERPER_API_KEY;
    this.bingApiKey = process.env.BING_SEARCH_KEY;
  }

  // Search using Serper API (if available)
  async searchWithSerper(query, num = 10) {
    if (!this.serperApiKey) {
      return null;
    }

    try {
      const response = await axios.post(
        'https://google.serper.dev/search',
        {
          q: query,
          num: num,
          gl: 'us',
          hl: 'en'
        },
        {
          headers: {
            'X-API-KEY': this.serperApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        organic: response.data.organic || [],
        news: response.data.news || [],
        knowledgeGraph: response.data.knowledgeGraph || null
      };
    } catch (error) {
      console.error('Serper API error:', error.message);
      return null;
    }
  }

  // Search using Bing Search API (if available)
  async searchWithBing(query, count = 10) {
    if (!this.bingApiKey) {
      return null;
    }

    try {
      const response = await axios.get(
        'https://api.bing.microsoft.com/v7.0/search',
        {
          params: {
            q: query,
            count: count,
            freshness: 'Month', // Prioritize recent content
            responseFilter: 'Webpages,News',
            safeSearch: 'Moderate'
          },
          headers: {
            'Ocp-Apim-Subscription-Key': this.bingApiKey
          }
        }
      );

      return {
        webPages: response.data.webPages?.value || [],
        news: response.data.news?.value || []
      };
    } catch (error) {
      console.error('Bing API error:', error.message);
      return null;
    }
  }

  // Enhanced search for research purposes
  async searchForResearch(topic, options = {}) {
    const {
      includeNews = true,
      includeAcademic = true,
      dateRange = 'recent', // recent, year, all
      numResults = 10
    } = options;

    const searchQueries = [];
    
    // Base query
    searchQueries.push(topic);
    
    // Add date qualifiers
    if (dateRange === 'recent') {
      searchQueries.push(`${topic} 2024 2025 latest`);
    } else if (dateRange === 'year') {
      searchQueries.push(`${topic} ${new Date().getFullYear()}`);
    }
    
    // Add specific searches
    if (includeNews) {
      searchQueries.push(`${topic} news latest updates`);
    }
    
    if (includeAcademic) {
      searchQueries.push(`${topic} research paper study report`);
    }

    const results = {
      webResults: [],
      newsResults: [],
      sources: []
    };

    // Try Serper first (better quality)
    for (const query of searchQueries) {
      const serperResults = await this.searchWithSerper(query, numResults);
      if (serperResults) {
        results.webResults.push(...(serperResults.organic || []));
        results.newsResults.push(...(serperResults.news || []));
      } else {
        // Fallback to Bing
        const bingResults = await this.searchWithBing(query, numResults);
        if (bingResults) {
          results.webResults.push(...(bingResults.webPages || []));
          results.newsResults.push(...(bingResults.news || []));
        }
      }
    }

    // Format sources for citations
    const allResults = [...results.webResults, ...results.newsResults];
    results.sources = this.formatSourcesForCitation(allResults);

    return results;
  }

  // Format search results into citation-ready sources
  formatSourcesForCitation(results) {
    const sources = [];
    const seen = new Set();

    for (const result of results) {
      const url = result.url || result.link;
      if (!url || seen.has(url)) continue;
      seen.add(url);

      sources.push({
        title: result.title || result.name,
        url: url,
        snippet: result.snippet || result.description,
        datePublished: result.datePublished || result.date || null,
        source: result.displayUrl || new URL(url).hostname
      });
    }

    return sources.slice(0, 20); // Limit to 20 sources
  }

  // Generate search context for AI models
  async generateSearchContext(topic, model = 'general') {
    const searchResults = await this.searchForResearch(topic, {
      includeNews: true,
      includeAcademic: true,
      dateRange: 'recent',
      numResults: 15
    });

    if (!searchResults || searchResults.sources.length === 0) {
      return '';
    }

    let context = `\n\nCURRENT WEB RESEARCH CONTEXT (as of ${new Date().toLocaleDateString()}):\n\n`;
    
    // Add top web results
    context += 'RECENT WEB SOURCES:\n';
    searchResults.sources.slice(0, 10).forEach((source, index) => {
      context += `[${index + 1}] ${source.title}\n`;
      context += `    URL: ${source.url}\n`;
      if (source.datePublished) {
        context += `    Date: ${new Date(source.datePublished).toLocaleDateString()}\n`;
      }
      context += `    Summary: ${source.snippet}\n\n`;
    });

    // Add news if available
    if (searchResults.newsResults.length > 0) {
      context += '\nRECENT NEWS:\n';
      searchResults.newsResults.slice(0, 5).forEach((news, index) => {
        context += `- ${news.name || news.title} (${news.datePublished ? new Date(news.datePublished).toLocaleDateString() : 'Recent'})\n`;
      });
    }

    context += '\nUse this current information to enhance your research response.\n';

    return context;
  }
}

module.exports = new WebSearchService();