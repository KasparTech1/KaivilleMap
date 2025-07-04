import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Compass, GraduationCap, Bell, HardHat, Recycle, TrendingUp, Users, ListTodo, Target, PlayCircle, Wrench, Star, HelpCircle, Handshake } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useCMSContent } from '../hooks/useCMSContent';
import { EditButton } from '../components/cms/EditButton';

export const SkillsAcademyPage: React.FC = () => {
  const { content: cmsContent, loading } = useCMSContent('building', 'learning_lodge', {});

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1f4e79] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1f4e79] text-lg">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      {/* Header */}
      <header className="bg-[#8B4513] shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="no-underline">
                <h1 className="text-2xl text-[#F5F5DC] font-serif font-bold hover:text-[#D4AF37] transition cursor-pointer">KAIVILLE</h1>
              </Link>
              <nav className="ml-10 hidden md:block">
                <ul className="flex space-x-8">
                  <li>
                    <Link to="/" className="text-[#F5F5DC] hover:text-[#D4AF37] transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/heritage_center" className="text-[#F5F5DC] hover:text-[#D4AF37] transition">
                      Stewardship Hall
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/community-center" className="text-[#F5F5DC] hover:text-[#D4AF37] transition">
                      Job Junction
                    </Link>
                  </li>
                  <li>
                    <span className="text-[#F5F5DC] font-bold border-b-2 border-[#D4AF37] pb-1">
                      Skills Academy
                    </span>
                  </li>
                  <li>
                    <Link to="/building/kasp_tower" className="text-[#F5F5DC] hover:text-[#D4AF37] transition">
                      Kaizen Tower
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-[#F5F5DC] hover:text-[#D4AF37] transition">
                <Bell className="w-6 h-6" />
              </button>
              <button className="text-[#F5F5DC] hover:text-[#D4AF37] transition">
                <GraduationCap className="w-6 h-6" />
              </button>
              <Link to="/">
                <Button className="bg-[#D4AF37] text-[#1f4e79] hover:bg-[#D4AF37]/90">
                  Return to Map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="py-16 bg-[#F5F5DC]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-serif text-[#1f4e79] font-bold leading-tight">
                  {cmsContent.title || 'Skills Academy'}
                </h1>
                <h2 className="text-2xl font-serif text-[#D4AF37]">
                  {cmsContent.subtitle || 'Learn and Develop Your AI Skills'}
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {cmsContent.description || 'From Swiss Guards to Texas Aggies to AI Pioneers - we\'ve always valued learning and service'}
                </p>
                <Button className="bg-[#D4AF37] text-[#1f4e79] hover:bg-[#D4AF37]/90 text-lg px-8 py-4">
                  <GraduationCap className="mr-3" /> Enter the Academy
                </Button>
              </div>
              <div className="flex justify-center">
                <img 
                  className="h-[400px] w-auto drop-shadow-xl"
                  src="https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/skills_academy_02.svg"
                  alt="Skills Academy Building"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Philosophy Section */}
      {cmsContent.philosophy && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] mb-8 font-serif text-center">
                {cmsContent.philosophy.title}
              </h2>
              <div className="bg-[#355E3B] text-white p-8 rounded-lg shadow-xl">
                <p className="text-lg leading-relaxed text-center">
                  {cmsContent.philosophy.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SKILLS + AI Framework Section */}
      {cmsContent.framework && (
        <div className="py-16 bg-[#F5F5DC]">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">SKILLS + AI Framework</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cmsContent.framework.map((item: any, index: number) => {
                  const icons: { [key: string]: any } = {
                    hardhat: HardHat,
                    recycle: Recycle,
                    trending: TrendingUp,
                    users: Users,
                    list: ListTodo,
                    target: Target
                  };
                  const Icon = icons[item.icon] || HardHat;
                  const colors: { [key: string]: string } = {
                    red: '#DC2626',
                    green: '#16A34A',
                    gold: '#D4AF37',
                    blue: '#1f4e79',
                    purple: '#9333EA',
                    orange: '#EA580C'
                  };
                  
                  return (
                    <Card key={index} className="bg-white p-6 hover:shadow-xl transition">
                      <div className="text-center mb-4">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ backgroundColor: colors[item.color] || '#1f4e79' }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl text-[#1f4e79] font-bold mb-2">{item.title}</h3>
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

      {/* Learning Approach Section */}
      {cmsContent.approach && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">How We Learn Together</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {cmsContent.approach.map((item: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <span className="text-[#1f4e79] font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Resources Section */}
      {cmsContent.resources && (
        <div className="py-16 bg-[#F5F5DC]">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl text-[#1f4e79] text-center mb-12 font-serif">Available Resources</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {cmsContent.resources.map((resource: any, index: number) => {
                  const icons: { [key: string]: any } = {
                    play: PlayCircle,
                    tools: Wrench,
                    star: Star,
                    question: HelpCircle,
                    hands: Handshake
                  };
                  const Icon = icons[resource.icon] || PlayCircle;
                  
                  return (
                    <Card key={index} className="bg-white p-6 text-center hover:shadow-xl transition">
                      <Icon className="w-12 h-12 text-[#1f4e79] mx-auto mb-4" />
                      <h3 className="text-lg text-[#1f4e79] font-semibold">{resource.title}</h3>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Encouragement Section */}
      {cmsContent.encouragement && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-4xl text-[#1f4e79] mb-8 font-serif">
                {cmsContent.encouragement.title}
              </h2>
              <div className="bg-[#D4AF37] bg-opacity-10 p-8 rounded-lg shadow-lg">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {cmsContent.encouragement.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wall of Learning Section */}
      {cmsContent.generations && (
        <div className="py-16 bg-[#8B4513] text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl text-center mb-8 font-serif text-[#D4AF37]">Five Generations of Innovation</h2>
              <p className="text-xl text-center mb-12">Five generations of Kaspar family members have embraced new technologies and skills. You're continuing that proud tradition.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {cmsContent.generations.map((gen: any, index: number) => (
                  <Card key={index} className="bg-white overflow-hidden">
                    <div className="bg-[#D4AF37] p-4 text-center">
                      <div className="w-12 h-12 bg-[#1f4e79] rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-[#D4AF37] font-bold text-xl">{gen.number}</span>
                      </div>
                      <h3 className="text-[#1f4e79] font-bold text-lg">{gen.title}</h3>
                      <p className="text-[#1f4e79] text-sm">{gen.years}</p>
                    </div>
                    <div className="p-4">
                      <h4 className="text-[#1f4e79] font-semibold text-sm mb-2">{gen.technologies}</h4>
                      <p className="text-gray-700 text-xs mb-3">{gen.story}</p>
                      <div className="bg-[#D4AF37] bg-opacity-20 p-2 rounded">
                        <p className="text-[#1f4e79] text-xs font-medium">{gen.aiConnection}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Journey Section */}
      <div className="py-16 bg-[#1f4e79] text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="relative max-w-4xl mx-auto">
            <h2 className="text-4xl mb-6 font-serif">Ready to see learning in action?</h2>
            <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto">
              {cmsContent.callToAction || 'Innovation Plaza showcases real success stories from team members who started just like you.'}
            </p>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
              <Link to="/building/celebration_station">
                <Button className="bg-white text-[#1f4e79] hover:bg-[#F5F5DC] text-lg px-8 py-4">
                  Visit Innovation Plaza
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
                Building skills for the future while honoring our heritage of learning.
              </p>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Learning</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">SKILLS + AI Framework</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Resources</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Success Stories</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer transition">Getting Started</span></li>
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
      <EditButton editPath="/admin/building/learning_lodge" label="Edit Skills Academy" />
    </div>
  );
};