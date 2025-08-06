import React, { useState } from 'react';

interface BuildingTooltipProps {
  building: {
    id: string;
    title: string;
  };
  children: React.ReactNode;
}

const getBuildingDescription = (buildingId: string): string => {
  const descriptions = {
    'heritage_center': 'Learn about our 125-year heritage and foundational values',
    'learning_lodge': 'Develop AI skills through our comprehensive learning framework',
    'city_hall': 'Submit permits and applications for tools and building modifications',
    'celebration_station': 'Discover AI success stories and innovation metrics',
    'trading_post': 'Browse and access tested AI tools and solutions',
    'community-center': 'Connect with the community at our central junction',
    'kasp_tower': 'Explore continuous improvement and excellence programs'
  };
  return descriptions[buildingId] || 'Explore this building to learn more';
};

export const BuildingTooltip: React.FC<BuildingTooltipProps> = ({ building, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className="relative"
    >
      {children}
      
      {isVisible && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="bg-[#1f4e79] text-white px-4 py-3 rounded-lg shadow-xl border-2 border-[#D4AF37] max-w-xs">
            <div className="text-center">
              <h3 className="font-semibold text-[#D4AF37] mb-1">{building.title}</h3>
              <p className="text-sm text-gray-200">{getBuildingDescription(building.id)}</p>
            </div>
            {/* Tooltip arrow */}
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1f4e79]"
            />
          </div>
        </div>
      )}
    </div>
  );
};