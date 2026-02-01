# API Documentation

**KaivilleMap Backend API Reference**

Base URL (Development): `http://localhost:3000/api` or `http://localhost:3001/api`
Base URL (Production): `https://your-domain.up.railway.app/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [General Endpoints](#general-endpoints)
3. [Research Endpoints](#research-endpoints)
4. [Article Management](#article-management)
5. [Template Management](#template-management)
6. [Prompt Management](#prompt-management)
7. [Segment Options](#segment-options)
8. [Circle Y Integration](#circle-y-integration)
9. [Admin Endpoints](#admin-endpoints)
10. [Debug Endpoints](#debug-endpoints)
11. [Error Responses](#error-responses)

---

## Authentication

**Current Status**: No authentication required for most endpoints.

**Site Password**: The frontend has a simple site-wide password (`'Bryan'`) but this is NOT API authentication - it's a frontend-only gate.

**Future**: Admin endpoints may require authentication tokens.

---

## General Endpoints

### Health Check

**GET** `/api/health`

Check if the server is running and healthy.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T12:00:00.000Z",
  "environment": "production",
  "database": "Supabase",
  "port": 3001
}
```

---

### Ping

**GET** `/api/ping`

Simple ping endpoint for connectivity testing.

**Response**: `"pong"` (text/plain)

---

### Root

**GET** `/api/`

API welcome message.

**Response**: `"Welcome to Your Website!"` (text/plain)

---

## Research Endpoints

All research endpoints are mounted under `/api/research`

### Generate Research Article

**POST** `/api/research/generate`

Generate a new research article using AI/LLM.

**Request Body**:
```json
{
  "topic": "string (required)",
  "depth": "shallow|medium|deep (optional)",
  "includeCircleY": "boolean (optional)",
  "template": "string (optional) - template ID",
  "customPrompt": "string (optional)"
}
```

**Response** (Success):
```json
{
  "success": true,
  "article": {
    "id": "uuid",
    "title": "string",
    "content": "string (markdown)",
    "metadata": {
      "model": "gpt-4-turbo-preview",
      "tokens": 1500,
      "generatedAt": "2026-02-01T12:00:00.000Z"
    }
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Error message"
}
```

---

### Queue Article

**POST** `/api/research/queue-article`

Queue an article for processing (async generation).

**Request Body**:
```json
{
  "topic": "string",
  "priority": "low|medium|high (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "queueId": "uuid",
  "estimatedTime": "5 minutes"
}
```

---

### Paste Content

**POST** `/api/research/paste`

Submit pasted content for processing into a research article.

**Request Body**:
```json
{
  "content": "string (required)",
  "title": "string (optional)",
  "format": "text|markdown|html (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "article": { /* article object */ }
}
```

---

### Upload File

**POST** `/api/research/upload`

Upload a file (PDF, DOCX, TXT) for processing.

**Request**: multipart/form-data
- `file`: File upload (required)
- `title`: string (optional)

**Response**:
```json
{
  "success": true,
  "article": { /* article object */ }
}
```

---

### Import from URL

**POST** `/api/research/import-url`

Import and process content from a URL.

**Request Body**:
```json
{
  "url": "string (required)",
  "title": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "article": { /* article object */ }
}
```

---

### Get Status

**GET** `/api/research/status`

Get current research service status and configuration.

**Response**:
```json
{
  "llmProvider": "openai",
  "llmEnabled": true,
  "circleYEnabled": false,
  "queueLength": 3,
  "systemHealth": "ok"
}
```

---

## Article Management

### List All Articles

**GET** `/api/research/articles`

Retrieve all research articles.

**Query Parameters**:
- `limit` (number, default: 50) - Max articles to return
- `offset` (number, default: 0) - Pagination offset
- `category` (string, optional) - Filter by category
- `tag` (string, optional) - Filter by tag
- `search` (string, optional) - Search in title/content

**Response**:
```json
{
  "articles": [
    {
      "id": "uuid",
      "slug": "article-slug",
      "title": "Article Title",
      "excerpt": "Brief summary...",
      "content": "Full markdown content...",
      "category": "Technology",
      "tags": ["AI", "Research"],
      "createdAt": "2026-02-01T12:00:00.000Z",
      "updatedAt": "2026-02-01T12:00:00.000Z"
    }
  ],
  "total": 100,
  "hasMore": true,
  "limit": 50,
  "offset": 0
}
```

---

### Get Article by Slug

**GET** `/api/research/articles/:slug`

Retrieve a specific article by its slug.

**Path Parameters**:
- `slug` (string) - URL-friendly article identifier

**Response**:
```json
{
  "article": {
    "id": "uuid",
    "slug": "article-slug",
    "title": "Article Title",
    "content": "Full markdown content...",
    "category": "Technology",
    "tags": ["AI", "Research"],
    "metadata": {
      "author": "AI Assistant",
      "readTime": "5 min",
      "wordCount": 1200
    },
    "createdAt": "2026-02-01T12:00:00.000Z"
  }
}
```

**Error Response** (404):
```json
{
  "error": "Article not found"
}
```

---

### Get Related Articles

**GET** `/api/research/articles/:id/related`

Get articles related to a specific article (based on tags/category).

**Path Parameters**:
- `id` (uuid) - Article ID

**Query Parameters**:
- `limit` (number, default: 5) - Max related articles

**Response**:
```json
{
  "related": [
    {
      "id": "uuid",
      "slug": "related-article",
      "title": "Related Article Title",
      "excerpt": "Summary...",
      "similarity": 0.85
    }
  ]
}
```

---

### Update Article

**PUT** `/api/research/articles/:id`

Update an existing article.

**Path Parameters**:
- `id` (uuid) - Article ID

**Request Body**:
```json
{
  "title": "string (optional)",
  "content": "string (optional)",
  "category": "string (optional)",
  "tags": ["array", "of", "strings"] (optional),
  "metadata": { /* object */ } (optional)
}
```

**Response**:
```json
{
  "success": true,
  "article": { /* updated article */ }
}
```

---

### Reprocess Article

**POST** `/api/research/articles/:id/reprocess`

Reprocess an article with updated formatting/metadata.

**Path Parameters**:
- `id` (uuid) - Article ID

**Request Body** (optional):
```json
{
  "preserveEdits": "boolean (default: true)",
  "updateMetadata": "boolean (default: true)"
}
```

**Response**:
```json
{
  "success": true,
  "article": { /* reprocessed article */ }
}
```

---

### Delete Article

**DELETE** `/api/research/articles/:id`

Delete an article permanently.

**Path Parameters**:
- `id` (uuid) - Article ID

**Response**:
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

---

### Get All Tags

**GET** `/api/research/tags`

Retrieve all unique tags used in articles.

**Response**:
```json
{
  "tags": [
    {
      "name": "AI",
      "count": 15,
      "category": "Technology"
    },
    {
      "name": "Research",
      "count": 23,
      "category": "Science"
    }
  ]
}
```

---

## Template Management

### List Templates

**GET** `/api/research/templates`

Get all available research article templates.

**Response**:
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Standard Research",
      "description": "Default research article format",
      "isDefault": true,
      "structure": { /* template structure */ }
    }
  ]
}
```

---

### Get Default Template

**GET** `/api/research/templates/default`

Get the default template.

**Response**:
```json
{
  "template": {
    "id": "uuid",
    "name": "Standard Research",
    "structure": { /* template structure */ }
  }
}
```

---

### Get Template by ID

**GET** `/api/research/templates/:id`

Get a specific template.

**Path Parameters**:
- `id` (uuid) - Template ID

**Response**:
```json
{
  "template": { /* template object */ }
}
```

---

### Create Template

**POST** `/api/research/templates`

Create a new article template.

**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "structure": { /* template structure */ },
  "isDefault": "boolean (default: false)"
}
```

**Response**:
```json
{
  "success": true,
  "template": { /* created template */ }
}
```

---

### Update Template

**PUT** `/api/research/templates/:id`

Update an existing template.

**Path Parameters**:
- `id` (uuid) - Template ID

**Request Body**: Same as Create Template

**Response**:
```json
{
  "success": true,
  "template": { /* updated template */ }
}
```

---

## Prompt Management

### Get Prompt History

**GET** `/api/research/prompts/history`

Retrieve history of all prompts used.

**Query Parameters**:
- `limit` (number, default: 50)
- `offset` (number, default: 0)

**Response**:
```json
{
  "prompts": [
    {
      "id": "uuid",
      "content": "Prompt text...",
      "usedAt": "2026-02-01T12:00:00.000Z",
      "resultId": "article-uuid",
      "success": true
    }
  ],
  "total": 100
}
```

---

### Get Prompt Statistics

**GET** `/api/research/prompts/stats`

Get aggregate statistics about prompt usage.

**Response**:
```json
{
  "totalPrompts": 500,
  "successRate": 0.95,
  "averageTokens": 1200,
  "mostUsedTemplate": "Standard Research",
  "dateRange": {
    "start": "2026-01-01T00:00:00.000Z",
    "end": "2026-02-01T00:00:00.000Z"
  }
}
```

---

### Get Recent Prompts

**GET** `/api/research/prompts/recent`

Get most recently used prompts.

**Query Parameters**:
- `limit` (number, default: 10)

**Response**:
```json
{
  "prompts": [ /* array of prompt objects */ ]
}
```

---

### Get Prompt by ID

**GET** `/api/research/prompts/:id`

Retrieve a specific prompt.

**Path Parameters**:
- `id` (uuid) - Prompt ID

**Response**:
```json
{
  "prompt": {
    "id": "uuid",
    "content": "Full prompt text...",
    "createdAt": "2026-02-01T12:00:00.000Z",
    "metadata": { /* metadata */ }
  }
}
```

---

### Clone Prompt

**POST** `/api/research/prompts/:id/clone`

Create a copy of an existing prompt.

**Path Parameters**:
- `id` (uuid) - Prompt ID to clone

**Request Body** (optional):
```json
{
  "name": "string (optional)",
  "modifications": { /* optional changes */ }
}
```

**Response**:
```json
{
  "success": true,
  "prompt": { /* cloned prompt */ }
}
```

---

## Segment Options

### Create Segment Option

**POST** `/api/research/segment-options`

Create a new segment option for prompt building.

**Request Body**:
```json
{
  "name": "string",
  "type": "string",
  "options": ["array", "of", "options"],
  "default": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "segmentOption": { /* created segment option */ }
}
```

---

### Update Segment Option

**PUT** `/api/research/segment-options/:id`

Update an existing segment option.

**Path Parameters**:
- `id` (uuid) - Segment option ID

**Request Body**: Same as Create Segment Option

**Response**:
```json
{
  "success": true,
  "segmentOption": { /* updated segment option */ }
}
```

---

## Circle Y Integration

Circle Y endpoints are **OPTIONAL** - they only work if Circle Y database is configured.

All Circle Y endpoints are mounted under `/api/circley` (note: not under `/api/research`)

### Get Circle Y Configuration

**GET** `/api/circley/config`

Get current Circle Y integration configuration.

**Response**:
```json
{
  "enabled": false,
  "status": "not_configured",
  "availableDomains": []
}
```

OR (if configured):

```json
{
  "enabled": true,
  "status": "connected",
  "availableDomains": [
    {
      "key": "business",
      "name": "Business Directory",
      "queryCount": 5
    }
  ]
}
```

---

### Get Domain Queries

**GET** `/api/circley/domains/:domainKey/queries`

Get available queries for a specific Circle Y domain.

**Path Parameters**:
- `domainKey` (string) - Domain identifier (e.g., "business", "events")

**Response**:
```json
{
  "domain": "business",
  "queries": [
    {
      "id": "list_businesses",
      "name": "List All Businesses",
      "description": "Retrieve all businesses from directory",
      "parameters": []
    }
  ]
}
```

---

### Test Circle Y Query

**POST** `/api/circley/test-query`

Execute a test query against Circle Y database.

**Request Body**:
```json
{
  "domain": "string",
  "queryId": "string",
  "parameters": { /* query parameters */ }
}
```

**Response**:
```json
{
  "success": true,
  "data": [ /* query results */ ],
  "rowCount": 25,
  "executionTime": "150ms"
}
```

---

## Admin Endpoints

### Regenerate All Articles

**POST** `/api/admin/regenerate-articles`

Batch regenerate all articles (WARNING: resource intensive).

**Request Body** (optional):
```json
{
  "batchSize": "number (default: 10)",
  "delayBetween": "number (ms, default: 1000)"
}
```

**Response**:
```json
{
  "success": true,
  "jobId": "uuid",
  "estimatedTime": "30 minutes",
  "articlesQueued": 100
}
```

---

## Debug Endpoints

### Get Research Articles Schema

**GET** `/api/debug/schema/research_articles`

Get the current database schema for research_articles table.

**Response**:
```json
{
  "tableName": "research_articles",
  "columns": [
    {
      "name": "id",
      "type": "uuid",
      "nullable": false,
      "default": "gen_random_uuid()"
    },
    {
      "name": "title",
      "type": "text",
      "nullable": false
    }
  ]
}
```

---

### Apply Migration

**POST** `/api/debug/schema/apply-migration`

Apply a database migration (use with caution).

**Request Body**:
```json
{
  "migrationId": "string",
  "sql": "string (SQL to execute)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Migration applied successfully",
  "affectedRows": 0
}
```

---

## Testing Endpoints

### Test Grok

**GET** `/api/research/test-grok`

Test Grok LLM integration.

**Response**:
```json
{
  "success": true,
  "message": "Grok is working",
  "provider": "grok"
}
```

---

### Test GPT-5

**GET** `/api/research/test-gpt5`

Test GPT-5 integration (if available).

**Response**:
```json
{
  "success": true,
  "message": "GPT-5 is working",
  "provider": "openai"
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

### Standard Error Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE (optional)",
  "details": { /* optional additional details */ }
}
```

### HTTP Status Codes

| Status Code | Meaning | Common Scenarios |
|-------------|---------|------------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Authentication required (future) |
| 403 | Forbidden | Insufficient permissions (future) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `DATABASE_ERROR` | Database operation failed |
| `LLM_ERROR` | LLM provider error |
| `CIRCLEY_ERROR` | Circle Y integration error |
| `RATE_LIMIT_EXCEEDED` | Too many requests (if implemented) |

---

## Rate Limiting

**Current Status**: No rate limiting implemented.

**Future**: Rate limiting may be added for:
- `/api/research/generate` - Expensive LLM operations
- `/api/research/upload` - File upload bandwidth
- All endpoints - General API protection

---

## Pagination

Endpoints that support pagination use consistent query parameters:

**Query Parameters**:
- `limit` (number) - Items per page (default: 50, max: 100)
- `offset` (number) - Number of items to skip (default: 0)

**Response Fields**:
- `total` (number) - Total items available
- `hasMore` (boolean) - Whether more items exist
- `limit` (number) - Limit used for this request
- `offset` (number) - Offset used for this request

**Example**:
```
GET /api/research/articles?limit=25&offset=50

Response:
{
  "articles": [...],
  "total": 200,
  "hasMore": true,
  "limit": 25,
  "offset": 50
}
```

---

## Versioning

**Current Version**: v1 (implicit, no version prefix)

**Future**: API versioning may be added as `/api/v2/...`

---

## CORS Configuration

**Development**:
- Allowed origins: `http://localhost:3000`, `http://localhost:3001`

**Production**:
- Allowed origins: `https://kaiville-railway-01.up.railway.app`, Railway public domain
- Credentials: Enabled

---

## WebSocket Support

**Current Status**: Not implemented

**Future**: WebSocket endpoints may be added for:
- Real-time article generation progress
- Live collaboration on articles
- Server-sent events for notifications

---

## Data Formats

### Dates

All dates are in ISO 8601 format (UTC):
```
"2026-02-01T12:00:00.000Z"
```

### Content

Article content is stored and returned as **Markdown** format.

### IDs

All resource IDs are UUIDs (v4):
```
"550e8400-e29b-41d4-a716-446655440000"
```

---

## Additional Resources

- **Deployment Guide**: `docs/RAILWAY_DEPLOYMENT_GUIDE.md`
- **Database Setup**: `docs/SUPABASE_SETUP_GUIDE.md`
- **Circle Y Integration**: `docs/CIRCLE_Y_INTEGRATION_DESIGN.md`
- **AI Agent Guide**: `AI_AGENT_README.md`

---

**Last Updated**: 2026-02-01
**API Version**: 1.0 (implicit)
**Maintained By**: KaivilleMap Development Team
