import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMissingBuildings() {
  try {
    console.log('Creating missing building entries in CMS...\n');

    // Create Job Junction
    const { error: error1 } = await supabase
      .from('simple_content')
      .insert({ 
        page_type: 'building',
        page_id: 'community-center',
        content: {
          title: 'Job Junction',
          subtitle: 'Where We Live the JOB Way',
          heroQuote: '"You felt like you were a part of this family, that it wasn\'t just a work environment. This was like your second family." - Arthur Kaspar',
          description: 'Welcome to Job Junction, where we practice our engagement framework that makes Kaspar feel like family.',
          sections: [
            {
              title: 'The JOB Framework',
              content: '**J - Join, Not Judge**\nWe come together as family. When COVID hit and we needed to make ventilator baskets, office folks joined factory workers. No judgment, just joining. Same with AI - you bring experience, AI brings processing power. Together, that\'s where magic happens.\n\n**O - Own Your Area**\nTake responsibility for your AI journey. Define your area of ownership and commit to making it better. You know what needs doing better than anyone else.\n\n**B - Be Kind**\nSupport each other through the learning process. Share your wins, help with challenges, and remember we\'re all learning together. Every expert was once a beginner.'
            },
            {
              title: 'Community Spaces',
              content: '• Partner Finder: Match with AI journey companions who share your goals\n• Story Wall: "I Was Skeptical Too" - real testimonials from colleagues\n• Mentorship Program: Connect with AI champions who\'ve walked this path\n• Team Spaces: Department-specific support groups'
            },
            {
              title: 'Fear-to-Curiosity Transformation',
              content: 'Use our interactive tool to transform common AI anxieties into curiosity. Remember: "I can\'t" becomes "I did!" when we practice the JOB way together.'
            }
          ],
          callToAction: 'Ready to learn the practical skills? Head to Skills Academy where we enhance what you already know with AI capabilities.'
        }
      });
    
    if (error1) console.error('Error creating Job Junction:', error1);
    else console.log('✅ Created Job Junction');

    // Create Innovation Plaza
    const { error: error2 } = await supabase
      .from('simple_content')
      .insert({ 
        page_type: 'building',
        page_id: 'celebration_station',
        content: {
          title: 'Innovation Plaza',
          subtitle: 'Where Ideas Take Flight',
          heroQuote: '"Like August turning discarded wire into lasting value, we turn routine tasks into competitive advantages."',
          description: 'Welcome to Innovation Plaza, our corporate showcase arena where you present your AI wins and celebrate peer innovations.',
          sections: [
            {
              title: 'The Showcase Arena',
              content: 'Step into our modern demonstration arena - the heart of innovation at Kaspar. Here, colleagues present their AI breakthroughs to an audience that appreciates the power of practical innovation.'
            },
            {
              title: 'Real Results, Real People',
              content: '**Current Wins on Display:**\n• 50% reduction in quality inspection time\n• $100K saved through predictive maintenance\n• 3x faster customer response times\n• Juan saves 2 hours daily with AI automation\n• Maria saved $50K last quarter through smart analysis'
            },
            {
              title: 'Your Innovation Stage',
              content: 'This isn\'t just for viewing - it\'s for participating. Every innovation showcased here came from someone who said, "I wonder if there\'s a better way." Someone just like you.\n\n**Remember the QUAD bed?** Nobody thought shipping could be revolutionized until we did it. Bedrock went from 2 beds a day to 25. Your experience plus AI equals solutions nobody else can imagine.'
            },
            {
              title: 'Interactive Elements',
              content: '• Live ROI Dashboard: Real-time value creation metrics across all subsidiaries\n• Success Showcase: Filter by department, subsidiary, or SKILLS component\n• Innovation Gallery: Before/after comparisons of AI implementations\n• Idea Submission Portal: "What\'s Your Wire Basket?" - submit your innovation idea\n• Recognition Wall: AI Champions Hall of Fame'
            },
            {
              title: 'Monthly Spotlight',
              content: 'Featured innovations rotate monthly, with detailed implementation guides so you can replicate success in your area.'
            }
          ],
          callToAction: 'Inspired by what\'s possible? Climb Kaizen Tower for the big picture view of where we\'re headed together.'
        }
      });
    
    if (error2) console.error('Error creating Innovation Plaza:', error2);
    else console.log('✅ Created Innovation Plaza');

    // Create Kaizen Tower
    const { error: error3 } = await supabase
      .from('simple_content')
      .insert({ 
        page_type: 'building',
        page_id: 'kasp_tower',
        content: {
          title: 'Kaizen Tower',
          subtitle: 'Continuous Improvement Never Ends',
          heroQuote: '"At 125 years old, we\'re putting our foot on the accelerator, not coasting." - Jason Kaspar',
          description: 'Welcome to Kaizen Tower, our forward-looking lighthouse showing the endless possibilities of AI-enhanced continuous improvement.',
          sections: [
            {
              title: 'The View from Here',
              content: 'Look back at your journey through Kaiville. From understanding our heritage to joining together, building skills, and creating value. But here\'s the truth - we never arrive. Kaizen means continuous improvement. Always better, never best.'
            },
            {
              title: 'Generational Rebirth',
              content: 'Every generation rebirths this company:\n• The wire basket generation (1898-1920)\n• The automotive generation (1920-1970)\n• The precious metals generation (2000s)\n• **The AI generation (that\'s you)**'
            },
            {
              title: 'Acceleration, Not Coasting',
              content: 'See those horizons from our observation deck? That\'s where we\'re headed. New possibilities. Better ways to serve customers. More time for work that matters. Your ideas, amplified by AI, creating value we can\'t even imagine yet.'
            },
            {
              title: 'Future-Focused Resources',
              content: '• Vision Center: Long-term AI roadmap for Kaspar\n• Trend Observatory: Emerging AI capabilities and industry insights\n• Advanced Training: Next-level AI applications for experienced users\n• Innovation Lab: Experimental projects and cutting-edge applications\n• Mentorship Hub: Become an AI guide for others\n• Strategic Planning Tools: AI-enhanced planning and forecasting'
            },
            {
              title: 'Your Continuous Journey',
              content: 'The future isn\'t something that happens to us. It\'s something we build. Together. One improvement at a time. And it starts with your first idea.\n\n**What problem have you always wanted to solve?**'
            }
          ],
          callToAction: 'You\'ve completed the Kaiville journey, but your AI story is just beginning. Return to any building to deepen your knowledge, or visit Job Junction to share your first ideas with the community.'
        }
      });
    
    if (error3) console.error('Error creating Kaizen Tower:', error3);
    else console.log('✅ Created Kaizen Tower');

    console.log('\n✅ All missing buildings created successfully!');
  } catch (error) {
    console.error('Error creating buildings:', error);
  }
}

createMissingBuildings();