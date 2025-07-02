import React from 'react';
import { Link } from 'react-router-dom';
import { getAssetUrl } from '../config/assetUrls';

interface KNNTowerIconProps {
  isDayMode?: boolean;
}

export const KNNTowerIcon: React.FC<KNNTowerIconProps> = React.memo(({ isDayMode = true }) => {
  return (
    <Link to="/buildings/knn_tower" className="block group">
      <div className="relative transform transition-all duration-300 group-hover:scale-110">
        <img
          src={getAssetUrl('knn-tower.svg')}
          alt="Kaiville News Network"
          className={`w-full max-w-[4rem] sm:max-w-[6rem] md:max-w-[10rem] mx-auto drop-shadow-2xl transition-all duration-1000 ${
            !isDayMode ? 'brightness-110' : ''
          }`}
        />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          KNN Tower
        </div>
      </div>
    </Link>
  );
});

KNNTowerIcon.displayName = 'KNNTowerIcon';