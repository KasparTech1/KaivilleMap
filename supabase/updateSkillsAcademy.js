import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSkillsAcademy() {
  try {
    console.log('Updating Skills Academy content with new design...\n');

    const { error } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Skills Academy',
          subtitle: 'Learn and Develop Your AI Skills',
          description: 'From Swiss Guards to Texas Aggies to AI Pioneers - we\'ve always valued learning and service',
          
          // Philosophy section
          philosophy: {
            title: 'AI Learning Made Simple',
            description: 'If you can explain a task to a new employee, you can work with AI. No coding required - just conversation. At Kaspar, we believe everyone can learn to use AI tools effectively, just like learning to use a smartphone or any other workplace technology.'
          },
          
          // SKILLS + AI Framework
          framework: [
            {
              title: 'SAFETY + AI',
              icon: 'hardhat',
              color: 'red',
              description: 'AI helps identify potential hazards and improve safety documentation'
            },
            {
              title: 'KAIZEN + AI',
              icon: 'recycle',
              color: 'green',
              description: 'AI assists with waste identification and process improvement suggestions'
            },
            {
              title: 'INVESTING + AI',
              icon: 'trending',
              color: 'gold',
              description: 'AI supports better data analysis for investment decisions'
            },
            {
              title: 'LEADERSHIP + AI',
              icon: 'users',
              color: 'blue',
              description: 'AI tools enhance communication and decision-making capabilities'
            },
            {
              title: 'LDM + AI',
              icon: 'list',
              color: 'purple',
              description: 'AI streamlines daily management tasks and reporting'
            },
            {
              title: 'SDP + AI',
              icon: 'target',
              color: 'orange',
              description: 'AI provides insights for strategic planning and goal tracking'
            }
          ],
          
          // Learning Approach
          approach: [
            'Start with simple, practical applications',
            'Learn by doing, not just theory',
            'Family support system - no one learns alone',
            'Focus on tools that make work easier, not harder',
            'Build confidence through small wins'
          ],
          
          // Available Resources
          resources: [
            { title: 'Getting Started Guides', icon: 'play' },
            { title: 'Tool Introductions', icon: 'tools' },
            { title: 'Success Story Examples', icon: 'star' },
            { title: 'Common Questions Answered', icon: 'question' },
            { title: 'Practice Opportunities', icon: 'hands' }
          ],
          
          // Encouragement
          encouragement: {
            title: 'You Already Have the Hardest Skill',
            description: 'The most important skill for working with AI is knowing what needs to be done. You already have that expertise. AI just helps you do it faster, better, and with less repetitive work.'
          },
          
          // Five Generations
          generations: [
            {
              number: '1',
              title: '1st Generation',
              years: '(1898-1920s)',
              technologies: 'Steam power, industrial machinery, wire basket innovation',
              story: 'August Kaspar learned to see value in discarded wire when others saw junk',
              aiConnection: 'Just like August saw potential in waste materials, AI helps us see patterns and opportunities others miss'
            },
            {
              number: '2',
              title: '2nd Generation',
              years: '(1920s-1940s)',
              technologies: 'Electric tools, assembly lines, manufacturing scale',
              story: 'The second generation embraced electric tools to improve quality and speed',
              aiConnection: 'Like electric tools amplified human capability, AI amplifies human intelligence'
            },
            {
              number: '3',
              title: '3rd Generation',
              years: '(1960s-1980s)',
              technologies: 'Welding robots, early computerization',
              story: 'When robots arrived, welders became robot operators - more skilled, not replaced',
              aiConnection: 'AI follows the same pattern - it makes us more capable, not obsolete'
            },
            {
              number: '4',
              title: '4th Generation',
              years: '(1990s-2010s)',
              technologies: 'Internet, digital transformation, global markets',
              story: 'The fourth generation connected Kaspar to the world through digital technology',
              aiConnection: 'AI is the next step in our digital journey, connecting human expertise with machine capabilities'
            },
            {
              number: '5',
              title: '5th Generation',
              years: '(2020s-Present)',
              technologies: 'Artificial Intelligence, machine learning, predictive analytics',
              story: 'Today\'s generation leads the AI transformation while maintaining our values',
              aiConnection: 'You\'re writing the next chapter - combining 125 years of wisdom with cutting-edge AI'
            }
          ],
          
          // Call to Action
          callToAction: 'Innovation Plaza showcases real success stories from team members who started just like you.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'learning_lodge');
    
    if (error) {
      console.error('Error updating Skills Academy:', error);
    } else {
      console.log('✅ Successfully updated Skills Academy content!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

updateSkillsAcademy();