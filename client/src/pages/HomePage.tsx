import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { WelcomeSign } from '../components/WelcomeSign';
import { BuildingCard } from '../components/BuildingCard';
import { RoadConnector } from '../components/RoadConnector';
import { EditButton } from '../components/cms/EditButton';
import { DayNightToggle } from '../components/DayNightToggle';
import { getBuildings } from '../api/buildings';
import { useToast } from '../hooks/useToast';
import { useCMSContent } from '../hooks/useCMSContent';
import { Loader2 } from 'lucide-react';

interface Building {
  id: string;
  title: string;
  row: number;
  column: number;
  span: number;
  illustration: string;
  connections: string[];
}

export const HomePage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [horizonHeight, setHorizonHeight] = useState(256); // Default 256px (h-64)
  const [isDayMode, setIsDayMode] = useState(true);
  const { toast } = useToast();
  
  // Get CMS content with defaults
  const { content: cmsContent } = useCMSContent('home', 'main', {
    welcomeTitle: 'Welcome to Kaiville',
    welcomeSubtitle: 'Explore Our Interactive Town Map',
    heroText: 'Discover the heart of our community through this interactive map. Click on any building to learn more about what makes Kaiville special.',
    aboutTitle: 'About Kaiville',
    aboutText: 'Kaiville is a vibrant community where innovation meets tradition.'
  });

  const fetchBuildings = useCallback(async () => {
    try {
      const response = await getBuildings() as { buildings: Building[] };
      setBuildings(response.buildings);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast({
        title: "Error",
        description: "Failed to load buildings data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  // Adjust horizon based on welcome sign position
  useEffect(() => {
    const adjustHorizon = () => {
      const topSection = document.querySelector('.top-section');
      if (topSection) {
        const rect = topSection.getBoundingClientRect();
        const newHeight = rect.bottom + window.scrollY;
        setHorizonHeight(Math.max(newHeight, 200)); // Minimum 200px
      }
    };

    // Initial adjustment
    adjustHorizon();
    
    // Listen for welcome sign load
    const handleSignLoad = () => adjustHorizon();
    window.addEventListener('welcomeSignLoaded', handleSignLoad);
    window.addEventListener('resize', adjustHorizon);

    return () => {
      window.removeEventListener('welcomeSignLoaded', handleSignLoad);
      window.removeEventListener('resize', adjustHorizon);
    };
  }, []);

  // Generate connections for road rendering
  const connections = React.useMemo(() => {
    const connectionPairs: Array<{ from: string; to: string }> = [];
    const processed = new Set<string>();

    buildings.forEach(building => {
      building.connections.forEach(connectionId => {
        const connectionKey = [building.id, connectionId].sort().join('-');
        if (!processed.has(connectionKey)) {
          connectionPairs.push({ from: building.id, to: connectionId });
          processed.add(connectionKey);
        }
      });
    });

    return connectionPairs;
  }, [buildings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className="text-lg text-gray-600">Loading Kaiville Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sky and Grass Background */}
      <div className="absolute inset-0">
        {/* Sky - Dynamic height section */}
        <div 
          className={`absolute top-0 left-0 right-0 bg-gradient-to-b transition-all duration-1000 ${
            isDayMode 
              ? 'from-sky-300 via-sky-200 to-sky-100' 
              : 'from-indigo-900 via-purple-900 to-pink-800'
          }`}
          style={{ height: `${horizonHeight}px` }}
        />
        
        {/* Grass - Everything below the sky */}
        <div 
          className="absolute left-0 right-0 bottom-0"
          style={{ top: `${horizonHeight}px` }}
        >
          {/* Rolling Hills Horizon Line */}
          <svg 
            className="absolute w-full h-full" 
            viewBox="0 0 1200 800" 
            preserveAspectRatio="none"
          >
            {/* Grass area with rolling hills */}
            <path 
              d="M0,20 Q300,5 600,15 T1200,10 L1200,800 L0,800 Z" 
              fill={isDayMode ? "url(#grassGradient)" : "url(#nightGrassGradient)"} 
              opacity={isDayMode ? "0.7" : "0.9"}
            />
            
            {/* Gradient definitions */}
            <defs>
              {/* Day gradient */}
              <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#84cc16" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#65a30d" stopOpacity="0.7" />
              </linearGradient>
              
              {/* Night gradient */}
              <linearGradient id="nightGrassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a1a2e" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#16213e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f0f0f" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Soft overlay for depth */}
        <div className={`absolute inset-0 bg-gradient-to-b transition-all duration-1000 ${
          isDayMode 
            ? 'from-transparent via-white/10 to-white/20' 
            : 'from-transparent via-black/20 to-black/40'
        }`} />
        
        {/* Stars for night mode */}
        {!isDayMode && (
          <div className="absolute inset-0">
            {/* Generate random stars */}
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * horizonHeight}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              />
            ))}
            
            {/* Moon */}
            <div className="absolute top-10 right-20">
              {/* Moon glow */}
              <div className="absolute -inset-4 bg-yellow-100 rounded-full opacity-20 blur-xl animate-pulse" />
              {/* Moon body */}
              <div className="relative w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full shadow-2xl">
                <div className="absolute top-2 right-2 w-4 h-4 bg-gray-400 rounded-full opacity-30" />
                <div className="absolute bottom-3 left-3 w-2 h-2 bg-gray-400 rounded-full opacity-30" />
                <div className="absolute top-4 left-2 w-3 h-3 bg-gray-400 rounded-full opacity-20" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8">
        {/* Day/Night Toggle - Top Right */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
          <DayNightToggle 
            isDayMode={isDayMode} 
            onToggle={() => setIsDayMode(!isDayMode)} 
          />
        </div>
        
        <div className="max-w-6xl mx-auto">
          {/* Top Section with KNN Tower and Welcome Sign */}
          <div className="top-section flex justify-between items-end mb-1">
            {/* Spacer for layout balance */}
            <div className="flex-shrink-0 w-full max-w-[6rem] sm:max-w-[8rem] md:max-w-[12rem]"></div>
            
            {/* Welcome Sign - Center */}
            <div className="flex-grow flex justify-center px-2">
              <WelcomeSign isDayMode={isDayMode} />
            </div>
            
            {/* Spacer for balance */}
            <div className="flex-shrink-0 w-16 sm:w-24 md:w-48" />
          </div>

        {/* Interactive Map */}
        <div className="relative">
          {/* Single Responsive Grid Layout */}
          <div className="buildings-grid relative grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 p-4 md:p-8 min-h-[600px] md:min-h-[400px]">
            {/* Road Connections */}
            <RoadConnector buildings={buildings} connections={connections} />

            {/* Building Cards - Desktop positioning */}
            <div className="hidden md:contents">
              {buildings.map(building => (
                <div
                  key={building.id}
                  data-building-id={building.id}
                  className="relative z-20"
                  style={{
                    gridRow: building.row,
                    gridColumn: building.column,
                    gridColumnEnd: `span ${building.span}`
                  }}
                >
                  <BuildingCard building={building} />
                </div>
              ))}
            </div>
            
            {/* Building Cards - Mobile positioning */}
            <div className="md:hidden contents">
              {buildings
                .sort((a, b) => a.row - b.row || a.column - b.column)
                .map((building, index) => (
                  <div 
                    key={building.id} 
                    data-building-id={building.id}
                    className="relative z-20"
                    style={{
                      gridRow: Math.floor(index / 2) + 1,
                      gridColumn: (index % 2) + 1
                    }}
                  >
                    <BuildingCard building={building} />
                  </div>
                ))}
            </div>
          </div>
        </div>

          {/* Instructions with CMS Content */}
          <div className="mt-12 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {cmsContent.aboutTitle || 'How to Explore Kaiville'}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {cmsContent.heroText || 'Click on any building card to learn more about that location.'}
              </p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Floating Edit Button */}
      <EditButton editPath="/admin/home" label="Edit Home" />
    </div>
  );
};