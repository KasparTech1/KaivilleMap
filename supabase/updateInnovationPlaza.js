import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateInnovationPlaza() {
  try {
    console.log('Updating Innovation Plaza content with new design...\n');

    const { error } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Innovation Plaza',
          subtitle: 'Where Ideas Take Flight',
          heroQuote: '"Your experience is the secret ingredient. AI has the recipes, but you know what tastes right."',
          description: 'Welcome to Innovation Plaza - where real people achieve real results through AI-powered innovation.',
          
          // Philosophy section
          philosophy: {
            title: 'Real People, Real Results',
            description: 'Every innovation at Kaspar starts with someone who said "I wonder if there\'s a better way to do this?" Just like when we invented the QUAD bed that revolutionized shipping, AI gives you that same innovative power for your daily work.'
          },
          
          // Success Categories
          successCategories: [
            {
              title: 'TIME SAVERS',
              icon: 'clock',
              color: 'gold',
              description: '2-10 hours saved weekly through automation'
            },
            {
              title: 'QUALITY BOOSTERS',
              icon: 'medal',
              color: 'green',
              description: 'Fewer errors, more consistent results'
            },
            {
              title: 'SAFETY ENHANCERS',
              icon: 'shield',
              color: 'blue',
              description: 'Better hazard identification and prevention'
            },
            {
              title: 'CUSTOMER CHAMPIONS',
              icon: 'users',
              color: 'sky',
              description: 'Faster response times, better service'
            },
            {
              title: 'COST CUTTERS',
              icon: 'dollar',
              color: 'sage',
              description: 'Reduced waste, optimized processes'
            },
            {
              title: 'CREATIVITY CATALYSTS',
              icon: 'lightbulb',
              color: 'brown',
              description: 'New solutions to old problems'
            }
          ],
          
          // Success Stories
          successStories: [
            {
              title: 'Manufacturing Wins',
              stories: [
                'Quality inspection time reduced by 50% using AI visual analysis',
                'Predictive maintenance prevented $100K in equipment downtime',
                'AI-assisted scheduling improved production flow by 30%'
              ]
            },
            {
              title: 'Office Efficiency',
              stories: [
                'Meeting summaries automated, saving 3 hours weekly per manager',
                'Customer inquiry responses 3x faster with AI assistance',
                'Report generation reduced from days to hours'
              ]
            },
            {
              title: 'Safety Improvements',
              stories: [
                'AI pattern analysis identified recurring safety risks',
                'Automated safety documentation ensured compliance',
                'Predictive models prevented workplace incidents'
              ]
            }
          ],
          
          // Impact Metrics
          metrics: [
            { value: '500+', label: 'Hours saved monthly' },
            { value: '25%', label: 'Reduction in repetitive tasks' },
            { value: '40%', label: 'Faster customer responses' },
            { value: '150+', label: 'Employees using AI tools' },
            { value: '$200K+', label: 'Efficiency gains this year' }
          ],
          
          // Getting Started
          gettingStarted: {
            title: 'Your Innovation Journey',
            description: 'Every success story started with curiosity and a willingness to try. No special skills required - just the desire to make your work easier and more effective.'
          },
          
          // AI Champions
          champions: [
            { name: 'Sarah M.', achievement: 'Automated quality reports' },
            { name: 'Mike R.', achievement: 'Predictive maintenance pioneer' },
            { name: 'Lisa T.', achievement: 'Customer service innovator' },
            { name: 'David K.', achievement: 'Safety analysis expert' }
          ],
          
          // Value Calculator
          valueCalculator: {
            description: 'Imagine saving 2-5 hours weekly on routine tasks. What would you do with that time?',
            timeframes: [
              { hours: '2-5', period: 'Hours saved weekly' },
              { hours: '8-20', period: 'Hours saved monthly' },
              { hours: '100-260', period: 'Hours saved annually' }
            ]
          },
          
          // Call to Action
          callToAction: 'Kaizen Tower awaits to show you the future possibilities and help you envision your own AI journey at Kaspar.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'celebration_station');
    
    if (error) {
      console.error('Error updating Innovation Plaza:', error);
    } else {
      console.log('✅ Successfully updated Innovation Plaza content!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

updateInnovationPlaza();