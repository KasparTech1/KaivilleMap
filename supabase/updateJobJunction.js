import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateJobJunction() {
  try {
    console.log('Updating Job Junction content with new design...\n');

    const { error } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Job Junction',
          subtitle: 'Where We Choose to Join, Not Judge',
          heroQuote: {
            text: '"You felt like you were a part of this family, that it wasn\'t just a work environment. This was like your second family."',
            author: '- Arthur Kaspar'
          },
          
          // Culture section
          culture: {
            title: 'We Join, We Don\'t Judge',
            description: 'At Kaspar Companies, we believe in the power of joining together rather than standing in judgment. When challenges arise - whether it\'s learning new technology, adapting to change, or facing uncertainty - we choose to join our colleagues in their journey rather than judge their struggles. This is especially true as we explore AI together as a family.'
          },
          
          // How We Interact Framework
          framework: [
            {
              title: 'JOIN VS. JUDGE',
              icon: 'handshake',
              principles: [
                {
                  title: 'Lean into Discomfort',
                  description: 'Build trust by speaking up for yourself and others'
                },
                {
                  title: 'Listen as an Ally',
                  description: 'Once collaboration by giving energy food and working for the common good and shared success'
                },
                {
                  title: 'State your Intent & Intensity',
                  description: 'Cultivate understanding by clarifying your intent and saying what you mean and how much you mean it'
                },
                {
                  title: 'Share your Sweet Corner',
                  description: 'Achieve breakthroughs by including all necessary people in the room, considering others\' thoughts and experiences as true for them'
                }
              ]
            },
            {
              title: 'OWN YOUR AREA',
              icon: 'shield',
              principles: [
                {
                  title: 'Embrace Accountability',
                  description: 'Hold yourself and your teammates to standards of responsibility. Follow through on your promises. Everyone plays a part, accept yours'
                },
                {
                  title: 'Continuously Improve',
                  description: 'Challenge the status quo. Listen and strive to grow and implement changes for the better'
                },
                {
                  title: 'Practice Can-if',
                  description: 'Look forward instead of back. Focus on solutions rather than problems'
                },
                {
                  title: 'Act with Journey',
                  description: 'Act swiftly with purpose and intention to aggressively achieve your goals'
                }
              ]
            },
            {
              title: 'BE KIND',
              icon: 'heart',
              principles: [
                {
                  title: 'Assume Good Intent',
                  description: 'Look for the best in people. Most people mean well. Trust that'
                },
                {
                  title: 'Pause Before you React',
                  description: 'Ask: What are the facts? Response over reaction'
                },
                {
                  title: 'Connect on a Personal Level',
                  description: 'Be in each moment, listen well, practice empathy and find common ground'
                },
                {
                  title: 'Communicate Effectively',
                  description: 'Know your message and deliver it with substance, consider and clarity at all times'
                }
              ]
            }
          ],
          
          // AI Connection
          aiConnection: 'These same interaction principles that built our family culture guide how we learn AI together. When someone struggles with new technology, we lean into discomfort and listen as allies. When AI brings uncertainty, we assume good intent and connect on a personal level. This is how Kaspar family approaches innovation - together.',
          
          // Common Concerns
          concerns: [
            {
              question: 'What if I\'m not tech-savvy?',
              answer: 'We join you in learning, no judgment about starting points'
            },
            {
              question: 'What if I make mistakes?',
              answer: 'We embrace accountability together and continuously improve as a team'
            },
            {
              question: 'What if AI changes my job?',
              answer: 'We practice can-if thinking and act with journey to find solutions together'
            },
            {
              question: 'What if I can\'t keep up?',
              answer: 'We assume good intent and connect on a personal level to support each other'
            }
          ],
          
          // Family Culture Examples
          examples: [
            {
              icon: 'helping',
              story: 'During COVID, office staff joined factory workers making ventilator baskets - no judgment, just joining together'
            },
            {
              icon: 'teaching',
              story: 'When new equipment arrived, experienced operators became teachers, sharing knowledge with patience and kindness'
            },
            {
              icon: 'trophy',
              story: 'Every challenge becomes a family challenge, every success becomes a family celebration'
            }
          ],
          
          // Call to Action
          callToAction: 'Our Skills Academy awaits where you\'ll discover how our family approach makes AI learning feel natural and supportive. No one learns alone at Kaspar - we\'re all guides for each other.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'community-center');
    
    if (error) {
      console.error('Error updating Job Junction:', error);
    } else {
      console.log('✅ Successfully updated Job Junction content!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

updateJobJunction();