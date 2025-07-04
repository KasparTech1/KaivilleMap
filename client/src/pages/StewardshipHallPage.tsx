import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Compass, Star, Building2, Truck, Coins, Cpu, Heart, Route, HandHeart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { useCMSContent } from '../hooks/useCMSContent';
import { EditButton } from '../components/cms/EditButton';

export const StewardshipHallPage: React.FC = () => {
  const { content: cmsContent, loading } = useCMSContent('building', 'heritage_center', {});
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false]);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = 300;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return <Star className="w-4 h-4" />;
      case 'building': return <Building2 className="w-4 h-4" />;
      case 'truck': return <Truck className="w-4 h-4" />;
      case 'coins': return <Coins className="w-4 h-4" />;
      case 'microchip': return <Cpu className="w-4 h-4" />;
      case 'hands-holding': return <HandHeart className="w-8 h-8" />;
      case 'route': return <Route className="w-8 h-8" />;
      case 'heart': return <Heart className="w-8 h-8" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1f4e79] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1f4e79] text-lg">Loading heritage...</p>
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
                <h1 className="text-2xl text-[#1f4e79] font-serif font-bold hover:text-[#D4AF37] transition cursor-pointer">KAIVILLE</h1>
              </Link>
              <nav className="ml-10 hidden md:block">
                <ul className="flex space-x-8">
                  <li>
                    <Link to="/" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <span className="text-[#1f4e79] font-bold border-b-2 border-[#D4AF37] pb-1">
                      Stewardship Hall
                    </span>
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
                </ul>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                <MapPin className="w-6 h-6" />
              </button>
              <button className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                <Compass className="w-6 h-6" />
              </button>
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
      <div className="h-[500px] relative overflow-hidden bg-gradient-to-br from-[#1f4e79] to-[#2d5a87]">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container mx-auto px-6 h-full flex items-center justify-between relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-serif text-white mb-4 font-bold">
              {cmsContent.title || 'Stewardship Hall'}
            </h1>
            <h2 className="text-3xl font-serif text-[#D4AF37] mb-6">
              {cmsContent.subtitle || '125 Years of Heritage & Values'}
            </h2>
            <p className="text-xl text-white mb-8 max-w-3xl font-light">
              {cmsContent.description}
            </p>
            <Button className="bg-[#D4AF37] text-[#1f4e79] hover:bg-[#D4AF37]/90 text-lg px-8 py-6">
              <Building2 className="mr-2" /> Explore Our Heritage
            </Button>
          </div>
          <div className="hidden lg:block">
            <img 
              className="h-[400px] w-auto drop-shadow-2xl"
              src="https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/stewardship_hall_01.svg"
              alt="Stewardship Hall Building"
            />
          </div>
        </div>
      </div>

      {/* Why We Exist Section */}
      {cmsContent.mission && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="bg-[#1f4e79] text-white p-10 rounded-lg shadow-lg relative overflow-hidden">
                <h2 className="text-3xl font-serif mb-8 text-center">
                  {cmsContent.mission.title}
                </h2>
                <p className="text-3xl mb-6 text-center font-serif font-bold text-[#D4AF37]">
                  "{cmsContent.mission.statement}"
                </p>
                <div className="w-32 h-1 bg-[#D4AF37] mx-auto mb-8"></div>
                <p className="text-lg text-center">
                  {cmsContent.mission.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Core Values Section */}
      {cmsContent.coreValues && (
        <div className="py-16 bg-[#F5F5DC]">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">Core Values</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {cmsContent.coreValues.map((value: any, index: number) => (
                  <Card key={index} className="bg-white p-8 text-center border-t-4 border-[#1f4e79] hover:transform hover:scale-105 transition duration-300">
                    <div className="w-20 h-20 bg-[#1f4e79] rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                      {getIcon(value.icon)}
                    </div>
                    <h3 className="text-2xl text-[#1f4e79] mb-4 font-serif">{value.title}</h3>
                    <p className="text-gray-700">{value.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Heritage Timeline Section */}
      {cmsContent.timeline && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">Our Heritage Timeline</h2>
              
              <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-[#1f4e79] bg-opacity-20 transform -translate-y-1/2 z-0"></div>
                
                <div ref={timelineRef} className="overflow-x-auto pb-10 scrollbar-hide">
                  <div className="flex space-x-6 relative z-10 min-w-max px-4">
                    {cmsContent.timeline.map((item: any, index: number) => (
                      <div 
                        key={index} 
                        className={`${item.highlight ? 'bg-[#1f4e79] text-white' : 'bg-white border-2 border-[#1f4e79]'} rounded-lg p-6 w-64 shadow-lg relative`}
                      >
                        <div className={`absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 ${item.highlight ? 'bg-[#D4AF37]' : 'bg-[#1f4e79]'} rounded-full flex items-center justify-center text-white`}>
                          {getIcon(item.icon)}
                        </div>
                        <h3 className={`text-xl ${item.highlight ? 'text-[#D4AF37]' : 'text-[#1f4e79]'} mb-2 font-serif mt-4`}>
                          {item.year}
                        </h3>
                        <h4 className={`text-lg ${item.highlight ? 'text-white' : 'text-[#8B6914]'} mb-2 font-medium`}>
                          {item.title}
                        </h4>
                        <p className={item.highlight ? 'text-gray-200' : 'text-gray-700'}>
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center mt-8 space-x-2">
                  <button 
                    onClick={() => handleScroll('left')}
                    className="w-10 h-10 rounded-full border-2 border-[#1f4e79] flex items-center justify-center text-[#1f4e79] hover:bg-[#1f4e79] hover:text-white transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleScroll('right')}
                    className="w-10 h-10 rounded-full border-2 border-[#1f4e79] flex items-center justify-center text-[#1f4e79] hover:bg-[#1f4e79] hover:text-white transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Heritage Stats */}
                {cmsContent.stats && (
                  <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {cmsContent.stats.map((stat: any, index: number) => (
                      <div key={index} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#D4AF37]">
                        <h4 className="text-3xl text-[#1f4e79] mb-2 font-serif">{stat.number}</h4>
                        <p className="text-[#8B6914] font-medium">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stewardship Philosophy Section */}
      {cmsContent.philosophy && (
        <div className="py-16 bg-[#F5F5DC]">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">
                {cmsContent.philosophy.title}
              </h2>
              
              <Card className="bg-white p-10 relative overflow-hidden">
                <blockquote className="text-3xl text-[#1f4e79] italic mb-6 text-center font-serif relative z-10">
                  {cmsContent.philosophy.quote}
                </blockquote>
                <div className="w-32 h-1 bg-[#D4AF37] mx-auto mb-8"></div>
                <div className="text-center">
                  <p className="text-lg text-gray-700 mb-6">
                    {cmsContent.philosophy.description}
                  </p>
                  <p className="text-lg text-gray-700">
                    {cmsContent.philosophy.subdescription}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Stewardship Pledge Section */}
      {cmsContent.pledgeItems && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-6 font-serif">Stewardship Pledge</h2>
              <p className="text-xl text-gray-700 text-center mb-12 max-w-3xl mx-auto">
                Join us in committing to responsible AI use that honors our heritage values while embracing innovation
              </p>
              
              <div className="space-y-6">
                {cmsContent.pledgeItems.map((item: string, index: number) => (
                  <Card key={index} className="bg-white p-6 border-l-4 border-[#1f4e79] hover:shadow-lg transition">
                    <div className="flex items-start">
                      <Checkbox 
                        className="mt-1 mr-4"
                        checked={checkedItems[index]}
                        onCheckedChange={(checked) => {
                          const newCheckedItems = [...checkedItems];
                          newCheckedItems[index] = checked as boolean;
                          setCheckedItems(newCheckedItems);
                        }}
                      />
                      <p className="text-gray-700 text-lg">{item}</p>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Button 
                  className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90 text-lg px-8 py-4"
                  disabled={!checkedItems.every(item => item)}
                >
                  Submit My Pledge
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Journey Section */}
      <div className="py-16 bg-[#1f4e79] text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="relative max-w-4xl mx-auto">
            <h2 className="text-4xl mb-6 font-serif">Ready to experience our culture in action?</h2>
            <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto">
              {cmsContent.callToAction}
            </p>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
              <Link to="/building/community-center">
                <Button className="bg-white text-[#1f4e79] hover:bg-[#F5F5DC] text-lg px-8 py-4">
                  Visit Job Junction
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4">
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
              <h3 className="text-xl mb-4 font-serif font-bold text-[#D4AF37]">KAIVILLE</h3>
              <p className="text-gray-400">
                125 years of faithful stewardship, building a legacy for future generations.
              </p>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Heritage</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Our Story</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Core Values</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Timeline</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Stewardship Pledge</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Explore</h3>
              <ul className="space-y-2">
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
      <EditButton editPath="/admin/building/heritage_center" label="Edit Stewardship Hall" />
    </div>
  );
};