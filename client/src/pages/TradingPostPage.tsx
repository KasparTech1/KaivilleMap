import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Users, Clock, Tag, Mail, FileText, Target } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('');
  const [showLegendModal, setShowLegendModal] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle keyboard events for legend modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showLegendModal) {
        setShowLegendModal(false);
      }
    };

    if (showLegendModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showLegendModal]);

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
      chatGptLink: 'https://kasparcompanies.sharepoint.com/:w:/r/sites/KAI-RAG-Data-Hub/_layouts/15/Doc.aspx?sourcedoc=%7B0897171F-F810-4DA4-BE31-1D82608DBBF8%7D&file=History%20of%20Kaspar%20Companies%20-%201898%20thru%202000s.docx&action=default&mobileredirect=true'
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
    }
  ];

  const skillLegend: {[key: string]: {name: string, description: string}} = {
    'S': { name: 'Safety', description: 'Safety-focused tools and protocols' },
    'K': { name: 'Kaizen', description: 'Continuous improvement and optimization' },
    'L': { name: 'Leadership', description: 'Team management and guidance' },
    'I': { name: 'Innovation', description: 'Creative solutions and new ideas' },
    'D': { name: 'Data', description: 'Analytics and insights' }
  };

  // Filter tools
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = selectedSkillFilter === '' || tool.skills.includes(selectedSkillFilter);
    return matchesSearch && matchesSkill;
  });

  const featuredTool = filteredTools.find(tool => tool.featured);
  const availableTools = filteredTools.filter(tool => !tool.featured && !tool.comingSoon);
  const comingSoonTools = filteredTools.filter(tool => tool.comingSoon);

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
              <nav className="ml-10 hidden lg:block">
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
              <span className="text-6xl mr-4" role="img" aria-label="Trading post building">🏪</span>
              <div>
                <h1 className="text-5xl font-serif font-bold mb-2">THE TRADING POST</h1>
                <p className="text-xl italic text-[#D4AF37]">"Outfitting Innovation Since 1898"</p>
              </div>
            </div>
          </div>
          
          {/* Search Controls */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  type="text"
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/70"
                  aria-label="Search for AI tools"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedSkillFilter}
                  onChange={(e) => setSelectedSkillFilter(e.target.value)}
                  className="bg-white/20 text-white border border-white/20 rounded-md px-4 py-3 backdrop-blur-sm"
                  aria-label="Filter tools by skill category"
                >
                  <option value="" className="text-gray-800">All Skills</option>
                  {Object.entries(skillLegend).map(([key, skill]) => (
                    <option key={key} value={key} className="text-gray-800">{key} - {skill.name}</option>
                  ))}
                </select>
                <button 
                  className="bg-white/20 text-white border border-white/20 rounded-md px-4 py-3 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  title="View skill abbreviations legend"
                  aria-label="Show legend explaining skill abbreviations (S, K, L, D, I)"
                  onClick={() => setShowLegendModal(true)}
                >
                  📖 Legend
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Tool */}
      {featuredTool && (
        <div className="py-16 bg-gradient-to-r from-[#1f4e79] to-[#2c5530]">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#B87333] text-white p-4">
                  <div className="flex items-center">
                    <Star className="w-6 h-6 mr-2" />
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
                          <span className="text-sm" title={`Skills required: ${featuredTool.skills.map(s => skillLegend[s]?.name).join(', ')}`}>
                            SKILLS: {featuredTool.skills.join(', ')}
                          </span>
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
                        {featuredTool.chatGptLink && featuredTool.chatGptLink.startsWith('https://kasparcompanies.sharepoint.com') ? (
                          <Button 
                            onClick={() => window.open(featuredTool.chatGptLink, '_blank')}
                            className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90 px-8 py-3"
                          >
                            Launch Tool
                          </Button>
                        ) : (
                          <div className="text-center">
                            <Button 
                              disabled
                              className="bg-gray-400 text-gray-600 cursor-not-allowed px-8 py-3 mb-2"
                              title="Tool configuration in progress"
                            >
                              🚧 Coming Soon
                            </Button>
                            <p className="text-sm text-gray-600">This tool is being configured for your organization. Stay tuned for updates!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {filteredTools.length === 0 && (searchTerm || selectedSkillFilter) && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-3xl font-serif text-[#1f4e79] mb-4">No Tools Found</h2>
              <p className="text-xl text-gray-600 mb-6">
                No tools match your search "{searchTerm}" {selectedSkillFilter && `with skill "${skillLegend[selectedSkillFilter]?.name}"`}.
              </p>
              <div className="space-y-2 text-gray-600">
                <p>Try:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Using different keywords</li>
                  <li>Selecting "All Skills" to broaden your search</li>
                  <li>Browsing all available tools below</li>
                </ul>
              </div>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSkillFilter('');
                }}
                className="mt-6 bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Tools */}
      {comingSoonTools.length > 0 && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-serif text-[#1f4e79] text-center mb-4">Coming Soon</h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                These tools are currently in development. Stay tuned for updates!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {comingSoonTools.map((tool) => (
                  <Card 
                    key={tool.id} 
                    className="bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      COMING SOON
                    </div>
                    <div className="p-6 h-full flex flex-col opacity-75">
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-3 grayscale" role="img" aria-label={tool.name}>{tool.icon}</div>
                        <h3 className="text-xl font-bold text-[#1f4e79] mb-2">{tool.name}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
                      </div>
                      
                      <div className="flex-1 space-y-3 mb-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <Tag className="w-3 h-3 mr-2 text-gray-400" />
                          <span title={`Skills required: ${tool.skills.map(s => skillLegend[s]?.name).join(', ')}`}>
                            {tool.skills.join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-2 text-gray-400" />
                          <span>Est. {tool.setupTime}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Banner */}
      <div className="bg-[#1f4e79] text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif mb-4">Need Help Choosing the Right Tool?</h2>
            <p className="text-xl mb-8 leading-relaxed">
              Every tool in our Trading Post has been tested and approved by Kaspar employees. 
              Our digital shopkeepers are here to guide you through implementation and provide ongoing support.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🔧 Implementation Help</h3>
                <p className="text-sm text-gray-200">Step-by-step guides and troubleshooting for each tool</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">💬 Expert Consultation</h3>
                <p className="text-sm text-gray-200">Talk to employees who've successfully used these tools</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">📋 Custom Requests</h3>
                <p className="text-sm text-gray-200">Can't find what you need? Request a custom tool evaluation</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button 
                className="bg-[#D4AF37] text-[#1f4e79] hover:bg-[#D4AF37]/90"
                aria-label="Contact shopkeeper for help choosing tools"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Shopkeeper
              </Button>
              <Button 
                className="bg-white/20 text-white border-white hover:bg-white/30"
                aria-label="View implementation guides for tools"
              >
                <FileText className="w-4 h-4 mr-2" />
                Implementation Guides
              </Button>
              <Button 
                className="bg-white/20 text-white border-white hover:bg-white/30"
                aria-label="Request a new tool not in catalog"
              >
                <Target className="w-4 h-4 mr-2" />
                Request New Tool
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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

      {/* Accessible Legend Modal */}
      {showLegendModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legend-title"
          onClick={(e) => e.target === e.currentTarget && setShowLegendModal(false)}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 id="legend-title" className="text-xl font-bold text-[#1f4e79]">Skill Categories Legend</h3>
              <Button 
                onClick={() => setShowLegendModal(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close legend modal"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">Each tool requires specific skills. Here's what the abbreviations mean:</p>
              
              {Object.entries(skillLegend).map(([key, skill]) => (
                <div key={key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#1f4e79] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{key}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1f4e79]">{skill.name}</h4>
                    <p className="text-sm text-gray-600">{skill.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button 
                onClick={() => setShowLegendModal(false)}
                className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90"
              >
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};