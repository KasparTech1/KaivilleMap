import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBuildingContent() {
  try {
    console.log('Updating building content in CMS...\n');

    // Update Stewardship Hall
    const { error: error1 } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Stewardship Hall',
          subtitle: 'Faithful Innovation Since 1898',
          heroQuote: '"We don\'t truly own what we\'re responsible for - we manage what\'s entrusted to us for future generations."',
          description: 'Welcome to Stewardship Hall, where Kaspar\'s 125-year legacy of faithful stewardship meets the future of AI.',
          sections: [
            {
              title: 'Our Transformation Legacy',
              content: 'For 125 years, Kaspar has been "rebirthed multiple times." From wire baskets in 1898 to automotive parts in 1920, truck accessories in the 1970s, to precious metals in the 2000s. Each transformation asked the same question: "How do we best steward what we\'ve been given?"\n\nAI is no different. It\'s a God-given resource entrusted to our generation. We\'re not replacing people - we\'re amplifying their God-given talents, just like welding robots in the \'90s made our welders more precise, not obsolete.'
            },
            {
              title: 'Interactive Timeline',
              content: 'Explore our 125-year journey of continuous transformation. Touch each decade to discover how innovation has always been part of our stewardship mission. The timeline ends with today - where you come in to write the next chapter.'
            },
            {
              title: 'Your Stewardship Pledge',
              content: 'As you begin your AI journey, commit to responsible stewardship. AI enhances our mission - it doesn\'t replace it. You\'re not just learning a tool; you\'re continuing a legacy.'
            }
          ],
          callToAction: 'Ready to see how we do this together? Your journey continues at Job Junction, where we practice the Kaspar way of working together.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'heritage_center');
    
    if (error1) console.error('Error updating Stewardship Hall:', error1);
    else console.log('✅ Updated Stewardship Hall');

    // Update Job Junction
    const { error: error2 } = await supabase
      .from('simple_content')
      .update({ 
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
      })
      .eq('page_type', 'building')
      .eq('page_id', 'community-center');
    
    if (error2) console.error('Error updating Job Junction:', error2);
    else console.log('✅ Updated Job Junction');

    // Update Skills Academy
    const { error: error3 } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Skills University',
          subtitle: 'Enhance Your SKILLS with AI',
          heroQuote: '"From Swiss Guards to Texas Aggies to AI Pioneers - we\'ve always valued learning and service."',
          description: 'Welcome to Skills Academy, our hands-on workshop where the Kaspar SKILLS framework meets AI capabilities.',
          sections: [
            {
              title: 'The Workshop Experience',
              content: 'Our gear tower symbolizes systems thinking - all parts of SKILLS working together, enhanced by AI. In our workshop, you\'ll discover how AI makes each SKILLS component stronger:\n\n• Safety: AI-enhanced hazard detection and prevention\n• Kaizen: Accelerated continuous improvement cycles\n• Investing: Data-driven decision making\n• Leadership: AI-assisted coaching and development\n• LDM: Real-time visual management dashboards\n• SDP: Predictive strategic planning tools'
            },
            {
              title: 'Hands-On Learning Paths',
              content: '**By Role Level (1-10):** Customized learning based on your current position and responsibilities. If you can explain a task to a new employee, you can work with AI.\n\n**KAI Kaizen Training:** The 10-step implementation process that\'s already part of your SKILLS manual. AI isn\'t foreign - it\'s the \'K\' in SKILLS.'
            },
            {
              title: 'Live Workshop Environment',
              content: 'Through our open garage doors and windows, you\'ll see:\n• Interactive workbenches with AI tools\n• Real-time demonstrations and practice sessions\n• Peer learning groups working on actual problems\n• Success stories from Bob (maintenance) and Sarah (accounting) who learned in one afternoon'
            },
            {
              title: 'Learning Resources',
              content: '• Skills assessment tool to identify your starting point\n• Interactive tutorials for hands-on practice\n• Practice sandbox for safe experimentation\n• Certification paths: Bronze, Silver, Gold levels'
            }
          ],
          callToAction: 'Ready to see what others have created? Visit Innovation Plaza where real people showcase real wins with AI.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'learning_lodge');
    
    if (error3) console.error('Error updating Skills Academy:', error3);
    else console.log('✅ Updated Skills Academy');

    // Update Innovation Plaza
    const { error: error4 } = await supabase
      .from('simple_content')
      .update({ 
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
      })
      .eq('page_type', 'building')
      .eq('page_id', 'celebration_station');
    
    if (error4) console.error('Error updating Innovation Plaza:', error4);
    else console.log('✅ Updated Innovation Plaza');

    // Update Kaizen Tower
    const { error: error5 } = await supabase
      .from('simple_content')
      .update({ 
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
      })
      .eq('page_type', 'building')
      .eq('page_id', 'kasp_tower');
    
    if (error5) console.error('Error updating Kaizen Tower:', error5);
    else console.log('✅ Updated Kaizen Tower');

    console.log('\n✅ All building content updated successfully!');
  } catch (error) {
    console.error('Error updating building content:', error);
  }
}

updateBuildingContent();