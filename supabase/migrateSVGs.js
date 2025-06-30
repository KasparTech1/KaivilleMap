import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// SVG files to migrate (from public/assets only, not node_modules or dist)
const svgFiles = [
  'celebration-station-notext.svg',
  'celebration-station.svg',
  'community-center.svg',
  'craft_works.svg',
  'heritage-center-animated-fixed.svg',
  'heritage-center-with-flags.svg',
  'heritage_center-notext.svg',
  'heritage_center_animated.svg',
  'kai-sign-small.svg',
  'kai-welocme.svg',
  'kasp-tower.svg',
  'knn-tower-old.svg',
  'knn-tower.svg',
  'lamp.svg',
  'learning_lodge-notext.svg',
  'learning_lodge.svg',
  'safety-station.svg',
  'town-hall.svg',
  'tx-flag.svg',
  'us-flag.svg',
  'wire-basket.svg'
];

// URL mapping that we'll generate
const urlMapping = {};

async function migrateSVGsToSupabase() {
  console.log('🚀 Starting SVG migration to Supabase Storage...\n');

  const publicAssetsPath = path.join(__dirname, '..', 'client', 'public', 'assets');
  let successCount = 0;
  let errorCount = 0;

  for (const svgFile of svgFiles) {
    try {
      console.log(`📄 Processing: ${svgFile}`);
      
      // Read the SVG file
      const filePath = path.join(publicAssetsPath, svgFile);
      const fileContent = await fs.readFile(filePath);
      
      // Determine the category based on filename
      let category = 'site-assets/icons'; // default
      if (svgFile.includes('flag')) {
        category = 'site-assets/icons';
      } else if (svgFile.includes('welcome') || svgFile.includes('sign')) {
        category = 'site-assets/illustrations';
      } else if (svgFile.includes('station') || svgFile.includes('center') || 
                 svgFile.includes('lodge') || svgFile.includes('hall') || 
                 svgFile.includes('tower') || svgFile.includes('works')) {
        category = 'maps/svg/full';
      }
      
      // Upload to Supabase
      const storagePath = `${category}/${svgFile}`;
      const { data, error } = await supabase.storage
        .from('kaiville-assets')
        .upload(storagePath, fileContent, {
          contentType: 'image/svg+xml',
          upsert: true,
          cacheControl: '3600'
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('kaiville-assets')
        .getPublicUrl(storagePath);

      // Store mapping
      urlMapping[svgFile] = {
        originalPath: `/assets/${svgFile}`,
        supabaseUrl: urlData.publicUrl,
        storagePath: storagePath,
        category: category
      };

      console.log(`   ✅ Uploaded to: ${storagePath}`);
      console.log(`   📎 URL: ${urlData.publicUrl}`);
      successCount++;

      // Also create a database record
      await supabase
        .from('assets')
        .upsert({
          bucket_name: 'kaiville-assets',
          file_path: storagePath,
          file_name: svgFile,
          file_type: 'image/svg+xml',
          mime_type: 'image/svg+xml',
          metadata: {
            original_path: `/assets/${svgFile}`,
            category: category,
            migrated: true,
            migration_date: new Date().toISOString()
          },
          tags: ['svg', 'kaiville', category.split('/')[1]]
        }, {
          onConflict: 'bucket_name,file_path'
        });

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      errorCount++;
    }
    
    console.log(''); // Empty line between files
  }

  // Save URL mapping to a JSON file
  const mappingPath = path.join(__dirname, '..', 'client', 'src', 'config', 'assetUrls.json');
  await fs.mkdir(path.dirname(mappingPath), { recursive: true });
  await fs.writeFile(mappingPath, JSON.stringify(urlMapping, null, 2));

  // Also create a TypeScript config file
  const tsConfigContent = `// Auto-generated asset URLs from Supabase Storage
// Generated on: ${new Date().toISOString()}

export const assetUrls = ${JSON.stringify(urlMapping, null, 2)} as const;

export type AssetName = keyof typeof assetUrls;

export function getAssetUrl(assetName: AssetName): string {
  return assetUrls[assetName]?.supabaseUrl || \`/assets/\${assetName}\`;
}

export default assetUrls;`;

  await fs.writeFile(
    path.join(__dirname, '..', 'client', 'src', 'config', 'assetUrls.ts'),
    tsConfigContent
  );

  console.log('📊 Migration Summary:');
  console.log(`   ✅ Successfully uploaded: ${successCount} files`);
  console.log(`   ❌ Errors: ${errorCount} files`);
  console.log(`\n📁 URL mapping saved to: client/src/config/assetUrls.json`);
  console.log(`📁 TypeScript config saved to: client/src/config/assetUrls.ts`);
  
  return urlMapping;
}

// Run migration
migrateSVGsToSupabase()
  .then(mapping => {
    console.log('\n✨ Migration completed!');
    console.log('\nNext steps:');
    console.log('1. Update React components to use getAssetUrl() function');
    console.log('2. Test that all images load correctly');
    console.log('3. Remove SVG files from public/assets');
  })
  .catch(error => {
    console.error('\n❌ Migration failed:', error);
  });