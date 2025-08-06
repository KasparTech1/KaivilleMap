import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Compass, UsersRound, Handshake, ShieldCheck, Heart, HelpingHand, GraduationCap, Trophy, School, Map as MapIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useCMSContent } from '../hooks/useCMSContent';
import { EditButton } from '../components/cms/EditButton';

export const JobJunctionPage: React.FC = () => {
  const { content: cmsContent, loading } = useCMSContent('building', 'community-center', {});

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1f4e79] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1f4e79] text-lg">Gathering the community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
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
                      Map
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/heritage_center" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (1) Stewardship Hall
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/learning_lodge" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (2) SKILLS Academy
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/city_hall" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (3) City Hall
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/celebration_station" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (4) Innovation Plaza
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/trading_post" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (5) Trading Post
                    </Link>
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
      <div className="h-[500px] relative overflow-hidden bg-gradient-to-br from-[#1f4e79] to-[#3d5a80]">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="container mx-auto px-6 h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between relative z-10">
          <div className="max-w-5xl text-center lg:text-left">
            <p className="text-lg text-white/80 mb-2">Stop 2 of 5</p>
            <h1 className="text-4xl lg:text-5xl font-serif text-white mb-4 font-bold">
              {cmsContent.title || 'JOB Junction'}
            </h1>
            <div className="bg-black bg-opacity-20 rounded-lg px-4 py-2 inline-block mb-4 lg:mb-6">
              <h2 className="text-2xl lg:text-3xl font-serif text-[#D4AF37]">
                {cmsContent.subtitle || 'Where We Choose to Join, Not Judge'}
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-white italic font-serif mb-2 max-w-3xl mx-auto lg:mx-0">
              {cmsContent.heroQuote?.text || '"You felt like you were a part of this family, that it wasn\'t just a work environment. This was like your second family."'}
            </p>
            <p className="text-lg text-[#D4AF37]">
              {cmsContent.heroQuote?.author || '- Arthur Kaspar'}
            </p>
          </div>
          <div className="mt-6 lg:mt-0 lg:block">
            <img 
              className="h-[250px] lg:h-[400px] w-auto drop-shadow-2xl mx-auto scale-[1.4] lg:scale-100"
              src="https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/join-junction-070325a.svg"
              alt="JOB Junction Building"
            />
          </div>
        </div>
      </div>

      {/* Culture in Action Section */}
      {cmsContent.culture && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl text-[#1f4e79] mb-8 font-serif">{cmsContent.culture.title}</h2>
              <div className="bg-[#9CAF88] bg-opacity-10 p-8 rounded-lg shadow-lg">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {cmsContent.culture.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How We Interact Framework Section */}
      {cmsContent.framework && (
        <div className="py-16 bg-[#F5F5DC]">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">How We Interact Framework</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {cmsContent.framework.map((pillar: any, index: number) => {
                  const icons: { [key: string]: any } = {
                    handshake: Handshake,
                    shield: ShieldCheck,
                    heart: Heart
                  };
                  const Icon = icons[pillar.icon] || Handshake;
                  const colors = ['#1f4e79', '#9CAF88', '#D4AF37'];
                  
                  return (
                    <Card key={index} className="bg-white p-6">
                      <div className="text-center mb-6">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ backgroundColor: colors[index] }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl text-[#1f4e79] font-serif">{pillar.title}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {pillar.principles.map((principle: any, pIndex: number) => (
                          <div 
                            key={pIndex} 
                            className="border-l-4 p-4 hover:bg-opacity-5 cursor-pointer transition"
                            style={{ 
                              borderLeftColor: colors[index],
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${colors[index]}10`}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <h4 className="font-semibold text-[#1f4e79] mb-2">{principle.title}</h4>
                            <p className="text-sm text-gray-600">{principle.description}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI + Culture Connection Section */}
      {cmsContent.aiConnection && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">AI + Culture Connection</h2>
              <div className="bg-[#1f4e79] text-white p-8 rounded-lg shadow-lg">
                <p className="text-lg leading-relaxed text-center">
                  {cmsContent.aiConnection}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Reassurance Section */}
      {cmsContent.concerns && (
        <div className="py-16 bg-[#F5F5DC]">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">Common Concerns About AI Learning</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cmsContent.concerns.map((concern: any, index: number) => (
                  <Card key={index} className="bg-white p-6 hover:shadow-lg transition">
                    <h3 className="text-xl text-[#1f4e79] mb-3 font-semibold">{concern.question}</h3>
                    <p className="text-gray-700">{concern.answer}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Family Culture Examples Section */}
      {cmsContent.examples && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">Family Culture in Action</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {cmsContent.examples.map((example: any, index: number) => {
                  const icons: { [key: string]: any } = {
                    helping: HelpingHand,
                    teaching: GraduationCap,
                    trophy: Trophy
                  };
                  const Icon = icons[example.icon] || HelpingHand;
                  const bgColors = ['bg-[#9CAF88]', 'bg-[#1f4e79]', 'bg-[#D4AF37]'];
                  
                  return (
                    <div key={index} className={`${bgColors[index]} bg-opacity-10 p-6 rounded-lg shadow-md`}>
                      <div className={`w-12 h-12 ${bgColors[index]} rounded-full flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-gray-700 italic">
                        "{example.story}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Journey Section */}
      <div className="py-16 bg-[#1f4e79] text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute top-0 right-0 opacity-10">
              <GraduationCap className="w-36 h-36" />
            </div>
            <h2 className="text-4xl mb-6 font-serif">Ready to start learning together?</h2>
            <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto">
              {cmsContent.callToAction || 'Our Skills Academy awaits where you\'ll discover how our family approach makes AI learning feel natural and supportive. No one learns alone at Kaspar - we\'re all guides for each other.'}
            </p>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
              <Link to="/building/learning_lodge">
                <Button className="bg-white text-[#1f4e79] hover:bg-[#F5F5DC] text-lg px-8 py-4">
                  <School className="mr-2" /> Continue to next stop - SKILLS Academy
                </Button>
              </Link>
              <Link to="/">
                <Button className="bg-white/20 text-white border-2 border-white hover:bg-white/30 text-lg px-8 py-4">
                  <MapIcon className="mr-2" /> Return to Town Map
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
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Culture</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Join vs Judge</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Own Your Area</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Be Kind</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Family Stories</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Explore</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition">
                    Map
                  </Link>
                </li>
                <li>
                  <Link to="/building/heritage_center" className="text-gray-400 hover:text-white transition">
                    Stewardship Hall
                  </Link>
                </li>
                <li>
                  <Link to="/building/learning_lodge" className="text-gray-400 hover:text-white transition">
                    SKILLS Academy
                  </Link>
                </li>
                <li>
                  <Link to="/building/city_hall" className="text-gray-400 hover:text-white transition">
                    City Hall
                  </Link>
                </li>
                <li>
                  <Link to="/building/celebration_station" className="text-gray-400 hover:text-white transition">
                    Innovation Plaza
                  </Link>
                </li>
                <li>
                  <Link to="/building/trading_post" className="text-gray-400 hover:text-white transition">
                    Trading Post
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
      <EditButton editPath="/admin/building/community-center" label="Edit JOB Junction" />
    </div>
  );
};