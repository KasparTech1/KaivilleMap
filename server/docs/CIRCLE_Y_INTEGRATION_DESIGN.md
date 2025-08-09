# Circle Y Saddles Database Integration Design

## Overview

This document outlines the design for integrating Circle Y Saddles database queries into the Research Prompt Builder. The integration allows AI models to access real-time business data when generating research reports for Circle Y.

## Architecture

### 1. Database Query Mapping Structure

The system maps research domains to relevant SQL queries through a hierarchical structure:

```javascript
QUERY_MAPPINGS = {
  domain_key: {
    name: "Human-readable name",
    description: "Domain description",
    queries: {
      query_key: {
        name: "Query name",
        sql: "SELECT ...",
        description: "What this query provides"
      }
    }
  }
}
```

#### Domain Mappings

| Research Domain | Database Query Domain | Focus Areas |
|-----------------|----------------------|-------------|
| Manufacturing | `manufacturing_optimization` | Production efficiency, job completion times, bottlenecks |
| Quality | `quality_automation` | Defect rates, rework orders, quality metrics |
| Supply Chain | `supply_chain` | Inventory levels, lead times, supplier performance |
| Market/Sales | `market_analysis` | Sales trends, popular products, customer segments |
| Product/Innovation | `product_innovation` | Product line performance, new vs legacy products |

### 2. Key Components

#### A. Query Mappings (`circleyQueryMappings.js`)
- Defines all available SQL queries organized by domain
- Provides helper functions for query discovery and formatting
- Includes basic insight generation from query results

#### B. Query Service (`circleyQueryService.js`)
- Manages SQL Server database connections
- Executes queries with proper error handling and timeouts
- Formats results for AI consumption
- Implements connection pooling for performance

#### C. Integration Layer (`circleyIntegration.js`)
- Processes Circle Y data inclusion requests
- Maps research domains to appropriate queries
- Enhances prompts with business data context
- Validates database connectivity

#### D. Enhanced Controllers (`enhancedControllers.js`)
- Extends existing research controllers with Circle Y functionality
- Handles API requests for Circle Y configuration and data
- Integrates seamlessly with existing prompt generation flow

#### E. UI Component (`CircleYDataInclusion.jsx`)
- React component for the frontend integration
- Shows checkbox when Circle Y is selected as business unit
- Displays available data domains with descriptions
- Allows preview of queries before inclusion

### 3. Sample SQL Queries

#### Manufacturing Optimization
```sql
-- Production Efficiency Analysis
SELECT 
  job_number,
  product_code,
  DATEDIFF(day, start_date, completion_date) as actual_days,
  CASE 
    WHEN completion_date <= scheduled_completion THEN 'On Time'
    ELSE 'Late'
  END as delivery_status
FROM job_header
WHERE start_date >= DATEADD(month, -6, GETDATE())
```

#### Market Analysis
```sql
-- Sales Performance Trends
SELECT 
  DATEPART(year, order_date) as year,
  DATEPART(month, order_date) as month,
  COUNT(DISTINCT order_number) as order_count,
  SUM(order_total) as total_revenue
FROM order_bookings
WHERE order_date >= DATEADD(year, -2, GETDATE())
GROUP BY DATEPART(year, order_date), DATEPART(month, order_date)
```

### 4. API Endpoints

```
GET  /api/research/circley/config
     Returns Circle Y configuration and available domains

GET  /api/research/circley/domains/:domainKey/queries
     Returns available queries for a specific domain

POST /api/research/circley/test-query
     Tests a specific query execution (admin endpoint)

POST /api/research/generate
     Enhanced with includeCircleYData parameter
```

### 5. UI/UX Flow

1. **Business Unit Selection**: User selects "Circle Y Saddles" as business unit
2. **Data Inclusion Option**: "Include Global Shop Data" checkbox appears
3. **Domain Selection**: Available data domains are shown based on research topics
4. **Auto-Matching**: System automatically suggests relevant domains
5. **Manual Override**: User can select/deselect specific domains
6. **Query Preview**: User can preview what queries will be executed
7. **Prompt Enhancement**: Selected data is fetched and included in AI prompt
8. **Result Generation**: AI generates research with access to real business data

### 6. Data Flow

```
User Selects Circle Y → Shows Data Options → User Enables Data
                                               ↓
                                    Selects Research Domains
                                               ↓
                                    System Maps to Query Domains
                                               ↓
                                    Executes Relevant Queries
                                               ↓
                                    Formats Results for AI
                                               ↓
                                    Enhances Prompt with Data
                                               ↓
                                    AI Generates Informed Research
```

### 7. Security Considerations

- Database credentials stored in environment variables
- Read-only database access
- Query result limits to prevent data overload
- Connection timeouts to prevent hanging
- SQL injection prevention through parameterized queries
- Row-level security through database views if needed

### 8. Performance Optimizations

- Connection pooling for database efficiency
- Parallel query execution within domains
- Result caching for repeated queries (15-minute TTL)
- Row limits on all queries (configurable, default 1000)
- Query timeout limits (30 seconds default)
- Selective domain querying based on research focus

### 9. Error Handling

- Graceful degradation if database is unavailable
- Individual query failure doesn't block entire request
- Clear error messages in UI
- Detailed logging for debugging
- Fallback to research without data if integration fails

### 10. Configuration

Required environment variables:
```
CIRCLEY_DB_SERVER=your-server.database.windows.net
CIRCLEY_DB_NAME=CircleYProduction
CIRCLEY_DB_USER=readonly_user
CIRCLEY_DB_PASSWORD=secure_password
```

Optional configuration:
```
CIRCLEY_MAX_ROWS_PER_QUERY=1000
CIRCLEY_QUERY_TIMEOUT_MS=30000
CIRCLEY_ENABLE_CACHE=true
CIRCLEY_CACHE_TTL_MINUTES=15
```

## Implementation Steps

1. **Backend Setup**
   - Install SQL Server driver: `npm install mssql`
   - Add Circle Y database credentials to `.env`
   - Deploy query mappings and services

2. **API Integration**
   - Add Circle Y routes to Express app
   - Update research generation endpoint
   - Test database connectivity

3. **Frontend Integration**
   - Add CircleYDataInclusion component to research form
   - Update form state management
   - Add data inclusion parameters to API calls

4. **Testing**
   - Test each domain's queries individually
   - Verify data formatting for AI consumption
   - Test error scenarios (DB down, timeout, etc.)
   - Validate UI behavior with/without Circle Y

5. **Deployment**
   - Set up database access in production
   - Configure connection strings
   - Monitor query performance
   - Set up alerts for failures

## Future Enhancements

1. **Query Builder UI**: Allow users to create custom queries
2. **Data Visualization**: Preview query results in charts/tables
3. **Query Templates**: Save frequently used query combinations
4. **Real-time Updates**: WebSocket integration for live data
5. **Multi-Company Support**: Extend to other Kaspar companies
6. **Advanced Filtering**: Date ranges, product filters, etc.
7. **Export Capabilities**: Download query results as CSV/Excel
8. **Query Optimization**: Automatic query performance tuning