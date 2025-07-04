import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Compass, TowerControl, Wrench, UserCog, GraduationCap, Lightbulb, Factory, Map, Headset, Share2, Rocket } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useCMSContent } from '../hooks/useCMSContent';
import { EditButton } from '../components/cms/EditButton';

export const KaizenTowerPage: React.FC = () => {
  const { content: cmsContent, loading } = useCMSContent('building', 'kasp_tower', {});

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#4169E1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Ascending to the tower...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#4169E1]">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="no-underline">
                <h1 className="text-2xl text-[#1f4e79] font-serif font-bold hover:text-[#D4AF37] transition cursor-pointer">Kaiville</h1>
              </Link>
              <nav className="ml-10 hidden md:block">
                <ul className="flex space-x-8">
                  <li>
                    <Link to="/" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/heritage_center" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      Stewardship Hall
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/community-center" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      Job Junction
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/learning_lodge" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      Skills Academy
                    </Link>
                  </li>
                  <li>
                    <span className="text-[#1f4e79] font-bold border-b-2 border-[#D4AF37] pb-1">
                      Kaizen Tower
                    </span>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90">
                  Return to Map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="h-[500px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
        <div className="container mx-auto px-6 h-full flex items-center justify-between relative z-10">
          <div className="max-w-5xl">
            <p className="text-lg text-white/80 mb-2">Stop 5 of 5</p>
            <h1 className="text-6xl font-serif text-white mb-4 font-bold">
              {cmsContent.title || 'Kaizen Tower'}
            </h1>
            <div className="bg-black bg-opacity-20 rounded-lg px-4 py-2 inline-block mb-6">
              <h2 className="text-3xl font-serif text-[#D4AF37]">
                {cmsContent.subtitle || 'Continuous Improvement Never Ends'}
              </h2>
            </div>
            <p className="text-xl text-white italic font-serif mb-2 max-w-3xl">
              {cmsContent.heroQuote?.text || '"At 125 years old, we\'re putting our foot on the accelerator, not coasting."'}
            </p>
            <p className="text-lg text-[#D4AF37]">
              {cmsContent.heroQuote?.author || '- Jason Kaspar'}
            </p>
          </div>
          <div className="hidden lg:block">
            <img 
              className="h-[400px] w-auto drop-shadow-2xl"
              src="https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/kaizen_tower_01.svg"
              alt="Kaizen Tower"
            />
          </div>
        </div>
      </div>

      {/* Observation Deck Section */}
      {cmsContent.observationDeck && (
        <div className="py-16 bg-white relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1f4e79] via-[#D4AF37] to-[#1f4e79]"></div>
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl text-[#1f4e79] mb-8 font-serif">{cmsContent.observationDeck.title}</h2>
              <div className="bg-gradient-to-r from-[#87CEEB] to-[#4169E1] text-white p-8 rounded-lg shadow-xl">
                <p className="text-lg leading-relaxed">
                  {cmsContent.observationDeck.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The Horizon Section */}
      {cmsContent.horizon && (
        <div className="py-16 bg-[#F5F5DC]">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">What We See Ahead</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cmsContent.horizon.map((item: any, index: number) => {
                  const icons: { [key: string]: any } = {
                    tools: Wrench,
                    userCog: UserCog,
                    graduation: GraduationCap,
                    lightbulb: Lightbulb,
                    factory: Factory
                  };
                  const Icon = icons[item.icon] || TowerControl;
                  const colors: { [key: string]: string } = {
                    blue: '#1f4e79',
                    gold: '#D4AF37',
                    sage: '#9CAF88',
                    deepBlue: '#4169E1',
                    purple: '#9333EA'
                  };
                  
                  return (
                    <Card key={index} className="bg-white p-6 hover:shadow-xl transition transform hover:-translate-y-2">
                      <div className="text-center mb-4">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ backgroundColor: colors[item.color] || '#1f4e79' }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <p className="text-gray-700 text-center">{item.description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continuous Improvement Section */}
      {cmsContent.continuousImprovement && (
        <div className="py-16 bg-[#1f4e79] text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl mb-8 font-serif">{cmsContent.continuousImprovement.title}</h2>
              <div className="bg-white bg-opacity-10 p-8 rounded-lg backdrop-blur-sm">
                <p className="text-lg leading-relaxed">
                  {cmsContent.continuousImprovement.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generational Perspective Section */}
      {cmsContent.generations && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">Five Generations of Innovation</h2>
              
              <div className="space-y-6">
                {cmsContent.generations.map((gen: any, index: number) => {
                  const colors = ['#8B6914', '#1f4e79', '#D4AF37', '#9CAF88', 'gradient'];
                  const isLast = index === cmsContent.generations.length - 1;
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center p-6 rounded-lg shadow-md ${
                        isLast ? 'bg-gradient-to-r from-[#4169E1] to-[#1f4e79] text-white' : 'bg-[#F5F5DC]'
                      }`}
                    >
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center mr-6 ${
                          isLast ? 'bg-[#D4AF37]' : ''
                        }`}
                        style={{ backgroundColor: isLast ? '' : colors[index] }}
                      >
                        <span className={`font-bold text-xl ${isLast ? 'text-[#1f4e79]' : 'text-white'}`}>
                          {gen.number}
                        </span>
                      </div>
                      <div>
                        <h3 className={`text-xl font-semibold mb-2 ${isLast ? '' : 'text-[#1f4e79]'}`}>
                          {gen.title}
                        </h3>
                        <p className={isLast ? '' : 'text-gray-700'}>{gen.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Your Role Section */}
      {cmsContent.yourRole && (
        <div className="py-16 bg-[#F5F5DC]">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl text-[#1f4e79] mb-8 font-serif">{cmsContent.yourRole.title}</h2>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {cmsContent.yourRole.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journey Continues Section */}
      {cmsContent.journeyContinues && (
        <div className="py-16 bg-gradient-to-r from-[#1f4e79] to-[#4169E1] text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl mb-8 font-serif">{cmsContent.journeyContinues.title}</h2>
              <div className="bg-white bg-opacity-10 p-8 rounded-lg backdrop-blur-sm">
                <p className="text-lg leading-relaxed">
                  {cmsContent.journeyContinues.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commitment to Action Section */}
      {cmsContent.commitment && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl text-[#1f4e79] mb-8 font-serif">{cmsContent.commitment.title}</h2>
              <div className="bg-[#D4AF37] bg-opacity-10 p-8 rounded-lg shadow-lg">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {cmsContent.commitment.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps Section */}
      {cmsContent.nextSteps && (
        <div className="py-16 bg-[#F5F5DC]">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">Begin Your AI Journey</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cmsContent.nextSteps.map((step: any, index: number) => {
                  const icons: { [key: string]: any } = {
                    map: Map,
                    graduation: GraduationCap,
                    headset: Headset,
                    share: Share2
                  };
                  const Icon = icons[step.icon] || Map;
                  const links: { [key: string]: string } = {
                    map: '/',
                    graduation: '/building/learning_lodge',
                    headset: '#',
                    share: '#'
                  };
                  
                  const content = (
                    <Card className="bg-white p-6 hover:shadow-xl transition transform hover:-translate-y-2 text-center cursor-pointer">
                      <Icon className="w-12 h-12 text-[#1f4e79] mx-auto mb-4" />
                      <h3 className="text-lg text-[#1f4e79] font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-700 text-sm">{step.description}</p>
                    </Card>
                  );
                  
                  return links[step.icon] === '#' ? (
                    <div key={index}>{content}</div>
                  ) : (
                    <Link key={index} to={links[step.icon] || '/'}>
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tower Beacon Section */}
      <div className="py-20 bg-gradient-to-t from-[#1f4e79] via-[#4169E1] to-[#87CEEB] text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-20 bg-[#D4AF37] opacity-50 animate-pulse"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <TowerControl className="w-24 h-24 text-[#D4AF37] mx-auto mb-6" />
            </div>
            <h2 className="text-5xl mb-8 font-serif">Welcome to Kaiville</h2>
            <p className="text-2xl mb-8">Let's build something amazing together.</p>
            <p className="text-xl text-[#D4AF37]">The view from here is just the beginning.</p>
            
            <div className="mt-12">
              <Link to="/">
                <Button className="bg-[#D4AF37] text-[#1f4e79] hover:bg-[#D4AF37]/90 text-lg px-10 py-4">
                  <Rocket className="mr-3" /> Begin Your Journey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl mb-4 font-serif font-bold text-[#D4AF37]">Kaiville</h3>
              <p className="text-gray-400">
                125 years of faithful stewardship, building a legacy for future generations.
              </p>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Innovation</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Continuous Improvement</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Future Vision</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">AI Integration</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Legacy Building</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Explore</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/building/heritage_center" className="text-gray-400 hover:text-white transition">
                    Stewardship Hall
                  </Link>
                </li>
                <li>
                  <Link to="/building/community-center" className="text-gray-400 hover:text-white transition">
                    Job Junction
                  </Link>
                </li>
                <li>
                  <Link to="/building/learning_lodge" className="text-gray-400 hover:text-white transition">
                    Skills Academy
                  </Link>
                </li>
                <li>
                  <Link to="/building/celebration_station" className="text-gray-400 hover:text-white transition">
                    Innovation Plaza
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Connect</h3>
              <p className="text-gray-400">
                © 2025 Kaspar Companies. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Edit Button */}
      <EditButton editPath="/admin/building/kasp_tower" label="Edit Kaizen Tower" />
    </div>
  );
};