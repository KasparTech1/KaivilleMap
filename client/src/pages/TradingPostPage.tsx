import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronDown, Star, Users, Clock, Tag, Rocket, BookOpen, Mail, Phone, FileText, Target, ExternalLink, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  skills: string[];
  setupTime: string;
  users: number;
  successStories: number;
  featured?: boolean;
  comingSoon?: boolean;
  chatGptLink?: string;
}

export const TradingPostPage: React.FC = () => {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [email, setEmail] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const tools: Tool[] = [
    {
      id: 'career-path',
      name: 'Career Path Navigator',
      description: 'Map your future at Kaspar with AI guidance',
      icon: '🗺️',
      skills: ['L', 'I', 'S'],
      setupTime: '5 mins',
      users: 23,
      successStories: 8,
      featured: true,
      chatGptLink: 'https://chatgpt.com'
    },
    {
      id: 'safety-scout',
      name: 'Safety Scout',
      description: 'Predict incidents before they happen',
      icon: '🛡️',
      skills: ['S', 'K'],
      setupTime: '20 mins',
      users: 12,
      successStories: 5,
      comingSoon: true
    },
    {
      id: 'kpi-dashboard',
      name: 'KPI Dashboard',
      description: 'Real-time metrics for your team',
      icon: '📊',
      skills: ['L', 'D'],
      setupTime: '45 mins',
      users: 34,
      successStories: 11,
      comingSoon: true
    },
    {
      id: 'process-ai',
      name: 'Process AI',
      description: 'Optimize workflows with smart suggestions',
      icon: '🔧',
      skills: ['K', 'I'],
      setupTime: '1 hour',
      users: 18,
      successStories: 7,
      comingSoon: true
    },
    {
      id: 'idea-generator',
      name: 'Idea Generator',
      description: 'Brainstorm better solutions with AI assistance',
      icon: '💡',
      skills: ['K', 'L'],
      setupTime: '15 mins',
      users: 41,
      successStories: 14,
      comingSoon: true
    },
    {
      id: 'roi-calculator',
      name: 'ROI Calculator',
      description: 'Measure your AI investment impact',
      icon: '📈',
      skills: ['I', 'S'],
      setupTime: '30 mins',
      users: 28,
      successStories: 9,
      comingSoon: true
    },
    {
      id: 'team-insights',
      name: 'Team Insights',
      description: 'Understand team dynamics with behavioral data',
      icon: '👥',
      skills: ['L', 'D'],
      setupTime: '2 hours',
      users: 15,
      successStories: 6,
      comingSoon: true
    }
  ];

  const featuredTool = tools.find(tool => tool.featured);
  const regularTools = tools.filter(tool => !tool.featured);

  const handleToolClick = (tool: Tool) => {
    if (tool.featured && tool.chatGptLink) {
      window.open(tool.chatGptLink, '_blank');
    } else {
      setSelectedTool(tool);
      setShowComingSoonModal(true);
    }
  };

  const handleNotifyMe = () => {
    // In a real app, this would save the email to a notification list
    console.log(`Notify ${email} about ${selectedTool?.name}`);
    setEmail('');
    setShowComingSoonModal(false);
    setSelectedTool(null);
    // Show success message or toast
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE]">
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
                    <span className="text-[#1f4e79] font-bold border-b-2 border-[#D4AF37] pb-1">
                      (5) Trading Post
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
      <div className="bg-gradient-to-br from-[#8B4513] to-[#A0522D] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <span className="text-6xl mr-4">🏪</span>
              <div>
                <h1 className="text-5xl font-serif font-bold mb-2">THE TRADING POST</h1>
                <p className="text-xl italic text-[#D4AF37]">"Outfitting Innovation Since 1898"</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                type="text"
                placeholder="Search your challenge..."
                className="pl-10 py-3 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/70"
              />
            </div>
            <Button className="bg-white/20 text-white border-white hover:bg-white/30 px-6">
              <Filter className="w-4 h-4 mr-2" />
              Filter
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <Button className="bg-white/20 text-white border-white hover:bg-white/30 px-6">
              Sort: Popular
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Tool */}
      {featuredTool && (
        <div className="py-16 bg-gradient-to-r from-[#1f4e79] to-[#2c5530]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#B87333] text-white p-4">
                  <div className="flex items-center">
                    <Rocket className="w-6 h-6 mr-2" />
                    <span className="text-lg font-bold">FEATURED SOLUTION</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-start gap-8">
                    <div className="text-6xl">{featuredTool.icon}</div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-[#1f4e79] mb-3">{featuredTool.name}</h2>
                      <p className="text-xl text-gray-700 mb-6">{featuredTool.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center text-gray-600">
                          <Tag className="w-4 h-4 mr-2 text-[#B87333]" />
                          <span className="text-sm">SKILLS: {featuredTool.skills.join(', ')}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-[#B87333]" />
                          <span className="text-sm">Setup: {featuredTool.setupTime}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-[#B87333]" />
                          <span className="text-sm">Used by: {featuredTool.users} employees</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Star className="w-4 h-4 mr-2 text-[#B87333]" />
                          <span className="text-sm">Success Stories: {featuredTool.successStories}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <Button 
                          onClick={() => handleToolClick(featuredTool)}
                          className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90 px-8 py-3"
                        >
                          <Rocket className="w-4 h-4 mr-2" />
                          Launch Tool
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-[#1f4e79] text-[#1f4e79] hover:bg-[#1f4e79] hover:text-white px-8 py-3"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool Grid */}
      <div className="py-16 bg-[#F8F9FA]">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-serif text-[#1f4e79] text-center mb-12">Available Tools</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularTools.map((tool) => (
                <Card 
                  key={tool.id} 
                  className="bg-gradient-to-b from-white to-gray-50 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-gray-200"
                  onClick={() => handleToolClick(tool)}
                >
                  <div className="p-6 h-full flex flex-col">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-3">{tool.icon}</div>
                      <h3 className="text-xl font-bold text-[#1f4e79] mb-2">{tool.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
                    </div>
                    
                    <div className="flex-1 space-y-3 mb-4">
                      <div className="flex items-center text-xs text-gray-500">
                        <Tag className="w-3 h-3 mr-2 text-[#B87333]" />
                        <span>{tool.skills.join(', ')}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-2 text-[#B87333]" />
                        <span>{tool.setupTime}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-2 text-[#B87333]" />
                        <span>{tool.users} users</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Star className="w-3 h-3 mr-2 text-[#B87333]" />
                        <span>{tool.successStories} stories</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-[#B87333] text-white hover:bg-[#A0622D] mt-auto"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="bg-[#1f4e79] text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <p className="text-xl italic mb-8 leading-relaxed">
              "Every tool in our Trading Post has been tested and approved by Kaspar employees. 
              Need help choosing? Our shopkeepers are here to guide you."
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button className="bg-[#D4AF37] text-[#1f4e79] hover:bg-[#D4AF37]/90">
                <Mail className="w-4 h-4 mr-2" />
                Contact Shopkeeper
              </Button>
              <Button className="bg-white/20 text-white border-white hover:bg-white/30">
                <FileText className="w-4 h-4 mr-2" />
                Implementation Guides
              </Button>
              <Button className="bg-white/20 text-white border-white hover:bg-white/30">
                <Target className="w-4 h-4 mr-2" />
                Request New Tool
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Regular Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl mb-4 font-serif font-bold text-[#D4AF37]">Trading Post</h3>
              <p className="text-gray-400">
                Your one-stop shop for AI tools and solutions tested by the Kaspar community.
              </p>
            </div>
            <div>
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Tools</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Featured Solutions</span></li>
                <li><span className="text-gray-400">Coming Soon</span></li>
                <li><span className="text-gray-400">Request Tool</span></li>
                <li><span className="text-gray-400">Implementation Help</span></li>
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
              <h3 className="text-xl mb-4 font-serif text-[#D4AF37]">Support</h3>
              <p className="text-gray-400">
                © 2025 Kaspar Companies. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Coming Soon Modal */}
      {showComingSoonModal && selectedTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{selectedTool.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-[#1f4e79]">{selectedTool.name}</h3>
                    <p className="text-sm text-gray-600">Coming Soon!</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowComingSoonModal(false)}
                  variant="ghost" 
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🚧</div>
                <p className="text-gray-700 mb-4">
                  This tool is on the way. Check back soon for updates!
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Want to be notified when it's ready? Leave your email below:
                </p>
                
                <Input
                  type="email"
                  placeholder="your.email@kaspar.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-4"
                />
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleNotifyMe}
                    className="flex-1 bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90"
                    disabled={!email}
                  >
                    Notify Me
                  </Button>
                  <Button 
                    onClick={() => setShowComingSoonModal(false)}
                    variant="outline" 
                    className="flex-1"
                  >
                    Browse More Tools
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};