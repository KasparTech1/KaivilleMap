import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with production values
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA3ODcsImV4cCI6MjA2Njg2Njc4N30.Rv05YRSTAOcv1rDpaB13uyno8RgHDU_XIldZP1-d7cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateFormattedContent() {
  try {
    console.log('Updating building content with improved formatting...\n');

    // Update Stewardship Hall
    const { error: error1 } = await supabase
      .from('simple_content')
      .update({ 
        content: {
          title: 'Stewardship Hall',
          subtitle: 'Faithful Innovation Since 1898',
          heroQuote: '"We don\'t truly own what we\'re responsible for - we manage what\'s entrusted to us for future generations."',
          description: 'Welcome to Stewardship Hall, where Kaspar\'s 125-year legacy of faithful stewardship meets the future of AI. This is where our story begins - not with technology, but with our timeless mission of stewardship.',
          sections: [
            {
              title: 'Our Transformation Legacy',
              content: `For **125 years**, Kaspar has been "rebirthed multiple times." Each transformation asked the same question: **"How do we best steward what we've been given?"**

### Our Journey Through Time

• **1898** - Wire baskets for a growing America
• **1920** - Automotive parts for the motor age
• **1970s** - Truck accessories for the transport boom
• **2000s** - Precious metals for the digital economy
• **Today** - AI for the future of work

AI is no different. It's a **God-given resource** entrusted to our generation. We're not replacing people - we're amplifying their God-given talents, just like welding robots in the '90s made our welders more precise, not obsolete.`
            },
            {
              title: 'Interactive Timeline',
              content: `### Explore Our Legacy

Touch each decade marker below to discover how innovation has always been part of our stewardship mission:

• **Interact** with 125 years of transformation
• **Discover** the patterns of faithful innovation
• **See** how each generation built on the last
• **Find** your place in the story

The timeline ends with today - where **you** come in to write the next chapter.`
            },
            {
              title: 'Your Stewardship Pledge',
              content: `As you begin your AI journey, commit to responsible stewardship:

### The Stewardship Promise

**I pledge to:**
• Use AI to enhance our mission, not replace it
• Amplify human talents, not diminish them
• Create value for future generations
• Honor the legacy while embracing innovation

You're not just learning a tool; you're **continuing a 125-year legacy**.`
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
          description: 'Welcome to Job Junction, where we practice our engagement framework that makes Kaspar feel like family. Here\'s how we treat each other - especially when facing new challenges like AI.',
          sections: [
            {
              title: 'The JOB Framework',
              content: `Our proven framework for working together through any transformation:

### J - Join, Not Judge

**We come together as family.** When COVID hit and we needed to make ventilator baskets, office folks joined factory workers. No judgment, just joining.

With AI, it's the same:
• You bring **experience**
• AI brings **processing power**
• Together, that's where **magic happens**

### O - Own Your Area

**Take responsibility for your AI journey:**
• Define your area of ownership
• Commit to making it better
• You know what needs doing better than anyone else
• Start small, think big

### B - Be Kind

**Support each other through the learning process:**
• Share your wins openly
• Help with challenges graciously
• Remember we're all learning together
• Every expert was once a beginner`
            },
            {
              title: 'Community Spaces',
              content: `### Connect and Grow Together

**Partner Finder**
Match with AI journey companions who share your goals and challenges.

**Story Wall**
"I Was Skeptical Too" - real testimonials from colleagues who've made the journey.

**Mentorship Program**
Connect with AI champions who've walked this path and want to help you succeed.

**Team Spaces**
Department-specific support groups where you can share relevant wins and challenges.`
            },
            {
              title: 'Fear-to-Curiosity Transformation',
              content: `### Transform Your Mindset

Use our interactive tool to transform common AI anxieties into curiosity:

**Common Fears → New Perspectives**
• "I'll be replaced" → "I'll be enhanced"
• "It's too complex" → "I'll start simple"
• "I'm too old" → "I bring wisdom AI needs"
• "I can't code" → "I don't need to"

Remember: **"I can't" becomes "I did!"** when we practice the JOB way together.`
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
          title: 'Skills Academy',
          subtitle: 'Enhance Your SKILLS with AI',
          heroQuote: '"From Swiss Guards to Texas Aggies to AI Pioneers - we\'ve always valued learning and service."',
          description: 'Welcome to Skills Academy, our hands-on workshop where the Kaspar SKILLS framework meets AI capabilities. This isn\'t a classroom - it\'s a maker space where you learn by doing, not just studying.',
          sections: [
            {
              title: 'The Workshop Experience',
              content: `Our gear tower symbolizes systems thinking - all parts of SKILLS working together, enhanced by AI.

### SKILLS + AI = Amplified Results

**S - Safety**
• AI-enhanced hazard detection
• Predictive incident prevention
• Real-time safety monitoring

**K - Kaizen**
• Accelerated improvement cycles
• Data-driven optimization
• Automated tracking of gains

**I - Investing**
• Smart resource allocation
• ROI prediction models
• Cost-benefit analysis tools

**L - Leadership**
• AI-assisted coaching
• Performance insights
• Development tracking

**L - LDM (Lean Daily Management)**
• Real-time visual dashboards
• Automated metric tracking
• Instant anomaly detection

**S - SDP (Strategic Deployment Planning)**
• Predictive planning tools
• Scenario modeling
• Resource optimization`
            },
            {
              title: 'Hands-On Learning Paths',
              content: `### Choose Your Journey

**By Role Level (1-10)**
Customized learning based on your current position and responsibilities.

• **Levels 1-3:** Basic AI literacy and simple tools
• **Levels 4-6:** Department-specific applications
• **Levels 7-10:** Strategic AI implementation

**The Golden Rule:** If you can explain a task to a new employee, you can work with AI.

### KAI Kaizen Training

The **10-step implementation process** that's already part of your SKILLS manual:

1. Identify the opportunity
2. Define the current state
3. Envision the future state
4. Plan the implementation
5. Execute the pilot
6. Measure the results
7. Standardize the process
8. Train the team
9. Monitor performance
10. Celebrate and share

AI isn't foreign - it's the **'K' in SKILLS**.`
            },
            {
              title: 'Live Workshop Environment',
              content: `### See It, Try It, Apply It

Through our open garage doors and windows, you'll experience:

**Interactive Workbenches**
• Hands-on AI tools configured for your role
• Safe sandbox environments
• Real company data (anonymized)

**Live Demonstrations**
• Daily skill-building sessions
• Problem-solving workshops
• Success story presentations

**Peer Learning Groups**
• Small teams (4-6 people)
• Similar roles and challenges
• Collaborative problem-solving

**Success Stories**
• **Bob (Maintenance):** Learned predictive maintenance AI in one afternoon
• **Sarah (Accounting):** Automated 3 hours of daily reporting
• **Carlos (Quality):** Reduced inspection time by 50%`
            },
            {
              title: 'Learning Resources',
              content: `### Your Toolkit for Success

**Skills Assessment Tool**
Identify your starting point and create a personalized learning path.

**Interactive Tutorials**
• Step-by-step guides
• Video walkthroughs
• Practice exercises

**Practice Sandbox**
Safe environment for experimentation with no risk to real data.

**Certification Paths**
• **Bronze Level:** AI Fundamentals (2 hours)
• **Silver Level:** Role-Specific Applications (8 hours)
• **Gold Level:** AI Champion Certification (20 hours)

**Support Resources**
• 24/7 help chat
• Weekly office hours
• Peer mentorship matching`
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
          description: 'Welcome to Innovation Plaza, our corporate showcase arena where you present your AI wins and celebrate peer innovations. This is where ideas become reality and achievements get the recognition they deserve.',
          sections: [
            {
              title: 'The Showcase Arena',
              content: `Step into our modern demonstration arena - the heart of innovation at Kaspar.

### What Happens Here

• **Live Presentations** - Colleagues demo their AI breakthroughs
• **Interactive Displays** - Try out successful implementations
• **Recognition Events** - Monthly innovation celebrations
• **Knowledge Sharing** - Detailed how-to guides for replication

This is where the **magic becomes visible**.`
            },
            {
              title: 'Real Results, Real People',
              content: `### Current Wins on Display

**Quality & Efficiency**
• **50%** reduction in quality inspection time
• **3x** faster customer response times
• **75%** fewer data entry errors

**Cost Savings**
• **$100K** saved through predictive maintenance
• **$50K** quarterly savings from smart analysis
• **30%** reduction in material waste

**Time Savings**
• **Juan (Shipping):** Saves 2 hours daily with AI automation
• **Maria (Finance):** Reduced monthly reporting from 3 days to 3 hours
• **Mike (Operations):** Eliminated 5 hours of weekly scheduling

### By The Numbers
• **127** AI implementations this year
• **$1.2M** in documented savings
• **850** hours saved monthly`
            },
            {
              title: 'Your Innovation Stage',
              content: `This isn't just for viewing - it's for **participating**.

### Every Innovation Started With...

Someone who said: **"I wonder if there's a better way."**

Someone just like you.

### Remember the QUAD Bed?

Nobody thought shipping could be revolutionized until we did it:
• **Before:** 2 beds per day
• **After:** 25 beds per day
• **Result:** Industry game-changer

**Your experience + AI = Solutions nobody else can imagine**

### Start Your Innovation

1. **Identify** a repetitive task
2. **Imagine** it done better
3. **Implement** with AI tools
4. **Share** your success here`
            },
            {
              title: 'Interactive Elements',
              content: `### Explore and Engage

**Live ROI Dashboard**
Real-time value creation metrics across all subsidiaries
• Total savings this month
• Hours returned to value-add work
• Quality improvements
• Customer satisfaction gains

**Success Showcase**
Filter innovations by:
• Department or subsidiary
• SKILLS component
• Problem type
• ROI range

**Innovation Gallery**
Visual before/after comparisons:
• Process flow improvements
• Time savings visualizations
• Quality metric improvements
• Cost reduction charts

**Idea Submission Portal**
"What's Your Wire Basket?"
• Submit your innovation idea
• Get matched with AI tools
• Connect with mentors
• Track implementation progress

**Recognition Wall**
AI Champions Hall of Fame
• Monthly innovators
• Breakthrough implementations
• Team achievements
• Milestone celebrations`
            },
            {
              title: 'Monthly Spotlight',
              content: `### December's Featured Innovation

**Automated Quality Inspection**
*By: Jennifer Chen, Quality Team*

**The Challenge:** Manual inspection of 500+ parts daily

**The Solution:** AI-powered visual inspection system

**The Results:**
• **80%** faster inspections
• **99.9%** accuracy (up from 96%)
• **2 inspectors** now manage what took 5
• **$75K** annual savings

**Implementation Guide Available**
Complete step-by-step instructions so you can replicate this success in your area.

### Share Your Story
Every month, we feature new innovations. Could yours be next?`
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
          description: 'Welcome to Kaizen Tower, our forward-looking lighthouse showing the endless possibilities of AI-enhanced continuous improvement. From our observation deck, you can see forever - and that\'s exactly the point.',
          sections: [
            {
              title: 'The View from Here',
              content: `Look back at your journey through Kaiville:

### Your Journey So Far

• **Stewardship Hall** - Understanding our heritage
• **Job Junction** - Joining together as family
• **Skills Academy** - Building new capabilities
• **Innovation Plaza** - Creating tangible value

But here's the truth: **We never arrive.**

### The Kaizen Mindset

Kaizen means continuous improvement.

**Always better, never best.**

From our observation deck, you see:
• Horizons of possibility
• Paths yet to explore
• Mountains yet to climb
• Value yet to create`
            },
            {
              title: 'Generational Rebirth',
              content: `### Every Generation Rebirths This Company

**The Wire Basket Generation**
*1898-1920*
• Saw opportunity in discarded wire
• Built an industry from nothing
• Set the foundation of stewardship

**The Automotive Generation**
*1920-1970*
• Pivoted to serve the motor age
• Grew with American mobility
• Expanded our reach

**The Precious Metals Generation**
*2000s*
• Embraced the digital economy
• Found new value streams
• Proved adaptability

**The AI Generation**
***That's You***
• Writing the next chapter
• Amplifying human potential
• Creating tomorrow's legacy

### Your Turn to Transform

You're not just using new tools. You're part of a **125-year tradition** of transformation.`
            },
            {
              title: 'Acceleration, Not Coasting',
              content: `See those horizons from our observation deck? That's where we're headed.

### The Future We're Building

**New Possibilities**
• AI-enhanced decision making
• Predictive operations
• Automated routine tasks
• Amplified human creativity

**Better Customer Service**
• Instant response capabilities
• Predictive need fulfillment
• Personalized experiences
• Proactive problem solving

**More Meaningful Work**
• Less time on repetitive tasks
• More time for innovation
• Focus on relationships
• Emphasis on creativity

### The Acceleration Principle

At 125 years old, we're not slowing down. We're speeding up.

**Your ideas + AI = Value we can't even imagine yet**`
            },
            {
              title: 'Future-Focused Resources',
              content: `### Your Continuous Learning Hub

**Vision Center**
Long-term AI roadmap for Kaspar
• 3-year strategic plan
• Emerging technology radar
• Investment priorities
• Success metrics

**Trend Observatory**
Stay ahead of the curve
• Industry AI applications
• New tool evaluations
• Best practice updates
• Competitive intelligence

**Advanced Training**
Next-level AI applications
• Machine learning basics
• Predictive analytics
• Process automation
• Custom AI solutions

**Innovation Lab**
Experimental projects
• Pilot programs
• Beta testing opportunities
• Cross-functional teams
• Breakthrough initiatives

**Mentorship Hub**
Become an AI guide
• Champion certification
• Teaching resources
• Peer coaching tools
• Recognition programs

**Strategic Planning Tools**
AI-enhanced planning
• Scenario modeling
• Resource optimization
• Risk assessment
• ROI forecasting`
            },
            {
              title: 'Your Continuous Journey',
              content: `### The Future Isn't Something That Happens to Us

**It's something we build. Together. One improvement at a time.**

And it starts with your first idea.

### What Problem Have You Always Wanted to Solve?

Think about:
• That task that takes too long
• That process that frustrates everyone
• That report nobody reads
• That meeting that could be an email

**Now imagine it solved.**

### Your Next Steps

1. **Identify** one problem in your area
2. **Visit** Skills Academy to learn the tools
3. **Implement** your solution
4. **Share** at Innovation Plaza
5. **Repeat** - because Kaizen never ends

### Remember

You're not just an employee. You're a:
• **Steward** of our legacy
• **Member** of our family
• **Student** of continuous improvement
• **Innovator** in your own right
• **Author** of the next chapter

**The best time to plant a tree was 20 years ago.**
**The second best time is now.**`
            }
          ],
          callToAction: 'You\'ve completed the Kaiville journey, but your AI story is just beginning. Return to any building to deepen your knowledge, or visit Job Junction to share your first ideas with the community.'
        }
      })
      .eq('page_type', 'building')
      .eq('page_id', 'kasp_tower');
    
    if (error5) console.error('Error updating Kaizen Tower:', error5);
    else console.log('✅ Updated Kaizen Tower');

    console.log('\n✅ All building content updated with improved formatting!');
  } catch (error) {
    console.error('Error updating building content:', error);
  }
}

updateFormattedContent();