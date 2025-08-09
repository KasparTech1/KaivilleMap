/**
 * Circle Y Saddles Database Query Service
 * Executes context-appropriate queries based on research domains
 */

const sql = require('mssql');
const { getQueriesForDomain, formatQueryResultsForAI } = require('./circleyQueryMappings');

class CircleYQueryService {
  constructor() {
    this.pool = null;
    this.config = {
      user: process.env.CIRCLEY_DB_USER,
      password: process.env.CIRCLEY_DB_PASSWORD,
      server: process.env.CIRCLEY_DB_SERVER,
      database: process.env.CIRCLEY_DB_NAME,
      options: {
        encrypt: true,
        trustServerCertificate: process.env.NODE_ENV === 'development',
        connectionTimeout: 30000,
        requestTimeout: 30000
      }
    };
  }

  /**
   * Initialize database connection pool
   */
  async connect() {
    if (this.pool) {
      return this.pool;
    }

    try {
      this.pool = await sql.connect(this.config);
      console.log('Connected to Circle Y database');
      return this.pool;
    } catch (error) {
      console.error('Circle Y database connection error:', error);
      throw new Error(`Failed to connect to Circle Y database: ${error.message}`);
    }
  }

  /**
   * Execute a single query
   */
  async executeQuery(querySQL, maxRows = 1000) {
    try {
      await this.connect();
      
      // Add row limit to prevent overwhelming results
      const limitedSQL = this._addRowLimit(querySQL, maxRows);
      
      const result = await this.pool.request().query(limitedSQL);
      return result.recordset;
    } catch (error) {
      console.error('Query execution error:', error);
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  /**
   * Execute queries for a specific research domain
   */
  async executeQueriesForDomain(domainKey, selectedQueries = null) {
    const domainQueries = getQueriesForDomain(domainKey);
    
    if (!domainQueries) {
      throw new Error(`Invalid domain: ${domainKey}`);
    }

    const results = {};
    const errors = {};

    // Determine which queries to execute
    const queriesToExecute = selectedQueries 
      ? domainQueries.queries.filter(q => selectedQueries.includes(q.key))
      : domainQueries.queries;

    // Execute queries in parallel with error handling
    await Promise.all(
      queriesToExecute.map(async (query) => {
        try {
          const startTime = Date.now();
          const data = await this.executeQuery(query.sql);
          const executionTime = Date.now() - startTime;
          
          results[query.key] = {
            name: query.name,
            description: query.description,
            data,
            rowCount: data.length,
            executionTime,
            formattedData: formatQueryResultsForAI(domainKey, query.key, data)
          };
        } catch (error) {
          errors[query.key] = {
            name: query.name,
            error: error.message
          };
        }
      })
    );

    return {
      domain: domainQueries.name,
      description: domainQueries.description,
      timestamp: new Date().toISOString(),
      results,
      errors: Object.keys(errors).length > 0 ? errors : null
    };
  }

  /**
   * Execute multiple queries across different domains
   */
  async executeMultiDomainQueries(domainQueryMap) {
    const allResults = {};
    
    for (const [domainKey, queryKeys] of Object.entries(domainQueryMap)) {
      try {
        const domainResults = await this.executeQueriesForDomain(domainKey, queryKeys);
        allResults[domainKey] = domainResults;
      } catch (error) {
        allResults[domainKey] = {
          error: error.message
        };
      }
    }
    
    return allResults;
  }

  /**
   * Format all query results for AI prompt inclusion
   */
  formatResultsForPrompt(queryResults) {
    let formattedText = '## Circle Y Saddles Business Data Context\n\n';
    formattedText += `Generated on: ${new Date().toLocaleString()}\n\n`;
    
    for (const [domain, domainResults] of Object.entries(queryResults)) {
      if (domainResults.error) {
        continue;
      }
      
      formattedText += `### ${domainResults.domain}\n`;
      formattedText += `${domainResults.description}\n\n`;
      
      for (const [queryKey, queryResult] of Object.entries(domainResults.results)) {
        if (!queryResult.data || queryResult.data.length === 0) {
          continue;
        }
        
        formattedText += `#### ${queryResult.name}\n`;
        formattedText += `${queryResult.description}\n\n`;
        
        // Add insights if available
        if (queryResult.formattedData?.insights?.length > 0) {
          formattedText += 'Key Insights:\n';
          queryResult.formattedData.insights.forEach(insight => {
            formattedText += `- ${insight}\n`;
          });
          formattedText += '\n';
        }
        
        // Add summary statistics
        formattedText += `Data Summary (${queryResult.rowCount} records):\n`;
        
        // Format first few rows as examples
        const sampleSize = Math.min(5, queryResult.data.length);
        if (sampleSize > 0) {
          formattedText += '```\n';
          formattedText += this._formatDataTable(queryResult.data.slice(0, sampleSize));
          formattedText += '```\n\n';
        }
      }
    }
    
    return formattedText;
  }

  /**
   * Get recommended queries based on research topics
   */
  getRecommendedQueries(researchTopics) {
    const recommendations = {};
    
    // Keywords to domain mapping
    const topicMappings = {
      manufacturing: ['manufacturing_optimization'],
      production: ['manufacturing_optimization'],
      efficiency: ['manufacturing_optimization', 'quality_automation'],
      quality: ['quality_automation'],
      defect: ['quality_automation'],
      automation: ['quality_automation'],
      supply: ['supply_chain'],
      inventory: ['supply_chain'],
      supplier: ['supply_chain'],
      sales: ['market_analysis'],
      market: ['market_analysis'],
      customer: ['market_analysis'],
      revenue: ['market_analysis'],
      product: ['product_innovation', 'market_analysis'],
      innovation: ['product_innovation'],
      new: ['product_innovation']
    };
    
    // Analyze research topics
    const lowerTopics = researchTopics.toLowerCase();
    
    for (const [keyword, domains] of Object.entries(topicMappings)) {
      if (lowerTopics.includes(keyword)) {
        domains.forEach(domain => {
          if (!recommendations[domain]) {
            recommendations[domain] = [];
          }
        });
      }
    }
    
    // If no specific matches, recommend market analysis as default
    if (Object.keys(recommendations).length === 0) {
      recommendations['market_analysis'] = [];
    }
    
    return recommendations;
  }

  /**
   * Add row limit to SQL query
   */
  _addRowLimit(sql, limit) {
    const upperSQL = sql.toUpperCase();
    
    // Check if query already has TOP clause
    if (upperSQL.includes('SELECT TOP')) {
      return sql;
    }
    
    // Add TOP clause after SELECT
    return sql.replace(/SELECT\s+/i, `SELECT TOP ${limit} `);
  }

  /**
   * Format data as ASCII table
   */
  _formatDataTable(data) {
    if (!data || data.length === 0) return '';
    
    const columns = Object.keys(data[0]);
    const maxLengths = {};
    
    // Calculate max length for each column
    columns.forEach(col => {
      maxLengths[col] = Math.max(
        col.length,
        ...data.map(row => String(row[col] || '').length)
      );
      // Cap column width
      maxLengths[col] = Math.min(maxLengths[col], 30);
    });
    
    // Build header
    let table = columns.map(col => col.padEnd(maxLengths[col])).join(' | ') + '\n';
    table += columns.map(col => '-'.repeat(maxLengths[col])).join(' | ') + '\n';
    
    // Build rows
    data.forEach(row => {
      table += columns.map(col => {
        let value = String(row[col] || '');
        if (value.length > maxLengths[col]) {
          value = value.substring(0, maxLengths[col] - 3) + '...';
        }
        return value.padEnd(maxLengths[col]);
      }).join(' | ') + '\n';
    });
    
    return table;
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      console.log('Circle Y database connection closed');
    }
  }
}

// Export singleton instance
module.exports = new CircleYQueryService();