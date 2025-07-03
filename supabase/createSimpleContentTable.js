import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const DATABASE_URL = `postgres://postgres.${process.env.SUPABASE_PROJECT_ID}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;

async function createSimpleTable() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log('Creating simple_content table for CMS...\n');
    
    // Create a new simpler table for our CMS
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.simple_content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        page_type TEXT NOT NULL,
        page_id TEXT NOT NULL,
        content JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        UNIQUE(page_type, page_id)
      );
      
      -- Create index
      CREATE INDEX IF NOT EXISTS idx_simple_content_page 
      ON public.simple_content(page_type, page_id);
      
      -- Disable RLS
      ALTER TABLE public.simple_content DISABLE ROW LEVEL SECURITY;
      
      -- Grant permissions
      GRANT ALL ON public.simple_content TO anon;
      GRANT ALL ON public.simple_content TO authenticated;
      GRANT ALL ON public.simple_content TO service_role;
    `);
    
    console.log('✅ Table created successfully!');
    
    // Insert default content
    await client.query(`
      INSERT INTO public.simple_content (page_type, page_id, content)
      VALUES 
        ('home', 'main', $1::jsonb),
        ('building', 'heritage_center', $2::jsonb),
        ('building', 'learning_lodge', $3::jsonb)
      ON CONFLICT (page_type, page_id) DO NOTHING
    `, [
      JSON.stringify({
        welcomeTitle: 'Welcome to Kaiville',
        welcomeSubtitle: 'Explore Our Interactive Town Map',
        heroText: 'Discover the heart of our community through this interactive map. Click on any building to learn more about what makes Kaiville special.',
        aboutTitle: 'About Kaiville',
        aboutText: 'Kaiville is a vibrant community where innovation meets tradition. Our town is home to diverse businesses, cultural centers, and community spaces that make life here truly special.'
      }),
      JSON.stringify({
        title: 'Heritage Center',
        description: 'Preserving our past, inspiring our future',
        details: 'The Heritage Center is the heart of Kaiville\'s cultural preservation efforts. Here, visitors can explore exhibits showcasing our town\'s rich history, from its founding days to present achievements.'
      }),
      JSON.stringify({
        title: 'Skills University',
        description: 'The premier institution for professional development and skill mastery',
        details: 'Skills University provides comprehensive training programs, certifications, and workshops designed to empower residents with practical skills for career advancement and personal growth.'
      })
    ]);
    
    console.log('✅ Default content inserted!');
    
    // Test query
    const { rows } = await client.query(`
      SELECT * FROM public.simple_content
    `);
    
    console.log('\nContent in table:');
    rows.forEach(row => {
      console.log(`- ${row.page_type}/${row.page_id}: ${JSON.stringify(row.content).substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

createSimpleTable();