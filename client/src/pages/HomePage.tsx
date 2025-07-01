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
  const [horizonHeight, setHorizonHeight] = useState(150); // Lower default for tighter layout
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
      // Try multiple selectors to find the welcome sign
      const mainContent = document.getElementById('main-content');
      const welcomeSignImg = document.querySelector('.top-section img') || 
                            document.querySelector('img[alt="Welcome to Kaiville"]');
      const topSection = document.querySelector('.top-section');
      
      // Debug logging
      console.log('Looking for elements:', {
        mainContent: !!mainContent,
        welcomeSignImg: !!welcomeSignImg,
        topSection: !!topSection
      });
      
      let targetElement = null;
      
      // Try to use the image first if it's loaded
      if (welcomeSignImg) {
        const imgRect = welcomeSignImg.getBoundingClientRect();
        if (imgRect.height > 0) {
          targetElement = welcomeSignImg;
        } else {
          console.log('Welcome sign image found but has no height yet');
        }
      }
      
      // Fall back to top section if image not ready
      if (!targetElement && topSection) {
        const sectionRect = topSection.getBoundingClientRect();
        if (sectionRect.height > 0) {
          targetElement = topSection;
        }
      }
      
      if (!targetElement) {
        console.warn('Could not find suitable element for horizon adjustment');
        // Use a fixed height based on typical welcome sign position
        const isMobile = window.innerWidth < 768;
        const defaultHeight = isMobile ? 180 : 200; // Much lower on both
        setHorizonHeight(defaultHeight);
        return;
      }
      
      const rect = targetElement.getBoundingClientRect();
      
      // Get the main content padding if available
      let contentPaddingTop = 0;
      if (mainContent) {
        const styles = window.getComputedStyle(mainContent);
        contentPaddingTop = parseInt(styles.paddingTop) || 0;
      }
      
      // Calculate absolute position
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const absoluteBottom = rect.bottom + scrollTop;
      
      const isMobile = window.innerWidth < 768;
      
      console.log('Horizon calculation:', {
        element: targetElement.tagName,
        rectTop: rect.top,
        rectBottom: rect.bottom,
        height: rect.height,
        scrollTop: scrollTop,
        contentPaddingTop: contentPaddingTop,
        absoluteBottom: absoluteBottom,
        isMobile: isMobile
      });
      
      // Set the horizon to the absolute bottom position
      let finalHeight = absoluteBottom;
      
      // Add buffer
      finalHeight += isMobile ? 30 : 20;
      
      // Reduce height for higher horizon line
      if (isMobile) {
        finalHeight = finalHeight / 2;  // Half for mobile
      } else {
        finalHeight = finalHeight * 0.5;  // Half for desktop too
      }
      
      console.log('Setting horizon height to:', finalHeight, '(halved for both mobile and desktop)');
      setHorizonHeight(finalHeight);
    };

    // Multiple attempts to ensure we catch the sign after it loads
    const attemptAdjustment = () => {
      adjustHorizon();
      // Try again after delays to catch late-loading images
      setTimeout(adjustHorizon, 100);
      setTimeout(adjustHorizon, 300);
      setTimeout(adjustHorizon, 500);
    };

    // Wait a bit for DOM to stabilize before initial adjustment
    setTimeout(() => {
      attemptAdjustment();
      
      // Also check if images are already loaded
      const checkImagesLoaded = () => {
        const img = document.querySelector('.top-section img') || 
                   document.querySelector('img[alt="Welcome to Kaiville"]') as HTMLImageElement;
        if (img && img.complete && img.naturalHeight > 0) {
          console.log('Image already loaded, adjusting horizon');
          adjustHorizon();
        }
      };
      
      // Check after short delays
      checkImagesLoaded();
      setTimeout(checkImagesLoaded, 200);
      setTimeout(checkImagesLoaded, 500);
      setTimeout(checkImagesLoaded, 1000);
    }, 100);
    
    // Listen for welcome sign load
    const handleSignLoad = (event: any) => {
      console.log('Welcome sign loaded event received');
      // Give it a moment to fully render, then adjust multiple times
      setTimeout(adjustHorizon, 50);
      setTimeout(adjustHorizon, 150);
      setTimeout(adjustHorizon, 300);
      setTimeout(adjustHorizon, 500);
    };
    window.addEventListener('welcomeSignLoaded', handleSignLoad);
    window.addEventListener('resize', adjustHorizon);
    
    // Also observe DOM changes
    const observer = new MutationObserver(() => {
      adjustHorizon();
    });
    
    const topSection = document.querySelector('.top-section');
    if (topSection) {
      observer.observe(topSection, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('welcomeSignLoaded', handleSignLoad);
      window.removeEventListener('resize', adjustHorizon);
      observer.disconnect();
    };
  }, [isDayMode]); // Re-run when theme changes

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
      <div className="relative z-10 p-4 md:p-8" id="main-content">
        {/* Day/Night Toggle - Top Right */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
          <DayNightToggle 
            isDayMode={isDayMode} 
            onToggle={() => setIsDayMode(!isDayMode)} 
          />
        </div>
        
        <div className="max-w-6xl mx-auto">
          {/* Top Section with KNN Tower and Welcome Sign */}
          <div className="top-section flex justify-between items-end mb-0 -mt-4 md:-mt-0">
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
          <div className="buildings-grid relative grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 pt-0 px-4 pb-4 md:pt-0 md:px-8 md:pb-8 min-h-[600px] md:min-h-[400px]">
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
                  <BuildingCard building={building} isDayMode={isDayMode} />
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
                    <BuildingCard building={building} isDayMode={isDayMode} />
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