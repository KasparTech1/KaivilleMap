import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateStewardshipHall() {
  try {
    console.log('Updating Stewardship Hall content with new design...\n');

    const { error } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Stewardship Hall',
          subtitle: '125 Years of Heritage & Values',
          heroQuote: '"We don\'t truly own what we\'re responsible for - we manage what\'s entrusted to us for future generations."',
          description: 'Welcome to the heart of our story - where our past informs our future and where we honor the responsibility of carrying forward a legacy that spans generations.',
          
          // Mission section
          mission: {
            title: 'Why We Exist',
            statement: 'KASPAR COMPANIES EXISTS TO IMPROVE LIVES BY BEING FAITHFUL STEWARDS OF GOD-GIVEN RESOURCES',
            description: 'This foundational mission has guided every decision for 125 years, from August Kaspar\'s first wire basket to today\'s AI implementation. Every resource entrusted to us - materials, people, technology - is stewarded with this sacred responsibility.'
          },
          
          // Core Values
          coreValues: [
            {
              title: 'STEWARDSHIP',
              icon: 'hands-holding',
              description: 'Our hands are outstretched and open representing our dedication to STEWARDSHIP, carefully receiving and cultivating the resources entrusted to us so that we may responsibly return them to the world in the form of prosperity and opportunity.'
            },
            {
              title: 'VERSATILITY',
              icon: 'route',
              description: 'Moving forward in a purposeful direction, our feet take each step with the balance of VERSATILITY to remain guided and diverse as we carefully maintain our established roads while actively exploring new paths.'
            },
            {
              title: 'FAMILY',
              icon: 'heart',
              description: 'Supporting all members and making us whole is the backbone of our organization: FAMILY. Owned and operated by five generations of the Kaspar family, we believe in the strong family unit and are committed to being a family friendly employer.'
            }
          ],
          
          // Heritage Timeline
          timeline: [
            {
              year: '1898',
              title: 'The Foundation',
              description: 'Wire basket innovation, August Kaspar\'s vision',
              icon: 'star'
            },
            {
              year: '1920s',
              title: 'Expansion Era',
              description: 'Growth and community focus, establishing values',
              icon: 'building'
            },
            {
              year: '1970s',
              title: 'Diversification',
              description: 'Truck accessories, adaptability in action',
              icon: 'truck'
            },
            {
              year: '2000s',
              title: 'Innovation',
              description: 'Precious metals, continuous improvement mindset',
              icon: 'coins'
            },
            {
              year: '2025',
              title: 'AI Transformation',
              description: 'Faithful stewardship meets artificial intelligence',
              icon: 'microchip',
              highlight: true
            }
          ],
          
          // Heritage Stats
          stats: [
            { number: '5', label: 'Generations of leadership' },
            { number: '80+', label: 'Year product lifecycles' },
            { number: 'Zero', label: 'Layoffs in 125 years' },
            { number: '1,000+', label: 'Family members served' }
          ],
          
          // Philosophy section
          philosophy: {
            title: 'Stewardship Philosophy',
            quote: '"We don\'t truly own what we\'re responsible for - we manage what\'s entrusted to us for future generations"',
            description: 'This guiding principle shapes how we approach AI implementation. Artificial intelligence is another God-given resource entrusted to our generation.',
            subdescription: 'We view innovation as a tool to honor our heritage while creating sustainable value for generations to come.'
          },
          
          // Pledge items
          pledgeItems: [
            'I pledge to uphold our heritage of responsible stewardship by prioritizing human well-being in all AI implementation decisions',
            'I commit to maintaining transparency about AI use and its impacts',
            'I promise to ensure AI supports rather than replaces human judgment',
            'I pledge to seek continuous learning about responsible AI practices',
            'I commit to sharing knowledge and best practices with my colleagues'
          ],
          
          // Call to Action
          callToAction: 'Ready to experience our culture in action? Continue your journey through Kaiville at Job Junction where you\'ll discover how these foundational values come alive in our daily interactions.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'heritage_center');
    
    if (error) {
      console.error('Error updating Stewardship Hall:', error);
    } else {
      console.log('✅ Successfully updated Stewardship Hall content!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

updateStewardshipHall();