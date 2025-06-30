# Supabase Setup Guide for Kaiville

## Overview
This directory contains the SQL migrations and helper functions for setting up Supabase storage and database for the Kaiville project.

## Setup Instructions

### 1. Run Migrations
Execute the SQL migrations in order through the Supabase dashboard:

1. **001_create_storage_buckets.sql** - Creates storage buckets for assets
2. **002_create_database_schema.sql** - Creates database tables
3. **003_create_rls_policies.sql** - Sets up Row Level Security

### 2. Storage Structure

```
kaiville-assets/ (public bucket)
├── maps/
│   ├── svg/
│   │   ├── full/
│   │   ├── optimized/
│   │   └── animated/
│   ├── images/
│   │   ├── thumbnails/
│   │   ├── medium/
│   │   └── original/
│   └── data/
├── site-assets/
│   ├── logos/
│   ├── icons/
│   ├── backgrounds/
│   └── illustrations/
└── documents/

user-content/ (private bucket)
├── avatars/
└── submissions/
```

### 3. Using the Asset Helpers

```javascript
import { uploadAsset, uploadMapSvg, getMaps, getPageWithAssets } from './supabase/assetHelpers';

// Upload a map SVG
const mapFile = // ... your SVG file
const result = await uploadMapSvg(mapFile, {
  name: 'Downtown Kaiville',
  description: 'Interactive map of downtown area',
  bounds: { north: 45.5, south: 45.4, east: -122.6, west: -122.7 },
  zoom_levels: { min: 10, max: 18 }
});

// Get all maps
const maps = await getMaps();

// Get a page with its assets
const page = await getPageWithAssets('about-kaiville');
```

## Database Schema

### Core Tables:
- **assets** - Stores metadata for all uploaded files
- **pages** - Content pages with JSON content blocks
- **maps** - Map-specific data with geographic bounds
- **categories** - Hierarchical categorization system
- **page_assets** - Links assets to pages
- **asset_categories** - Links assets to categories

## Security

- Public read access for most content
- Authenticated users can manage content
- User-specific content in `user-content` bucket is private
- RLS policies enforce access control

## Environment Variables

Ensure your `.env` file contains:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

## Next Steps

1. Run the migrations in your Supabase project
2. Test the storage buckets through the Supabase dashboard
3. Integrate the helper functions into your application
4. Set up image transformation policies if needed