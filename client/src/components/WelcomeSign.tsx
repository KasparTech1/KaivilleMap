import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles } from 'lucide-react';

export const WelcomeSign: React.FC = React.memo(() => {

  return (
    <Link to="/" className="block" onClick={(e) => {
      e.preventDefault();
      window.location.reload();
    }}>
      <div className="relative group cursor-pointer">
        {/* Main Sign with SVG */}
        <div className="relative transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
          <img
            src="/assets/kai-welocme.svg"
            alt="Welcome to Kaiville"
            className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto drop-shadow-2xl"
            onLoad={() => {
              // Dispatch a custom event when the image loads
              window.dispatchEvent(new Event('welcomeSignLoaded'));
            }}
            onError={(e) => {
              // Fallback to the original design if SVG fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />

          {/* Fallback Sign */}
          <div
            className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-2xl shadow-2xl p-6"
            style={{ display: 'none' }}
          >
            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-bounce" />
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />

            {/* Sign Content */}
            <div className="flex items-center justify-center space-x-3">
              <MapPin className="w-8 h-8 text-white drop-shadow-lg" />
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  Welcome to Kaiville
                </h1>
                <p className="text-white/90 text-sm md:text-base font-medium mt-1">
                  Explore Our Interactive Town Map
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-white drop-shadow-lg" />
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </div>
        </div>

      </div>
    </Link>
  );
});

WelcomeSign.displayName = 'WelcomeSign';