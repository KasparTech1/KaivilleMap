import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { WelcomeSign } from '../components/WelcomeSign';
import { BuildingCard } from '../components/BuildingCard';
import { RoadConnector } from '../components/RoadConnector';
import { getBuildings } from '../api/buildings';
import { useToast } from '../hooks/useToast';
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
  const { toast } = useToast();

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
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100" 
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
              fill="url(#grassGradient)" 
              opacity="0.7"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#84cc16" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#65a30d" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Soft overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Top Section with KNN Tower and Welcome Sign */}
          <div className="top-section flex justify-between items-end mb-1">
            {/* Spacer for layout balance */}
            <div className="flex-shrink-0 w-full max-w-[6rem] sm:max-w-[8rem] md:max-w-[12rem]"></div>
            
            {/* Welcome Sign - Center */}
            <div className="flex-grow flex justify-center px-2">
              <WelcomeSign />
            </div>
            
            {/* Spacer for balance */}
            <div className="flex-shrink-0 w-16 sm:w-24 md:w-48" />
          </div>

        {/* Interactive Map */}
        <div className="relative">
          {/* Desktop Grid Layout */}
          <div className="hidden md:block">
            <div className="buildings-grid relative grid grid-cols-3 gap-8 p-8">
              {/* Road Connections */}
              <RoadConnector buildings={buildings} connections={connections} />

              {/* Building Cards */}
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
          </div>

          {/* Mobile Grid Layout - 2 columns */}
          <div className="md:hidden">
            <div className="buildings-grid relative grid grid-cols-2 gap-4 p-4">
              {/* Road Connections for Mobile */}
              <RoadConnector buildings={buildings} connections={connections} />
              
              {/* Building Cards */}
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

          {/* Instructions */}
          <div className="mt-12 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                How to Explore Kaiville
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Click on any building card to learn more about that location.
                {window.innerWidth > 768 && " Follow the connecting roads to discover relationships between different areas of our town."}
              </p>
            </div>
          </div>

          {/* Hidden Admin Link - Bottom Right Corner */}
          <div className="mt-8 flex justify-end">
            <Link 
              to="/admin" 
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              title="Admin Panel"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};