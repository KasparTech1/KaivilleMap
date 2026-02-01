# AI Agent Developer Guide for KaivilleMap

## 🤖 Critical Information for AI Agents

This guide contains essential context to prevent common mistakes when working with this codebase.

---

## ⚠️ CRITICAL WARNINGS

### 1. Database Architecture
- **PRIMARY DATABASE**: Supabase (PostgreSQL)
- **IGNORE**: MongoDB references in `server/server.js` - legacy code, not actively used
- **ACTION**: Always use `server/services/research/supabaseClient.js` for database operations
- **NEVER**: Create Mongoose schemas or MongoDB connections

### 2. Mock Data Pattern
- **FILE**: `client/src/api/buildings.ts`
- **STATUS**: Hardcoded mock data (intentional, not a bug)
- **REASON**: Building layout is static configuration
- **ACTION**: Modify this file directly for building changes, NOT database

### 3. Authentication
- **FILE**: `client/src/pages/SiteLogin.tsx`
- **PASSWORD**: Hardcoded as `'Bryan'` (line 14)
- **PURPOSE**: Simple site-wide password protection, NOT user authentication
- **ACTION**: This is intentional, not a security flaw

### 4. Auto-Generated Files (DO NOT EDIT)
- **LOCATION**: `client/src/components/ui/` (50+ files)
- **SOURCE**: Shadcn UI library
- **ACTION**: Never manually edit these. Use Shadcn CLI to update
- **REGENERATION**: `npx shadcn-ui@latest add <component-name>`

### 5. Archived Code
- **LOCATION**: `client/src/archive/`
- **STATUS**: Deprecated, kept for reference only
- **ACTION**: Never import from this folder. Use current implementations in `client/src/components/`

### 6. Environment Variables
- **REAL SECRETS**: `.env.example` contains actual API keys (not placeholders)
- **SECURITY**: Never commit `.env.example` changes with new secrets
- **STRUCTURE**: 60+ variables - see breakdown below

### 7. LLM Provider Configuration
- **FILE**: `server/config/llm.js`
- **COMPLETE**: OpenAI implementation only
- **INCOMPLETE**: Anthropic and Azure have TODO placeholders
- **ACTION**: Default to OpenAI provider unless completing other implementations

---

## 📁 Project Structure

```
KaivilleMap/
├── client/                     # React/TypeScript frontend
│   ├── src/
│   │   ├── api/               # API client layer
│   │   │   ├── buildings.ts   # ⚠️ MOCK DATA (hardcoded)
│   │   │   ├── research.ts    # Research API calls
│   │   │   └── api.ts         # Base Axios configuration
│   │   ├── components/
│   │   │   ├── ui/            # ⚠️ AUTO-GENERATED (Shadcn)
│   │   │   ├── cms/           # CMS editing components
│   │   │   ├── news/          # News filtering
│   │   │   └── research/      # Research components
│   │   ├── pages/             # Route-level components
│   │   │   └── admin/         # Admin pages
│   │   ├── services/          # Business logic
│   │   │   ├── articleService.ts
│   │   │   └── tagService.ts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── config/            # Frontend configuration
│   │   ├── types/             # TypeScript types
│   │   └── archive/           # ⚠️ DEPRECATED CODE
│   └── dist/                  # Build output (Vite)
│
├── server/                     # Node.js/Express backend
│   ├── services/
│   │   ├── research/          # Research article generation
│   │   │   ├── supabaseClient.js  # ⚠️ PRIMARY DB CLIENT
│   │   │   ├── controllers.js
│   │   │   ├── llmFormatter.js
│   │   │   └── [15+ service files]
│   │   └── llmService.js
│   ├── routes/                # Express routes
│   │   ├── research.js
│   │   ├── research-enhanced.js
│   │   └── admin.js
│   ├── config/
│   │   ├── llm.js             # ⚠️ LLM provider config (OpenAI only complete)
│   │   └── database.js        # ⚠️ IGNORE (MongoDB legacy)
│   ├── server.js              # Main entry point
│   └── index.js               # Express app setup
│
├── supabase/                   # ⚠️ PRIMARY DATABASE
│   ├── migrations/            # SQL schema migrations
│   └── [50+ utility scripts]
│
└── docs/                       # Technical documentation
```

---

## 🔧 Technology Stack

### Frontend
- **Framework**: React 18.3.1 + TypeScript
- **Build**: Vite 5.4.8 → outputs to `client/dist/`
- **Routing**: React Router v7
- **UI**: Shadcn UI + Tailwind CSS 3.4.15
- **Forms**: React Hook Form + Zod validation
- **Database Client**: @supabase/supabase-js
- **HTTP**: Axios

### Backend
- **Runtime**: Node.js 18 (JavaScript, NOT TypeScript)
- **Framework**: Express 4.18.2
- **Database**: Supabase (PostgreSQL)
- **LLM**: OpenAI SDK 4.104.0, Anthropic SDK 0.27.3
- **Auth**: express-session + bcrypt
- **Logging**: Pino

---

## 🚀 Running the Application

### Development
```bash
# Terminal 1 - Backend (runs on :3000)
npm run server

# Terminal 2 - Frontend (runs on :5173, proxies /api to :3000)
npm run dev
```

### Production Build
```bash
npm run build          # Builds both client and server
npm start              # Runs production server
```

### Docker
```bash
docker-compose up      # Full stack with environment
```

---

## 📦 Environment Variables Structure

### Required for Development
```bash
# Supabase (PRIMARY DATABASE)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# LLM Provider (OpenAI recommended)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key

# Optional: Anthropic (implementation incomplete)
ANTHROPIC_API_KEY=your-key

# Session
SESSION_SECRET=random-secret-string
```

### Optional Features
- Circle Y Database Integration (25+ variables)
- Azure OpenAI (not fully implemented)
- Web Search Service
- Cost Calculator

---

## 🧪 Testing

### Current State
- Test files exist in `/tests/` directory
- **NOT** integrated into `npm test` (says "no test specified")
- Pre-deployment tests available: `node tests/preDeploymentTests.js`

### Running Tests Manually
```bash
node tests/testRunner.js              # Main test suite
node tests/preDeploymentTests.js      # Pre-deploy checks
```

---

## 🗄️ Database Schema

### Primary Tables (Supabase)
- `articles` - CMS articles
- `research_articles` - AI-generated research articles
- `content_blocks` - CMS content blocks
- `research_generations` - Generation history and metadata

### Migrations
- **Location**: `supabase/migrations/` (11+ SQL files)
- **Numbering**: Ordered (001_, 002_, etc.)
- **Application**: Use Supabase CLI or `supabase/applyMissingMigration.cjs`

---

## 🎨 Styling Conventions

### Component Styling
- **Primary**: Tailwind CSS utility classes
- **Theming**: CSS variables in `client/src/styles/`
- **Dark Mode**: Supported via `next-themes`

### Common Patterns
```tsx
// Button variant pattern
<Button variant="default" size="lg" className="custom-class">

// Card layout pattern
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

## 🔍 Common Tasks for AI Agents

### Adding a New Page
1. Create component in `client/src/pages/YourPage.tsx`
2. Add route in `client/src/App.tsx`
3. Follow naming: `YourPage` component, file is `YourPage.tsx`

### Adding a New API Endpoint
1. Create route in `server/routes/yourRoute.js`
2. Add business logic in `server/services/yourService.js`
3. Register route in `server/routes/index.js`
4. Use Supabase client from `server/services/research/supabaseClient.js`

### Modifying Database Schema
1. Create migration in `supabase/migrations/XXX_description.sql`
2. Number sequentially
3. Test against Supabase (not local PostgreSQL)
4. Apply via Supabase CLI

### Adding a UI Component
1. **IF Shadcn component exists**: `npx shadcn-ui@latest add <component-name>`
2. **IF custom component**: Add to `client/src/components/`
3. Never modify files in `client/src/components/ui/` manually

---

## 🐛 Debugging Tips

### Frontend Issues
- **Dev server**: http://localhost:5173
- **API proxied**: Requests to `/api/*` → `http://localhost:3000/api/*`
- **Check**: Browser console + Network tab

### Backend Issues
- **Server runs on**: http://localhost:3000
- **Logs**: Pino logger outputs JSON to console
- **Database**: Check Supabase dashboard for query logs

### Common Errors
- **"Cannot connect to database"**: MongoDB reference - ignore, use Supabase
- **"API key not found"**: Check `.env` has required keys
- **"Component not found"**: Might be importing from `/archive/`

---

## 📝 Code Style Guide

### Naming Conventions
- **Components**: PascalCase (`ArticlePage`, `NewsCard`)
- **Files**: Match component name (`ArticlePage.tsx`)
- **Functions**: camelCase (`handleSubmit`, `fetchArticles`)
- **Hooks**: Prefix with `use` (`useArticleEdit`, `useToast`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Database**: snake_case (`article_id`, `created_at`)

### File Organization
- One component per file (except small utility components)
- Group related components in folders (`cms/`, `research/`)
- Keep pages in `/pages/`, reusable components in `/components/`

---

## 🚨 Anti-Patterns to Avoid

1. ❌ **DON'T** create MongoDB schemas (database not used)
2. ❌ **DON'T** edit Shadcn UI components in `/components/ui/`
3. ❌ **DON'T** import from `/archive/` folder
4. ❌ **DON'T** expect Anthropic/Azure LLM providers to work (incomplete)
5. ❌ **DON'T** treat `.env.example` as a template (has real secrets)
6. ❌ **DON'T** modify hardcoded password unless explicitly asked
7. ❌ **DON'T** create API endpoints for building data (it's mocked intentionally)

---

## 📚 Additional Documentation

- **Deployment**: `docs/RAILWAY_DEPLOYMENT_GUIDE.md`
- **Database Setup**: `docs/SUPABASE_SETUP_GUIDE.md`
- **Circle Y Integration**: `docs/CIRCLE_Y_INTEGRATION_DESIGN.md`
- **CMS Usage**: `supabase/CMS_README.md`
- **Research Feature**: `docs/RESEARCH_PROMPT_BUILDER_COMPLETE.md`

---

## 🆘 When in Doubt

1. Check this guide first
2. Reference existing similar code
3. Ask about database choice (always Supabase)
4. Verify you're not editing auto-generated files
5. Check if code is in `/archive/` (don't use it)

---

**Last Updated**: 2026-02-01
**Maintainer**: For questions, check `/docs/` or recent commit messages
