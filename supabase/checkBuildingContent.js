import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuildingContent() {
  try {
    console.log('Checking current building content in CMS...\n');

    // Get all building content
    const { data: buildings, error } = await supabase
      .from('simple_content')
      .select('page_id, content')
      .eq('page_type', 'building')
      .order('page_id');
    
    if (error) {
      console.error('Error fetching buildings:', error);
      return;
    }

    console.log(`Found ${buildings.length} buildings:\n`);

    buildings.forEach(building => {
      console.log(`\n=== ${building.page_id} ===`);
      console.log(`Title: ${building.content.title || 'No title'}`);
      console.log(`Subtitle: ${building.content.subtitle || 'No subtitle'}`);
      console.log(`Has sections: ${building.content.sections ? 'Yes (' + building.content.sections.length + ' sections)' : 'No'}`);
      console.log(`Has hero quote: ${building.content.heroQuote ? 'Yes' : 'No'}`);
      console.log(`Has call to action: ${building.content.callToAction ? 'Yes' : 'No'}`);
    });

    // Check which buildings might be missing
    const expectedBuildings = [
      'heritage_center',
      'community-center', 
      'learning_lodge',
      'celebration_station',
      'kasp_tower'
    ];

    const existingIds = buildings.map(b => b.page_id);
    const missing = expectedBuildings.filter(id => !existingIds.includes(id));

    if (missing.length > 0) {
      console.log('\n⚠️  Missing buildings:', missing);
    }

  } catch (error) {
    console.error('Error checking building content:', error);
  }
}

checkBuildingContent();