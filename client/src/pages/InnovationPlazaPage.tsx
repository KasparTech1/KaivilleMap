import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Compass, Clock, Medal, Shield, Users, DollarSign, Lightbulb, Rocket, TowerControl } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useCMSContent } from '../hooks/useCMSContent';
import { EditButton } from '../components/cms/EditButton';

export const InnovationPlazaPage: React.FC = () => {
  const { content: cmsContent, loading } = useCMSContent('building', 'celebration_station', {});

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1f4e79] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1f4e79] text-lg">Loading innovations...</p>
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
                    <Link to="/building/community-center" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (2) JOB Junction
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/learning_lodge" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (3) SKILLS Academy
                    </Link>
                  </li>
                  <li>
                    <span className="text-[#1f4e79] font-bold border-b-2 border-[#D4AF37] pb-1">
                      (4) Innovation Plaza
                    </span>
                  </li>
                  <li>
                    <Link to="/building/kasp_tower" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (5) Kaizen Tower
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
      <div className="h-[500px] relative overflow-hidden bg-gradient-to-r from-[#1f4e79] to-[#4169E1]">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container mx-auto px-6 h-full flex items-center justify-between relative z-10">
          <div className="max-w-5xl">
            <p className="text-lg text-white/80 mb-2">Stop 4 of 5</p>
            <h1 className="text-5xl font-serif text-white mb-4 font-bold">
              {cmsContent.title || 'Innovation Plaza'}
            </h1>
            <div className="bg-black bg-opacity-20 rounded-lg px-4 py-2 inline-block mb-6">
              <h2 className="text-3xl font-serif text-[#D4AF37]">
                {cmsContent.subtitle || 'Where Ideas Take Flight'}
              </h2>
            </div>
            <p className="text-xl text-white italic font-serif max-w-3xl">
              {cmsContent.heroQuote || '"Your experience is the secret ingredient. AI has the recipes, but you know what tastes right."'}
            </p>
          </div>
          <div className="hidden lg:block">
            <img 
              className="h-[400px] w-auto drop-shadow-2xl"
              src="https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/innovation_plaza_01.svg"
              alt="Innovation Plaza Building"
            />
          </div>
        </div>
      </div>

      {/* Innovation Philosophy Section */}
      {cmsContent.philosophy && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl text-[#1f4e79] mb-8 font-serif">{cmsContent.philosophy.title}</h2>
              <div className="bg-[#87CEEB] bg-opacity-10 p-8 rounded-lg shadow-lg">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {cmsContent.philosophy.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Categories Section */}
      {cmsContent.successCategories && (
        <div className="py-16 bg-[#F5F5DC]">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">Success Categories</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cmsContent.successCategories.map((category: any, index: number) => {
                  const icons: { [key: string]: any } = {
                    clock: Clock,
                    medal: Medal,
                    shield: Shield,
                    users: Users,
                    dollar: DollarSign,
                    lightbulb: Lightbulb
                  };
                  const Icon = icons[category.icon] || Clock;
                  const colors: { [key: string]: string } = {
                    gold: '#D4AF37',
                    green: '#32CD32',
                    blue: '#1f4e79',
                    sky: '#87CEEB',
                    sage: '#9CAF88',
                    brown: '#8B6914'
                  };
                  
                  return (
                    <Card key={index} className={`bg-white p-6 hover:shadow-xl transition border-l-4`} style={{ borderLeftColor: colors[category.color] || '#1f4e79' }}>
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: colors[category.color] || '#1f4e79' }}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl text-[#1f4e79] font-semibold">{category.title}</h3>
                      </div>
                      <p className="text-gray-600">{category.description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Success Stories Section */}
      {cmsContent.successStories && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">Featured Success Stories</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {cmsContent.successStories.map((category: any, index: number) => {
                  const bgColors = ['bg-[#1f4e79]', 'bg-[#D4AF37]', 'bg-[#32CD32]'];
                  return (
                    <div key={index} className={`${bgColors[index]} bg-opacity-5 p-6 rounded-lg`}>
                      <h3 className="text-2xl text-[#1f4e79] mb-6 font-serif">{category.title}</h3>
                      <div className="space-y-4">
                        {category.stories.map((story: string, storyIndex: number) => (
                          <div key={storyIndex} className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-gray-700">"{story}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impact Metrics Section */}
      {cmsContent.metrics && (
        <div className="py-16 bg-[#1f4e79] text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-center mb-12 font-serif">Company-Wide AI Benefits</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {cmsContent.metrics.map((metric: any, index: number) => (
                  <div key={index} className="text-center bg-white bg-opacity-10 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-[#D4AF37] mb-2">{metric.value}</div>
                    <p className="text-sm">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started Section */}
      {cmsContent.gettingStarted && (
        <div className="py-16 bg-[#F5F5DC]">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl text-[#1f4e79] mb-8 font-serif">{cmsContent.gettingStarted.title}</h2>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {cmsContent.gettingStarted.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recognition Wall Section */}
      {cmsContent.champions && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">AI Champions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cmsContent.champions.map((champion: any, index: number) => (
                  <Card key={index} className="bg-[#D4AF37] bg-opacity-10 p-6 text-center">
                    <div className="w-16 h-16 bg-[#1f4e79] rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                      {champion.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <h3 className="text-lg font-semibold text-[#1f4e79]">{champion.name}</h3>
                    <p className="text-sm text-gray-600">{champion.achievement}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Value Calculator Section */}
      {cmsContent.valueCalculator && (
        <div className="py-16 bg-[#9CAF88] bg-opacity-10">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl text-[#1f4e79] mb-8 font-serif">Value Calculator</h2>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <p className="text-lg text-gray-700 mb-6">
                  {cmsContent.valueCalculator.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cmsContent.valueCalculator.timeframes.map((timeframe: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-[#D4AF37] mb-2">{timeframe.hours}</div>
                      <p className="text-sm text-gray-600">{timeframe.period}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Journey Section */}
      <div className="py-16 bg-[#1f4e79] text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="relative max-w-4xl mx-auto">
            <h2 className="text-4xl mb-6 font-serif">Inspired by these successes?</h2>
            <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto">
              {cmsContent.callToAction || 'Kaizen Tower awaits to show you the future possibilities and help you envision your own AI journey at Kaspar.'}
            </p>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
              <Link to="/building/kasp_tower">
                <Button className="bg-white text-[#1f4e79] hover:bg-[#F5F5DC] text-lg px-8 py-4">
                  <TowerControl className="mr-2" /> Continue to next stop - Kaizen Tower
                </Button>
              </Link>
              <Link to="/">
                <Button className="bg-white/20 text-white border-2 border-white hover:bg-white/30 text-lg px-8 py-4">
                  Return to Town Map
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
                Celebrating innovation and success through AI-powered transformation.
              </p>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Success Stories</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Manufacturing Wins</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Office Efficiency</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Safety Improvements</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">AI Champions</span></li>
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
                  <Link to="/building/community-center" className="text-gray-400 hover:text-white transition">
                    JOB Junction
                  </Link>
                </li>
                <li>
                  <Link to="/building/learning_lodge" className="text-gray-400 hover:text-white transition">
                    SKILLS Academy
                  </Link>
                </li>
                <li>
                  <Link to="/building/celebration_station" className="text-gray-400 hover:text-white transition">
                    Innovation Plaza
                  </Link>
                </li>
                <li>
                  <Link to="/building/kasp_tower" className="text-gray-400 hover:text-white transition">
                    Kaizen Tower
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
      <EditButton editPath="/admin/building/celebration_station" label="Edit Innovation Plaza" />
    </div>
  );
};