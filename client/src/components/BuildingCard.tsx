import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/card';
import { getAssetUrl } from '../config/assetUrls';

interface Building {
  id: string;
  title: string;
  row: number;
  column: number;
  span: number;
  illustration: string;
  connections: string[];
}

interface BuildingCardProps {
  building: Building;
  style?: React.CSSProperties;
  isDayMode?: boolean;
}

export const BuildingCard: React.FC<BuildingCardProps> = React.memo(({ building, style, isDayMode = true }) => {
  // Use the illustration property from the building data if available
  let svgPath = building.illustration || '';
  
  // Special case for Heritage Center - use Supabase URLs
  if (building.id === 'heritage_center') {
    if (isDayMode) {
      svgPath = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/site-assets/icons/heritage_center_animated.svg';
    } else {
      svgPath = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/site-assets/icons/heritage-night-flagsdown.svg';
    }
  }
  
  // Special case for KNN Tower - use Supabase ticker URL for both day and night
  if (building.id === 'knn_tower') {
    svgPath = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/knn-tower-ticker.svg';
  }

  // Special rendering for heritage_center, learning_lodge, craft_works, knn_tower, community-center, celebration_station, safety_station, and kasp_tower - SVG becomes the card
  if (building.id === 'heritage_center' || building.id === 'learning_lodge' || building.id === 'craft_works' || building.id === 'knn_tower' || building.id === 'community-center' || building.id === 'celebration_station' || building.id === 'safety_station' || building.id === 'kasp_tower') {
    return (
      <Link to={`/building/${building.id}`} className="block" style={style}>
        <div className={`relative hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out cursor-pointer group ${
          building.id === 'heritage_center' ? (isDayMode ? '-mt-[10%] md:-mt-[8%] md:ml-[10%]' : '-mt-[20%] md:-mt-[18%] md:ml-[10%]') : 
          building.id === 'learning_lodge' ? 'scale-100 -mt-[50%] -ml-[25%] translate-y-[-45px] md:scale-100 md:mt-[10%] md:-ml-[15%] md:translate-y-0' : 
          building.id === 'community-center' ? 'scale-[1.5] mt-[60%] translate-y-[-45px] md:mt-0 md:scale-[1.425] md:translate-y-0' : 
          building.id === 'celebration_station' ? 'scale-[2.0] -mt-[25%] ml-[50%] translate-y-[-45px] md:scale-[1.2] md:-mt-[10%] md:ml-[40%] md:-translate-x-[220px] md:translate-y-0' : 
          building.id === 'kasp_tower' ? 'scale-100 -mt-[5%] ml-[25%] translate-y-[-45px] md:scale-[0.63] md:-mt-[85%] md:-ml-[20%] md:-translate-x-[180px] md:translate-y-0' : ''
        }`}>
          <img
            src={svgPath}
            alt={building.title}
            className={`w-full h-full object-contain drop-shadow-xl hover:drop-shadow-2xl transition-all duration-300 ${
              building.id === 'heritage_center' ? (isDayMode ? 'scale-[1.03]' : 'scale-90') : ''
            }`}
            onError={(e) => {
              // Fallback to default card style if SVG fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          {/* Fallback to default card style */}
          <Card
            className="relative overflow-hidden bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
            style={{ display: 'none' }}
          >
            <div className="aspect-square p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">{building.title.charAt(0)}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {building.title}
              </h3>
            </div>
          </Card>
        </div>
      </Link>
    );
  }

  // Default rendering for other buildings
  return (
    <Link to={`/building/${building.id}`} className="block">
      <Card
        className="relative overflow-hidden bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
        style={style}
      >
        <div className="aspect-square p-6 flex flex-col items-center justify-center text-center space-y-4">
          {/* Building SVG Illustration */}
          <div className="w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <img
              src={svgPath}
              alt={building.title}
              className="w-full h-full object-contain drop-shadow-lg"
              onError={(e) => {
                // Fallback to a simple colored rectangle if SVG fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback element */}
            <div
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"
              style={{ display: 'none' }}
            >
              <span className="text-white font-bold text-xl">
                {building.title.charAt(0)}
              </span>
            </div>
          </div>

          {/* Building Title */}
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
            {building.title}
          </h3>

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
        </div>
      </Card>
    </Link>
  );
});

BuildingCard.displayName = 'BuildingCard';