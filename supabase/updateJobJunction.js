import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateJobJunction() {
  try {
    console.log('Updating Join Junction to Job Junction in CMS...');

    // Update Community Center/Join Junction to Job Junction
    const { data, error } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Job Junction',
          description: 'The hub for career development and professional opportunities',
          details: 'Job Junction serves as Kaiville\'s premier career center, offering job placement services, professional development workshops, and networking opportunities to help residents achieve their career goals.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'community-center');
    
    if (error) {
      console.error('Error updating Join Junction:', error);
    } else {
      console.log('Updated Join Junction to Job Junction');
    }

    // Verify the update
    const { data: verification, error: verifyError } = await supabase
      .from('simple_content')
      .select('page_id, content')
      .eq('page_type', 'building')
      .eq('page_id', 'community-center');
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else if (verification && verification.length > 0) {
      console.log('\nVerification - Current content:');
      console.log(`- ${verification[0].page_id}: ${verification[0].content.title}`);
    }

    console.log('\n✅ Job Junction update completed!');
  } catch (error) {
    console.error('Error updating Job Junction:', error);
  }
}

updateJobJunction();