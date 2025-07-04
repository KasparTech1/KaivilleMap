import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBuildingNames() {
  try {
    console.log('Updating building names in CMS...');

    // Update Heritage Center to Stewardship Hall
    const { data: data1, error: error1 } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Stewardship Hall',
          description: 'Where responsible leadership and community care come together',
          details: 'Stewardship Hall is dedicated to fostering responsible governance, environmental sustainability, and community stewardship. This center hosts leadership development programs, sustainability initiatives, and civic engagement activities.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'heritage_center');
    
    if (error1) console.error('Error updating Heritage Center:', error1);
    else console.log('Updated Heritage Center to Stewardship Hall');

    // Update Learning Lodge to Skills University
    const { data: data2, error: error2 } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Skills University',
          description: 'The premier institution for professional development and skill mastery',
          details: 'Skills University provides comprehensive training programs, certifications, and workshops designed to empower residents with practical skills for career advancement and personal growth.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'learning_lodge');
    
    if (error2) console.error('Error updating Learning Lodge:', error2);
    else console.log('Updated Learning Lodge to Skills University');

    // Update Community Center to Join Junction
    const { data: data3, error: error3 } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Join Junction',
          description: 'The heart of community connection and collaboration',
          details: 'Join Junction is where community members come together to connect, collaborate, and create lasting bonds. This vibrant hub hosts social events, networking opportunities, and community initiatives.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'community-center');
    
    if (error3) console.error('Error updating Community Center:', error3);
    else console.log('Updated Community Center to Join Junction');

    // Update Celebration Station to Innovation Plaza
    const { data: data4, error: error4 } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Innovation Plaza',
          description: 'Where creativity and innovation come to life',
          details: 'Innovation Plaza is the epicenter of creative thinking and technological advancement. This dynamic space fosters entrepreneurship, hosts innovation workshops, and showcases cutting-edge projects.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'celebration_station');
    
    if (error4) console.error('Error updating Celebration Station:', error4);
    else console.log('Updated Celebration Station to Innovation Plaza');

    // Update KASP Tower to Kaizen Tower
    const { data: data5, error: error5 } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Kaizen Tower',
          description: 'The pinnacle of continuous improvement and excellence',
          details: 'Kaizen Tower embodies the philosophy of continuous improvement. This landmark building houses programs focused on personal development, process optimization, and achieving excellence in all endeavors.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'kasp_tower');
    
    if (error5) console.error('Error updating KASP Tower:', error5);
    else console.log('Updated KASP Tower to Kaizen Tower');

    // Verify updates
    const { data: allBuildings, error: fetchError } = await supabase
      .from('simple_content')
      .select('page_id, content')
      .eq('page_type', 'building');
    
    if (fetchError) {
      console.error('Error fetching buildings:', fetchError);
    } else {
      console.log('\nCurrent building titles in CMS:');
      allBuildings.forEach(row => {
        console.log(`- ${row.page_id}: ${row.content.title}`);
      });
    }

    console.log('\n✅ Building names updated successfully!');
  } catch (error) {
    console.error('Error updating building names:', error);
  }
}

updateBuildingNames();