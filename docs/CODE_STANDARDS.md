# Code Standards and Best Practices

**KaivilleMap Development Guidelines**

This document outlines coding conventions, file size guidelines, and best practices for maintaining code quality in the KaivilleMap project.

---

## Table of Contents

1. [Component Size Guidelines](#component-size-guidelines)
2. [Naming Conventions](#naming-conventions)
3. [File Organization](#file-organization)
4. [Code Style](#code-style)
5. [TypeScript Guidelines](#typescript-guidelines)
6. [React Best Practices](#react-best-practices)
7. [API Design Patterns](#api-design-patterns)
8. [Database Conventions](#database-conventions)
9. [Testing Standards](#testing-standards)
10. [Performance Guidelines](#performance-guidelines)

---

## Component Size Guidelines

### Recommended File Sizes

| File Type | Small | Medium | Large | Too Large | Action Required |
|-----------|-------|--------|-------|-----------|-----------------|
| React Component | < 150 | 150-400 | 400-800 | > 800 | Split into smaller components |
| Service Module | < 200 | 200-400 | 400-600 | > 600 | Refactor into multiple services |
| Custom Hook | < 100 | 100-200 | 200-300 | > 300 | Extract logic to separate hooks |
| Route Handler | < 150 | 150-300 | 300-500 | > 500 | Split into multiple endpoints |
| Config File | < 100 | 100-200 | 200-300 | > 300 | Modularize configuration |
| Utility Module | < 150 | 150-250 | 250-400 | > 400 | Split into focused utilities |

### Lines of Code (LOC) Targets

**General Rules**:
- **Ideal**: Functions < 50 lines, files < 300 lines
- **Acceptable**: Functions < 100 lines, files < 600 lines
- **Needs Refactoring**: Functions > 100 lines, files > 800 lines

**Why These Limits?**
- **Readability**: Easier to understand smaller, focused components
- **Maintainability**: Simpler to test and modify
- **AI-Friendly**: LLMs process smaller files more effectively
- **Code Review**: Faster reviews with smaller changesets

---

### Current Large Files Requiring Attention

**Frontend (React)**:
```
client/src/pages/CityHallPage.tsx           ~800+ lines   → Should split
client/src/pages/KNNFeedPage.tsx            ~800+ lines   → Should split
client/src/pages/ResearchCenter.tsx         ~600  lines   → Consider splitting
```

**Refactoring Priority**:
1. **High Priority**: Files > 800 lines
2. **Medium Priority**: Files 600-800 lines
3. **Low Priority**: Files 400-600 lines (monitor for growth)

---

### How to Refactor Large Components

#### Strategy 1: Extract Sections into Subcomponents

**Before** (800 lines):
```tsx
// CityHallPage.tsx
export function CityHallPage() {
  return (
    <div>
      {/* Header section - 150 lines */}
      <header>...</header>

      {/* Navigation - 200 lines */}
      <nav>...</nav>

      {/* Content sections - 400 lines */}
      <main>...</main>

      {/* Footer - 50 lines */}
      <footer>...</footer>
    </div>
  );
}
```

**After** (200 lines + smaller components):
```tsx
// CityHallPage.tsx (200 lines)
import { CityHallHeader } from './components/CityHallHeader';
import { CityHallNav } from './components/CityHallNav';
import { CityHallContent } from './components/CityHallContent';
import { CityHallFooter } from './components/CityHallFooter';

export function CityHallPage() {
  return (
    <div>
      <CityHallHeader />
      <CityHallNav />
      <CityHallContent />
      <CityHallFooter />
    </div>
  );
}

// components/CityHallHeader.tsx (150 lines)
// components/CityHallNav.tsx (200 lines)
// components/CityHallContent.tsx (400 lines)
// components/CityHallFooter.tsx (50 lines)
```

---

#### Strategy 2: Extract Business Logic to Hooks

**Before**:
```tsx
export function ArticlePage() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 50+ lines of data fetching logic
  }, []);

  const handleUpdate = () => {
    // 30+ lines of update logic
  };

  const handleDelete = () => {
    // 20+ lines of delete logic
  };

  // 200+ lines of JSX
  return <div>...</div>;
}
```

**After**:
```tsx
// ArticlePage.tsx (150 lines)
export function ArticlePage() {
  const { article, loading, error, updateArticle, deleteArticle } = useArticleManager();

  // Simplified JSX (200 lines)
  return <div>...</div>;
}

// hooks/useArticleManager.ts (100 lines)
export function useArticleManager() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // All data fetching and update logic here

  return { article, loading, error, updateArticle, deleteArticle };
}
```

---

#### Strategy 3: Extract Utilities to Services

**Before**:
```tsx
export function ResearchPage() {
  // 100+ lines of formatting logic
  const formatArticle = (rawData) => {
    // Complex formatting
  };

  // 100+ lines of validation logic
  const validateArticle = (data) => {
    // Complex validation
  };

  // JSX
  return <div>...</div>;
}
```

**After**:
```tsx
// ResearchPage.tsx (200 lines)
import { formatArticle, validateArticle } from '../services/articleService';

export function ResearchPage() {
  // Use imported services

  return <div>...</div>;
}

// services/articleService.ts (200 lines)
export function formatArticle(rawData) {
  // Formatting logic
}

export function validateArticle(data) {
  // Validation logic
}
```

---

## Naming Conventions

### File Naming

| Type | Convention | Example | Notes |
|------|-----------|---------|-------|
| React Components | PascalCase.tsx | `HomePage.tsx`, `ArticleCard.tsx` | Match component name |
| React Hooks | useCamelCase.ts | `useArticleEdit.ts`, `useAuth.ts` | Prefix with `use` |
| Services | camelCase.ts | `articleService.ts`, `apiClient.ts` | Descriptive, lowercase |
| Utilities | camelCase.ts | `formatDate.ts`, `validation.ts` | Action or purpose |
| Types/Interfaces | PascalCase.ts | `Article.ts`, `User.ts` | Singular noun |
| Config Files | lowercase.js | `llm.js`, `database.js` | Short, descriptive |
| Routes | lowercase.js | `research.js`, `admin.js` | Domain-based |
| SQL Migrations | NNN_description.sql | `001_initial_schema.sql` | Sequential numbering |
| Documentation | UPPERCASE.md | `README.md`, `API_DOCS.md` | Highly visible |

### Variable Naming

| Type | Convention | Example |
|------|-----------|---------|
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Variables | camelCase | `articleCount`, `isLoading` |
| Functions | camelCase | `fetchArticles`, `handleSubmit` |
| Classes | PascalCase | `LLMConfig`, `ArticleService` |
| Private Methods | _prefixCamelCase | `_validateInput`, `_formatData` |
| React Components | PascalCase | `ArticlePage`, `Button` |
| Props Interfaces | PascalCase + Props | `ArticleCardProps`, `ButtonProps` |
| Booleans | is/has/should prefix | `isLoading`, `hasError`, `shouldUpdate` |

### Database Naming

| Type | Convention | Example |
|------|-----------|---------|
| Tables | snake_case (plural) | `research_articles`, `content_blocks` |
| Columns | snake_case | `created_at`, `primary_category` |
| Foreign Keys | table_id | `article_id`, `user_id` |
| Indexes | idx_table_column | `idx_articles_slug`, `idx_tags_name` |
| Constraints | table_column_constraint | `articles_slug_unique` |

---

## File Organization

### Directory Structure Principles

1. **Feature-Based Grouping**: Organize by domain/feature, not by file type
2. **Proximity**: Related files should be close together
3. **Depth Limit**: Maximum 3-4 levels of nesting
4. **Clear Naming**: Directory names should be self-explanatory

### Good Example:
```
components/
├── research/
│   ├── ArticleCard.tsx
│   ├── ArticleList.tsx
│   └── ArticleFilters.tsx
├── cms/
│   ├── ContentEditor.tsx
│   └── MediaUploader.tsx
└── ui/
    ├── Button.tsx
    └── Card.tsx
```

### Bad Example:
```
components/
├── cards/
│   ├── ArticleCard.tsx
│   └── UserCard.tsx
├── lists/
│   ├── ArticleList.tsx
│   └── UserList.tsx
└── filters/
    ├── ArticleFilters.tsx
    └── UserFilters.tsx
```

---

## Code Style

### TypeScript/JavaScript

**Formatting**:
- Indentation: 2 spaces (not tabs)
- Line length: 100 characters (soft limit)
- Semicolons: Required
- Quotes: Single quotes for strings (unless JSX attributes)
- Trailing commas: Yes (multiline arrays/objects)

**Example**:
```typescript
// ✅ Good
const fetchArticles = async (filters: ArticleFilters): Promise<Article[]> => {
  const response = await api.get('/articles', { params: filters });
  return response.data.articles;
};

// ❌ Bad
function fetchArticles(filters){
return api.get('/articles',{params:filters}).then(r=>r.data.articles)}
```

---

### React Component Structure

**Recommended Order**:
1. Imports
2. Type definitions/interfaces
3. Component definition
4. Event handlers
5. useEffect hooks
6. Render helpers
7. JSX return

**Example**:
```tsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

// 2. Type definitions
interface ArticlePageProps {
  slug: string;
}

// 3. Component
export function ArticlePage({ slug }: ArticlePageProps) {
  // State
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  // 4. Event handlers
  const handleEdit = () => {
    // ...
  };

  // 5. Effects
  useEffect(() => {
    fetchArticle(slug);
  }, [slug]);

  // 6. Render helpers
  const renderContent = () => {
    // ...
  };

  // 7. JSX
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

---

## TypeScript Guidelines

### Use Explicit Types

**Do**:
```typescript
interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

function updateArticle(article: Article): Promise<Article> {
  // ...
}
```

**Don't**:
```typescript
function updateArticle(article: any): any {
  // ...
}
```

### Avoid `any` Type

**Prefer**:
- `unknown` for truly unknown types
- Specific unions: `string | number`
- Generic types: `Array<T>`

**When `any` is OK**:
- Third-party libraries without types
- Temporary scaffolding (add TODO comment)

---

## React Best Practices

### Component Composition

**Prefer Composition Over Props**:
```tsx
// ✅ Good
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Avoid
<Card title="Title" content="Content" hasHeader hasFooter />
```

### Custom Hooks for Logic Reuse

Extract reusable logic into custom hooks:

```tsx
// hooks/useArticles.ts
export function useArticles(filters: Filters) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles(filters).then(setArticles);
  }, [filters]);

  return { articles, loading };
}

// Usage in component
const { articles, loading } = useArticles({ category: 'tech' });
```

---

## API Design Patterns

### RESTful Conventions

| Method | Action | Example |
|--------|--------|---------|
| GET | Retrieve | `GET /api/articles` |
| POST | Create | `POST /api/articles` |
| PUT | Update (full) | `PUT /api/articles/123` |
| PATCH | Update (partial) | `PATCH /api/articles/123` |
| DELETE | Delete | `DELETE /api/articles/123` |

### Response Consistency

All responses should follow a consistent structure:

**Success**:
```json
{
  "success": true,
  "data": { /* payload */ }
}
```

**Error**:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Database Conventions

### Table Design

- Use singular nouns for entity names, plural for tables
- Add `created_at` and `updated_at` to all tables
- Use UUIDs for primary keys
- Use foreign key constraints

**Example**:
```sql
CREATE TABLE research_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Testing Standards

### Test File Location

- Unit tests: Same directory as source file with `.test.ts` suffix
- Integration tests: `/tests/integration/`
- E2E tests: `/tests/e2e/`

### Test Naming

```typescript
describe('ArticleService', () => {
  describe('updateArticle', () => {
    it('should update article title', async () => {
      // Test
    });

    it('should throw error when article not found', async () => {
      // Test
    });
  });
});
```

---

## Performance Guidelines

### Frontend Optimization

1. **Lazy Loading**: Use `React.lazy()` for route-based code splitting
2. **Memoization**: Use `useMemo()` for expensive calculations
3. **Virtualization**: Use virtual scrolling for long lists
4. **Image Optimization**: Use appropriate formats (WebP, AVIF)

### Backend Optimization

1. **Database Indexing**: Index frequently queried columns
2. **Caching**: Cache expensive LLM results
3. **Pagination**: Always paginate list endpoints
4. **Query Optimization**: Use database query analysis tools

---

## Code Review Checklist

Before submitting code for review:

- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] TypeScript errors resolved
- [ ] Files under recommended size limits
- [ ] Proper error handling
- [ ] Consistent naming conventions
- [ ] Tests added/updated
- [ ] Documentation updated

---

## Common Anti-Patterns to Avoid

### ❌ God Components

Components that do too much:
```tsx
// 1000+ lines handling routing, state, API calls, business logic, and UI
```

**Solution**: Split into smaller, focused components

---

### ❌ Prop Drilling

Passing props through many layers:
```tsx
<App user={user}>
  <Layout user={user}>
    <Page user={user}>
      <Component user={user} />
```

**Solution**: Use Context API or state management

---

### ❌ Inline Styles

```tsx
<div style={{ margin: '10px', padding: '20px' }}>
```

**Solution**: Use Tailwind classes or CSS modules

---

## Refactoring Guidelines

### When to Refactor

✅ **Do Refactor**:
- File exceeds size guidelines
- Function has > 3 levels of nesting
- Code is duplicated in 3+ places
- Tests are difficult to write
- Adding features is painful

❌ **Don't Refactor**:
- "Just because" without clear benefit
- Right before a deadline
- Without tests to verify behavior
- Other people's code without understanding

### Refactoring Safety

1. **Write tests first** (if they don't exist)
2. **Refactor in small steps**
3. **Run tests after each change**
4. **Commit frequently**
5. **Get code review**

---

## Documentation Requirements

### When to Add Comments

**Do Comment**:
- Complex algorithms
- Non-obvious business logic
- Workarounds for bugs
- Performance optimizations
- Public API functions (JSDoc)

**Don't Comment**:
- Obvious code (`i++; // increment i`)
- What code does (code should be self-explanatory)
- Outdated explanations

### JSDoc for Public APIs

```typescript
/**
 * Fetches research articles with optional filtering
 *
 * @param filters - Query filters for articles
 * @param filters.category - Filter by category
 * @param filters.tag - Filter by tag
 * @returns Promise resolving to array of articles
 * @throws {Error} If API request fails
 *
 * @example
 * const articles = await fetchArticles({ category: 'tech' });
 */
export async function fetchArticles(filters: ArticleFilters): Promise<Article[]> {
  // ...
}
```

---

## Version Control Best Practices

### Commit Messages

Format: `type(scope): description`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting changes
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Build/tooling changes

**Examples**:
```
feat(research): add article generation endpoint
fix(auth): resolve token expiration bug
docs(api): update endpoint documentation
refactor(components): split CityHallPage into subcomponents
```

---

## AI Agent Guidelines

For AI agents working with this codebase:

1. **Check file size** before adding code to existing files
2. **Prefer composition** over making files larger
3. **Extract to new files** when approaching size limits
4. **Follow naming conventions** exactly
5. **Update tests** when refactoring
6. **Ask before** major refactorings

---

**Last Updated**: 2026-02-01
**Version**: 1.0
**Maintained By**: KaivilleMap Development Team
