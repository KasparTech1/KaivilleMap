# Kaiville CMS Implementation Guide

## Overview
This CMS system allows in-UI editing of Kaiville page content with PostgreSQL storage.

## Database Schema

### Core Tables Created:
1. **Enhanced `pages` table** - Added page_type, subtitle, hero_image, is_published
2. **`articles`** - Blog-style content with headlines, author info, content blocks
3. **`content_blocks`** - Modular content blocks (text, image, video, etc.)
4. **`article_cards`** - Display cards for article grids
5. **`admin_sessions`** - Session management for admin access
6. **`content_revisions`** - History tracking for all edits
7. **`site_settings`** - Global settings including admin password

## Authentication System

### Password: `kaiville25`

### How it works:
1. User clicks Admin button
2. Password modal appears
3. On correct password, 24-hour session token is created
4. Token stored in localStorage and cookie
5. All edit operations require valid token

### Admin Functions:
- `create_admin_session(password, ip, agent)` - Authenticates and creates session
- `validate_admin_session(token)` - Checks if session is valid
- `update_page_content(slug, updates, token)` - Updates page with auth check
- `update_content_blocks(page_id, blocks, token)` - Updates content blocks

## React Components

### 1. `<EditableText>`
Inline editing for any text element:
```jsx
<EditableText 
  value={title}
  onChange={setTitle}
  onSave={saveToDatabase}
  tag="h1"
  placeholder="Page Title"
/>
```

### 2. `<AdminAuth>`
Password authentication modal

### 3. `<AdminProvider>`
Context provider for admin state:
```jsx
<AdminProvider>
  <App />
</AdminProvider>
```

### 4. `<AdminEditButton>`
Fixed button to enter/exit admin mode

## Content Block Types

### Text Block
```json
{
  "type": "text",
  "content": {
    "text": "Your content here",
    "format": "paragraph"
  }
}
```

### Image Block
```json
{
  "type": "image",
  "content": {
    "assetId": "uuid",
    "alt": "Description",
    "caption": "Optional"
  }
}
```

### Hero Block
```json
{
  "type": "hero",
  "content": {
    "title": "Welcome",
    "subtitle": "To Kaiville",
    "backgroundImage": "asset-id"
  }
}
```

## API Usage

### JavaScript/React
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Authenticate
const { data } = await supabase.rpc('create_admin_session', {
  password: 'kaiville25'
});

// Update page
await supabase.rpc('update_page_content', {
  page_slug: 'welcome',
  updates: { title: 'New Title' },
  session_token: token
});
```

### Direct API
```javascript
// Get page content
const { data: page } = await supabase
  .from('pages')
  .select(`
    *,
    articles(*),
    content_blocks(*)
  `)
  .eq('slug', 'welcome')
  .single();

// Update with RLS
const { error } = await supabase
  .from('pages')
  .update({ title: 'New Title' })
  .eq('slug', 'welcome');
```

## Security Features

1. **Session-based auth** - 24hr expiry
2. **RLS policies** - Public read, authenticated write
3. **Revision history** - All changes tracked
4. **Input sanitization** - Handled by Supabase
5. **HTTPS only** - Enforced by Supabase

## Next Steps

1. Add the React components to your pages
2. Wrap app in AdminProvider
3. Add EditableText to elements you want editable
4. Test with password: `kaiville25`
5. Customize styles in the CSS files

## Environment Variables

Add to your React app:
```
REACT_APP_SUPABASE_URL=your_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## Sample Implementation

```jsx
import { AdminProvider, AdminEditButton, EditableText, useAdmin } from './components/cms';

function App() {
  return (
    <AdminProvider>
      <HomePage />
      <AdminEditButton />
    </AdminProvider>
  );
}

function HomePage() {
  const { isAdmin } = useAdmin();
  const [page, setPage] = useState(null);
  
  // Fetch page data
  useEffect(() => {
    fetchPageContent('welcome').then(setPage);
  }, []);
  
  const handleSave = async (field, value) => {
    if (!isAdmin) return;
    
    await updatePageContent('welcome', { [field]: value });
    // Refresh page data
  };
  
  return (
    <div>
      <EditableText
        value={page?.title}
        onSave={(value) => handleSave('title', value)}
        tag="h1"
      />
      <EditableText
        value={page?.subtitle}
        onSave={(value) => handleSave('subtitle', value)}
        tag="h2"
      />
    </div>
  );
}
```