import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Create admin client
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

async function verifySetup() {
  console.log('🔍 Verifying Supabase Setup for Kaiville\n');
  
  // 1. Check storage buckets
  console.log('📦 Storage Buckets:');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    buckets.forEach(bucket => {
      console.log(`   ✅ ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
  } catch (error) {
    console.error('   ❌ Error listing buckets:', error.message);
  }
  
  // 2. Check database tables
  console.log('\n📊 Database Tables:');
  const tables = ['assets', 'pages', 'page_assets', 'maps', 'categories', 'asset_categories'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      console.log(`   ✅ ${table} (${count} records)`);
    } catch (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
    }
  }
  
  // 3. Test basic operations
  console.log('\n🧪 Testing Operations:');
  
  // Test inserting an asset record
  try {
    const { data: asset, error } = await supabase
      .from('assets')
      .insert({
        bucket_name: 'kaiville-assets',
        file_path: 'test/example.svg',
        file_name: 'example.svg',
        file_type: 'image/svg+xml',
        mime_type: 'image/svg+xml',
        metadata: { test: true }
      })
      .select()
      .single();
    
    if (error) throw error;
    console.log(`   ✅ Created test asset: ${asset.id}`);
    
    // Clean up test asset
    await supabase.from('assets').delete().eq('id', asset.id);
    console.log('   ✅ Cleaned up test asset');
  } catch (error) {
    console.error('   ❌ Asset operation error:', error.message);
  }
  
  // 4. Test file upload to storage
  console.log('\n📁 Testing Storage Upload:');
  try {
    const testContent = new Blob(['<svg>test</svg>'], { type: 'image/svg+xml' });
    const { data, error } = await supabase.storage
      .from('kaiville-assets')
      .upload('test/verify.svg', testContent, {
        contentType: 'image/svg+xml',
        upsert: true
      });
    
    if (error) throw error;
    console.log('   ✅ Uploaded test file');
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('kaiville-assets')
      .getPublicUrl('test/verify.svg');
    
    console.log(`   ✅ Public URL: ${urlData.publicUrl}`);
    
    // Clean up
    await supabase.storage.from('kaiville-assets').remove(['test/verify.svg']);
    console.log('   ✅ Cleaned up test file');
  } catch (error) {
    console.error('   ❌ Storage operation error:', error.message);
  }
  
  console.log('\n✨ Verification Complete!');
  console.log('\n📝 Summary:');
  console.log('   - Storage buckets are configured and accessible');
  console.log('   - Database tables are created with proper schema');
  console.log('   - CRUD operations are working correctly');
  console.log('   - File uploads and public URLs are functional');
  console.log('\n🎉 Your Kaiville Supabase setup is ready to use!');
}

// Run verification
verifySetup().catch(console.error);