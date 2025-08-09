# Research Prompt Builder - Complete Implementation Guide

## Overview
The Research Prompt Builder is a comprehensive system for creating, managing, and tracking AI-powered research prompts with database persistence and template management.

## Database Schema

### Tables Created:
1. **research_templates** - Template configurations
2. **research_segments** - Segment types (business_unit, research_domain, etc.)
3. **research_segment_options** - Button choices for each segment
4. **research_prompts** - Saved prompt history
5. **research_responses** - AI-generated responses
6. **research_quick_starts** - Pre-configured templates

## Running Migrations

### 1. Create Tables
Run the migration in Supabase SQL Editor:
```sql
-- Copy contents of /server/migrations/001_create_research_tables.sql
```

### 2. Seed Initial Data
Run the seed data in Supabase SQL Editor:
```sql
-- Copy contents of /server/migrations/002_seed_research_data.sql
```

## API Endpoints

### Template Management
- `GET /api/research/templates` - List all active templates
- `GET /api/research/templates/default` - Get default template with segments
- `GET /api/research/templates/:id` - Get specific template with segments
- `POST /api/research/templates` - Create new template
- `PUT /api/research/templates/:id` - Update template

### Prompt Management
- `POST /api/research/generate` - Generate research (now saves to DB)
- `GET /api/research/prompts/history` - Get prompt history
- `GET /api/research/prompts/stats` - Get usage statistics
- `GET /api/research/prompts/:id` - Get specific prompt with response
- `POST /api/research/prompts/:id/clone` - Clone a prompt

### Segment Options
- `POST /api/research/segment-options` - Add new option
- `PUT /api/research/segment-options/:id` - Update option

## Frontend Components Plan

### 1. Template Selector Component
```typescript
// /client/src/components/research/TemplateSelector.tsx
interface TemplateSelectorProps {
  onTemplateSelect: (templateId: string) => void;
  currentTemplateId?: string;
}
```

### 2. Prompt History Component
```typescript
// /client/src/components/research/PromptHistory.tsx
interface PromptHistoryProps {
  onLoadPrompt: (prompt: SavedPrompt) => void;
}
```

### 3. Template Editor Component
```typescript
// /client/src/components/research/TemplateEditor.tsx
interface TemplateEditorProps {
  templateId?: string;
  onSave: () => void;
}
```

### 4. Updated Research Prompt Builder
The main component needs updates to:
- Load templates from database
- Save prompts automatically
- Show prompt history
- Support template switching

## Implementation Steps

### Phase 1: Database Setup ✅
1. Run migration SQL to create tables
2. Run seed SQL to populate initial data
3. Verify tables in Supabase dashboard

### Phase 2: Backend API ✅
1. Created templateService.js
2. Created promptService.js
3. Updated controllers with new endpoints
4. Added routes for all new endpoints

### Phase 3: Frontend Components (Next Steps)
1. Create useResearchTemplates hook
2. Update ResearchPromptBuilder to load from DB
3. Add TemplateSelector dropdown
4. Create PromptHistory sidebar
5. Build admin interface for template management

### Phase 4: Advanced Features
1. User authentication integration
2. Template sharing/collaboration
3. Export prompts to different formats
4. Analytics dashboard

## Usage Example

### Loading Template-Based Options:
```javascript
// Fetch default template
const response = await fetch('/api/research/templates/default');
const template = await response.json();

// template.segments contains all segments with options
// template.quickStarts contains pre-configured combinations
```

### Saving a Prompt:
```javascript
const response = await fetch('/api/research/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude',
    prompt: assembledPrompt,
    templateId: currentTemplateId,
    promptSegments: selectedSegments,
    savePrompt: true // This triggers saving to DB
  })
});
```

### Getting Prompt History:
```javascript
const response = await fetch('/api/research/prompts/history?limit=20');
const history = await response.json();
// Display in UI for quick re-use
```

## Template Structure

Each template can have completely different segment types. For example:

### Kaspar Companies Template:
- Business Unit → Research Domain → Analysis Method → Output Format

### Manufacturing Excellence Template:
- Facility Type → Process Area → Improvement Goal → Deliverable

### Market Intelligence Template:
- Market Segment → Geographic Region → Competitive Analysis → Report Type

## Admin Features

### Managing Templates:
1. Create new templates with custom segments
2. Add/edit/remove segment options
3. Set display order for options
4. Activate/deactivate templates

### Managing Options:
1. Edit display text and prompt text separately
2. Reorder options with display_order
3. Soft delete (deactivate) options

## Security Considerations

1. **Row Level Security (RLS)** is enabled on all tables
2. Public read access for templates and options
3. Authenticated access for prompt history
4. Admin-only access for template management

## Next Development Tasks

1. **Frontend Hook**: Create `useResearchTemplates` hook
2. **Template Selector UI**: Dropdown to switch templates
3. **Dynamic Segments**: Update UI to render segments from DB
4. **History Sidebar**: Show recent prompts with quick load
5. **Admin Page**: Full CRUD for templates and options
6. **Analytics Dashboard**: Usage stats and popular combinations