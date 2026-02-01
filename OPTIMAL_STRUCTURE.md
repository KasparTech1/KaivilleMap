# Optimal File Structure for AI Agents
## KaivilleMap Recommended Organization

This document outlines the ideal file structure after implementing cleanup recommendations.

---

## 🎯 Core Principles for AI-Friendly Codebases

1. **Single Source of Truth**: One database, one entry point, one implementation
2. **Clear Boundaries**: Separate generated from custom, active from archived
3. **Explicit Over Implicit**: Document intentions, mark special cases
4. **Fail Loudly**: Incomplete features should throw errors, not silently fail
5. **Contextual Proximity**: Related files grouped together

---

## 📁 Recommended Structure

```
KaivilleMap/
│
├── 📄 README.md                        # ⚠️ NEEDS UPDATE: Add quick start, architecture overview
├── 📄 AI_AGENT_README.md               # ✅ NEW: Primary AI agent guide
├── 📄 CLEANUP_PLAN.md                  # ✅ NEW: Cleanup roadmap
├── 📄 OPTIMAL_STRUCTURE.md             # ✅ NEW: This file
├── 📄 .env.example                     # ⚠️ NEEDS FIX: Remove real secrets
├── 📄 .gitignore
├── 📄 package.json
├── 📄 docker-compose.yml
├── 📄 Dockerfile
│
├── 📁 docs/                            # All documentation centralized
│   ├── 📄 API_DOCUMENTATION.md         # 🔲 TODO: Create endpoint docs
│   ├── 📄 CODE_STANDARDS.md            # 🔲 TODO: Create standards guide
│   ├── 📄 TROUBLESHOOTING.md           # 🔲 TODO: Create troubleshooting guide
│   ├── 📄 SUPABASE_SETUP_GUIDE.md      # ✅ Exists
│   ├── 📄 RAILWAY_DEPLOYMENT_GUIDE.md  # ✅ Exists
│   ├── 📄 CIRCLE_Y_INTEGRATION_DESIGN.md  # ⚠️ Update with "optional" status
│   └── 📄 RESEARCH_PROMPT_BUILDER_COMPLETE.md  # ✅ Exists
│
├── 📁 client/                          # Frontend (React + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 api/                    # API client layer
│   │   │   ├── 📄 api.ts             # Base Axios config
│   │   │   ├── 📄 buildings.ts        # ⚠️ ADD HEADER: "MOCK DATA - INTENTIONAL"
│   │   │   └── 📄 research.ts         # Research API calls
│   │   │
│   │   ├── 📁 components/             # Reusable components
│   │   │   ├── 📁 ui/                 # ⚠️ ADD README: "AUTO-GENERATED - DO NOT EDIT"
│   │   │   │   ├── 📄 README.md       # 🔲 TODO: Create warning about Shadcn
│   │   │   │   ├── 📄 button.tsx      # Shadcn component
│   │   │   │   ├── 📄 card.tsx        # Shadcn component
│   │   │   │   └── 📄 ...             # 50+ Shadcn components
│   │   │   │
│   │   │   ├── 📁 cms/                # CMS-specific components
│   │   │   ├── 📁 news/               # News-specific components
│   │   │   ├── 📁 research/           # Research-specific components
│   │   │   └── 📄 *.tsx               # Shared components
│   │   │
│   │   ├── 📁 pages/                  # Route-level components
│   │   │   ├── 📁 admin/              # Admin pages
│   │   │   ├── 📄 HomePage.tsx        # Landing page
│   │   │   ├── 📄 SiteLogin.tsx       # ⚠️ ADD COMMENT: Password is intentional
│   │   │   └── 📄 *.tsx               # Other pages
│   │   │
│   │   ├── 📁 services/               # Business logic
│   │   │   ├── 📄 articleService.ts   # Article CRUD
│   │   │   └── 📄 tagService.ts       # Tag management
│   │   │
│   │   ├── 📁 hooks/                  # Custom React hooks
│   │   │   ├── 📄 useArticleEdit.ts
│   │   │   ├── 📄 useCMSContent.ts
│   │   │   └── 📄 useToast.ts
│   │   │
│   │   ├── 📁 config/                 # Configuration
│   │   │   ├── 📄 supabase.ts         # Supabase client
│   │   │   └── 📄 assetUrls.ts        # Asset URLs
│   │   │
│   │   ├── 📁 types/                  # TypeScript types
│   │   ├── 📁 styles/                 # Global CSS
│   │   │
│   │   ├── 📁 _archive/               # ⚠️ RENAME: Add underscore prefix
│   │   │   ├── 📄 README.md           # 🔲 TODO: Create deprecation warning
│   │   │   └── 📄 *.tsx               # Deprecated components
│   │   │
│   │   ├── 📄 App.tsx                 # Main app with routing
│   │   └── 📄 main.tsx                # React entry point
│   │
│   ├── 📁 public/                     # Static assets
│   ├── 📁 dist/                       # Build output (gitignored)
│   ├── 📄 vite.config.ts              # ⚠️ ADD COMMENT: Document proxy
│   ├── 📄 tsconfig.json               # TypeScript config
│   ├── 📄 tailwind.config.js          # Tailwind config
│   └── 📄 package.json                # Frontend dependencies
│
├── 📁 server/                          # Backend (Node.js + Express)
│   ├── 📁 services/                   # Business logic
│   │   ├── 📁 research/               # Research domain
│   │   │   ├── 📄 controllers.js      # ⚠️ ADD JSDOC: Document functions
│   │   │   ├── 📄 supabaseClient.js   # Primary DB client
│   │   │   ├── 📄 llmFormatter.js     # LLM output formatting
│   │   │   ├── 📄 webSearchService.js # Web search
│   │   │   ├── 📄 circleyIntegration.js  # ⚠️ ADD GUARDS: Optional feature
│   │   │   └── 📄 ...                 # Other services
│   │   │
│   │   └── 📄 llmService.js           # ⚠️ ADD JSDOC: Document providers
│   │
│   ├── 📁 routes/                     # Express routes
│   │   ├── 📄 research.js             # Research endpoints
│   │   ├── 📄 research-enhanced.js    # Enhanced endpoints
│   │   ├── 📄 admin.js                # Admin endpoints
│   │   └── 📄 index.js                # Route aggregation
│   │
│   ├── 📁 config/                     # Server configuration
│   │   ├── 📄 llm.js                  # ⚠️ FIX: Remove incomplete providers or add guards
│   │   └── 📄 database.js             # ⚠️ DELETE or rename to .deprecated
│   │
│   ├── 📁 middleware/                 # Express middleware
│   │   └── 📄 errorHandler.js         # 🔲 TODO: Create standardized error handler
│   │
│   ├── 📁 migrations/                 # Database migrations
│   │   ├── 📁 archive/                # 🔲 TODO: Move old versions here
│   │   └── 📄 *.sql                   # Active migrations
│   │
│   ├── 📄 server.js                   # ⚠️ ADD COMMENT: Main entry point
│   ├── 📄 index.js                    # ⚠️ ADD COMMENT: App configuration
│   └── 📄 package.json                # Backend dependencies
│
├── 📁 supabase/                        # Database utilities
│   ├── 📁 migrations/                 # SQL migrations
│   │   ├── 📁 archive/                # 🔲 TODO: Create for old migrations
│   │   ├── 📄 001_initial_schema.sql
│   │   ├── 📄 002_add_rls_policies.sql
│   │   └── 📄 ...
│   │
│   ├── 📄 CMS_README.md               # ✅ Exists
│   ├── 📄 setupSupabase.js            # Setup script
│   └── 📄 ...                         # Utility scripts
│
├── 📁 tests/                           # Test suites
│   ├── 📁 database/                   # Database tests
│   ├── 📁 components/                 # Component tests
│   ├── 📄 testRunner.js               # ⚠️ LINK to npm test
│   └── 📄 preDeploymentTests.js       # Pre-deploy checks
│
└── 📁 scripts/                         # Build/deploy scripts
    └── 📄 deploy-dgx.sh
```

---

## 🎨 File Naming Conventions

### Consistency Rules

| Type | Convention | Example | Rationale |
|------|-----------|---------|-----------|
| React Components | PascalCase.tsx | `HomePage.tsx` | Matches component name |
| React Hooks | useCamelCase.ts | `useArticleEdit.ts` | Follows React convention |
| Services/Utils | camelCase.ts/js | `articleService.ts` | Standard JavaScript |
| Types | PascalCase.ts | `Article.ts` | Matches type name |
| Config | lowercase.js | `llm.js`, `database.js` | Node.js convention |
| SQL Migrations | NNN_description.sql | `001_initial_schema.sql` | Sequential ordering |
| Documentation | UPPERCASE.md | `README.md`, `API_DOCUMENTATION.md` | Visibility |
| Routes | lowercase.js | `research.js`, `admin.js` | Express convention |

### Special Prefixes

- `_archive/` - Deprecated code (underscore for visual distinction)
- `_generated/` - Auto-generated files (if applicable)
- `.example` - Template files (e.g., `.env.example`)
- `.deprecated` - Marked for deletion (e.g., `database.js.deprecated`)

---

## 📝 Documentation Structure

### Required Files at Root Level

1. **README.md** - Project overview, quick start
2. **AI_AGENT_README.md** - AI-specific context (critical warnings, architecture)
3. **CLEANUP_PLAN.md** - Roadmap for improvements
4. **.env.example** - Environment variable template (NO REAL SECRETS)

### Required Files in `/docs/`

1. **API_DOCUMENTATION.md** - All endpoint specs
2. **CODE_STANDARDS.md** - Coding conventions, size guidelines
3. **TROUBLESHOOTING.md** - Common issues and solutions
4. **DEPLOYMENT_GUIDE.md** - Deployment instructions (exists as RAILWAY_DEPLOYMENT_GUIDE.md)
5. **DATABASE_SCHEMA.md** - Database structure (consider creating)

### Domain-Specific Documentation

- `/supabase/CMS_README.md` - CMS usage (exists ✅)
- `/client/src/components/ui/README.md` - Shadcn warning (TODO)
- `/client/src/_archive/README.md` - Deprecation notice (TODO)
- `/server/config/README.md` - Configuration guide (consider creating)

---

## 🔒 Security Best Practices

### Environment Variables

**Current Problem**:
```bash
# .env.example (CURRENT - DANGEROUS)
OPENAI_API_KEY=sk-proj-real-key-here  # ❌ Real secret
SUPABASE_URL=https://real-project.supabase.co  # ❌ Real URL
```

**Recommended**:
```bash
# .env.example (FIXED - SAFE)
# REQUIRED: OpenAI API key for LLM generation
OPENAI_API_KEY=sk-proj-your_openai_key_here

# REQUIRED: Supabase connection details
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OPTIONAL: Circle Y integration (leave blank to disable)
CIRCLEY_HOST=
CIRCLEY_PORT=
```

### Secrets Management Checklist

- [ ] No real API keys in `.env.example`
- [ ] No hardcoded secrets in source code
- [ ] `.env` in `.gitignore` (already done ✅)
- [ ] Secrets documented in separate secure location
- [ ] CI/CD uses environment variable injection

---

## 🧩 Component Organization Patterns

### Pages vs Components

**Pages** (`client/src/pages/`):
- Route-level components
- Connected to React Router
- Can be large (300-800 lines acceptable)
- Example: `HomePage.tsx`, `ArticlePage.tsx`

**Components** (`client/src/components/`):
- Reusable building blocks
- Should be small (< 200 lines ideal)
- Domain-organized (`cms/`, `news/`, `research/`)
- Example: `ArticleCard.tsx`, `NewsFilter.tsx`

### Services vs Hooks

**Services** (`client/src/services/`):
- Pure business logic
- No React dependencies
- Testable independently
- Example: `articleService.ts` (CRUD operations)

**Hooks** (`client/src/hooks/`):
- React-specific state management
- Can use other hooks
- Return stateful values
- Example: `useArticleEdit.ts` (form state + validation)

---

## 🗄️ Database Organization

### Current State (Needs Improvement)

```
Issues:
❌ MongoDB configured but not used
❌ Migrations in multiple locations
❌ Duplicate migration versions (_MANUAL.sql)
```

### Recommended State

```
✅ Single database: Supabase (PostgreSQL)
✅ Migrations in one location: supabase/migrations/
✅ Clear versioning: 001_, 002_, 003_
✅ Archive for old versions: supabase/migrations/archive/
```

### Migration Naming Convention

```
Pattern: NNN_descriptive_action.sql

Examples:
001_initial_schema.sql              ✅ Good
002_add_rls_policies.sql            ✅ Good
003_create_articles_table.sql       ✅ Good
007_add_article_fields.sql          ✅ Good (canonical version)
007_add_article_fields_MANUAL.sql   ❌ Move to archive/
add_new_column.sql                  ❌ No version number
```

---

## 🎯 Code Organization Anti-Patterns to Avoid

### ❌ Anti-Pattern #1: Archive Files in Active Directory

**Problem**:
```
client/src/archive/
  └── OldComponent.tsx  # AI might import this by mistake
```

**Solution**:
```
client/src/_archive/      # Underscore prefix
  ├── README.md          # Clear warning
  └── OldComponent.tsx
```

---

### ❌ Anti-Pattern #2: Auto-Generated Files Without Warnings

**Problem**:
```
client/src/components/ui/
  └── button.tsx  # AI modifies this, changes get overwritten
```

**Solution**:
```
client/src/components/ui/
  ├── README.md    # "DO NOT EDIT - Auto-generated by Shadcn"
  └── button.tsx   # Header comment: "// Auto-generated - see README"
```

---

### ❌ Anti-Pattern #3: Mock Data Disguised as API

**Problem**:
```typescript
// api/buildings.ts
export const buildings = [...]; // Looks like it fetches from server
```

**Solution**:
```typescript
/**
 * STATIC BUILDING DATA (Not from API)
 * This is intentionally hardcoded...
 */
export const buildings = [...];
```

---

### ❌ Anti-Pattern #4: Silent Feature Flags

**Problem**:
```javascript
// Circle Y silently disabled if env vars missing
if (process.env.CIRCLEY_HOST) {
  // Works sometimes, fails silently other times
}
```

**Solution**:
```javascript
/**
 * Circle Y Integration (OPTIONAL)
 * Returns empty results if not configured
 */
function getCircleYData() {
  if (!isCircleYConfigured()) {
    logger.info('Circle Y not configured - skipping');
    return { data: [], source: 'unavailable' };
  }
  // ...
}
```

---

### ❌ Anti-Pattern #5: Incomplete Implementations Without Guards

**Problem**:
```javascript
// llm.js
case 'anthropic':
  // TODO: Implement
  return new AnthropicClient(); // Throws unclear error at runtime
```

**Solution**:
```javascript
case 'anthropic':
  throw new Error(
    'Anthropic provider not fully implemented. ' +
    'Use LLM_PROVIDER=openai instead. ' +
    'See server/config/llm.js for details.'
  );
```

---

## 📊 File Size Guidelines

### Recommended Limits

| File Type | Small | Medium | Large | Too Large | Action |
|-----------|-------|--------|-------|-----------|--------|
| Component | < 150 | 150-400 | 400-800 | > 800 | Split |
| Service | < 200 | 200-400 | 400-600 | > 600 | Refactor |
| Hook | < 100 | 100-200 | 200-300 | > 300 | Extract logic |
| Route | < 150 | 150-300 | 300-500 | > 500 | Split endpoints |
| Config | < 100 | 100-200 | 200-300 | > 300 | Modularize |

### Current Large Files Requiring Attention

```
client/src/pages/CityHallPage.tsx        ~800+ lines   → Should split
client/src/pages/KNNFeedPage.tsx         ~800+ lines   → Should split
```

**Refactoring Strategy**:
1. Extract sections into subcomponents
2. Move business logic to hooks
3. Extract utilities to services
4. Target: Main page < 400 lines

---

## 🚀 Quick Reference: Where Things Go

### "I want to add..."

| What | Where | Example |
|------|-------|---------|
| New page | `client/src/pages/` | `AboutPage.tsx` |
| Reusable component | `client/src/components/{domain}/` | `components/news/NewsCard.tsx` |
| Custom hook | `client/src/hooks/` | `useArticleFilter.ts` |
| Business logic | `client/src/services/` | `commentService.ts` |
| API endpoint | `server/routes/` | `routes/comments.js` |
| Backend service | `server/services/` | `services/emailService.js` |
| Database migration | `supabase/migrations/` | `010_add_comments.sql` |
| Documentation | `docs/` | `FEATURE_X_GUIDE.md` |
| Configuration | `server/config/` or `client/src/config/` | `config/email.js` |
| TypeScript types | `client/src/types/` | `types/Comment.ts` |

---

## ✅ AI Agent Onboarding Checklist

When a new AI agent (or developer) joins the project, they should:

1. [ ] Read `AI_AGENT_README.md` first
2. [ ] Review `CLEANUP_PLAN.md` to understand known issues
3. [ ] Check `docs/TROUBLESHOOTING.md` before debugging
4. [ ] Understand database is Supabase (NOT MongoDB)
5. [ ] Know not to edit files in `client/src/components/ui/`
6. [ ] Know `client/src/_archive/` is deprecated
7. [ ] Understand building data is mocked in `api/buildings.ts`
8. [ ] Check LLM provider is OpenAI (others incomplete)
9. [ ] Review `.env.example` for required variables
10. [ ] Know tests run with `npm test` (after fix)

---

## 🎯 Next Steps

1. **Implement Critical Fixes** (from CLEANUP_PLAN.md Phase 1)
2. **Update README.md** with quick start guide
3. **Create missing documentation** (API docs, troubleshooting)
4. **Refactor large components** (CityHallPage, KNNFeedPage)
5. **Add JSDoc to key functions**
6. **Consider TypeScript migration for server** (long-term)

---

## 📚 Related Documentation

- `AI_AGENT_README.md` - Primary AI agent guide
- `CLEANUP_PLAN.md` - Detailed cleanup roadmap
- `docs/CODE_STANDARDS.md` - TODO: Create comprehensive standards
- `docs/API_DOCUMENTATION.md` - TODO: Create API reference

---

**Last Updated**: 2026-02-01
**Maintained By**: Reference git commit messages for recent changes
