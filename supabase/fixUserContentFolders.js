import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createUserContentFolders() {
  console.log('📁 Creating user-content folders with proper mime types\n');

  // Create a 1x1 transparent PNG as placeholder
  const canvas = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  );

  const folders = [
    'avatars',
    'submissions'
  ];

  for (const folder of folders) {
    try {
      const { data, error } = await supabase.storage
        .from('user-content')
        .upload(`${folder}/.placeholder.png`, canvas, {
          contentType: 'image/png',
          upsert: true
        });

      if (error) throw error;
      console.log(`✅ Created folder: user-content/${folder}`);
    } catch (error) {
      console.error(`❌ Error creating ${folder}: ${error.message}`);
    }
  }

  console.log('\n🔍 Listing all storage contents...\n');

  // List contents of both buckets
  const buckets = ['kaiville-assets', 'user-content'];
  
  for (const bucket of buckets) {
    console.log(`📦 ${bucket}:`);
    
    async function listRecursive(path = '', indent = '   ') {
      try {
        const { data: items, error } = await supabase.storage
          .from(bucket)
          .list(path, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (error) throw error;

        for (const item of items || []) {
          const itemPath = path ? `${path}/${item.name}` : item.name;
          
          if (item.metadata) {
            // It's a file
            console.log(`${indent}📄 ${item.name}`);
          } else {
            // It's a folder - check if it has contents
            console.log(`${indent}📁 ${item.name}/`);
            await listRecursive(itemPath, indent + '   ');
          }
        }
      } catch (error) {
        console.error(`${indent}❌ Error listing ${path}: ${error.message}`);
      }
    }

    await listRecursive();
    console.log('');
  }

  console.log('✨ User content folders created successfully!');
}

// Run the script
createUserContentFolders().catch(console.error);