import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateKaizenTower() {
  try {
    console.log('Updating Kaizen Tower content with new design...\n');

    const { error } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Kaizen Tower',
          subtitle: 'Continuous Improvement Never Ends',
          heroQuote: {
            text: '"At 125 years old, we\'re putting our foot on the accelerator, not coasting."',
            author: '- Jason Kaspar'
          },
          
          // Observation Deck
          observationDeck: {
            title: 'Welcome to the Kaizen Tower Observation Deck',
            description: 'From up here, you can see it all - past, present, and future. And you know what? You\'re part of all three. This is where vision meets action, where 125 years of continuous improvement meets unlimited possibilities ahead.'
          },
          
          // The Horizon - What We See Ahead
          horizon: [
            {
              icon: 'tools',
              color: 'blue',
              description: 'AI becoming as natural as any other workplace tool'
            },
            {
              icon: 'userCog',
              color: 'gold',
              description: 'Every employee empowered with AI capabilities that amplify their expertise'
            },
            {
              icon: 'graduation',
              color: 'sage',
              description: 'Continuous learning as part of daily work culture'
            },
            {
              icon: 'lightbulb',
              color: 'deepBlue',
              description: 'Innovation happening at every level of the organization'
            },
            {
              icon: 'factory',
              color: 'purple',
              description: 'Kaspar leading manufacturing excellence through thoughtful AI integration'
            }
          ],
          
          // Continuous Improvement
          continuousImprovement: {
            title: 'Forever Improving, Never Arriving',
            description: 'Kaizen means continuous improvement - always getting better, never standing still. For 125 years, we\'ve embraced new tools and technologies not because change is easy, but because standing still means falling behind. AI is simply our newest tool for continuous improvement.'
          },
          
          // Five Generations
          generations: [
            {
              number: '1',
              title: '1st Generation',
              description: 'Steam power and industrial machinery'
            },
            {
              number: '2',
              title: '2nd Generation',
              description: 'Electric tools and assembly lines'
            },
            {
              number: '3',
              title: '3rd Generation',
              description: 'Welding robots and computerization'
            },
            {
              number: '4',
              title: '4th Generation',
              description: 'Internet and digital systems'
            },
            {
              number: '5',
              title: '5th Generation',
              description: 'Artificial Intelligence and automation'
            }
          ],
          
          // Your Role
          yourRole: {
            title: 'Where You Fit In',
            description: 'The future isn\'t something that happens to us. It\'s something we build together. Your ideas, amplified by AI, create value we can\'t even imagine yet. Every improvement you make, every process you enhance, every problem you solve - that\'s how we write the next chapter.'
          },
          
          // Journey Continues
          journeyContinues: {
            title: 'This Is Just the Beginning',
            description: 'What you\'ve discovered in Kaiville is just the foundation. The real journey begins when you take your first step with AI. Remember - you\'re not learning technology, you\'re continuing our legacy of transformation.'
          },
          
          // Commitment
          commitment: {
            title: 'Ready to Begin?',
            description: 'Your Kaiville tour ends here, but your AI journey is just beginning. You have everything you need: our heritage values to guide you, our family culture to support you, the learning resources to help you, and real success stories to inspire you.'
          },
          
          // Next Steps
          nextSteps: [
            {
              icon: 'map',
              title: 'Return to Town Map',
              description: 'Explore Kaiville again'
            },
            {
              icon: 'graduation',
              title: 'Visit SKILLS Academy',
              description: 'Start with learning resources'
            },
            {
              icon: 'headset',
              title: 'Contact Support',
              description: 'Get personal guidance'
            },
            {
              icon: 'share',
              title: 'Share Kaiville',
              description: 'Invite colleagues to explore'
            }
          ],
          
          // Call to Action
          callToAction: 'The view from here is just the beginning. Let\'s build something amazing together.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'kasp_tower');
    
    if (error) {
      console.error('Error updating Kaizen Tower:', error);
    } else {
      console.log('✅ Successfully updated Kaizen Tower content!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

updateKaizenTower();