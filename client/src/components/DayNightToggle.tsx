import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface DayNightToggleProps {
  isDayMode: boolean;
  onToggle: () => void;
}

export const DayNightToggle: React.FC<DayNightToggleProps> = ({ isDayMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        relative w-16 h-8 rounded-full transition-all duration-500 ease-in-out
        ${isDayMode ? 'bg-sky-200' : 'bg-indigo-900'}
        shadow-lg hover:shadow-xl transform hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDayMode ? 'focus:ring-sky-400' : 'focus:ring-indigo-400'}
      `}
      aria-label={isDayMode ? 'Switch to night mode' : 'Switch to day mode'}
    >
      {/* Sun/Moon indicator */}
      <div
        className={`
          absolute top-1 w-6 h-6 rounded-full transition-all duration-500 ease-in-out
          ${isDayMode ? 'left-1' : 'left-9'}
          ${isDayMode ? 'bg-yellow-400' : 'bg-gray-200'}
          shadow-md flex items-center justify-center
        `}
      >
        {isDayMode ? (
          <Sun className="w-4 h-4 text-yellow-600" />
        ) : (
          <Moon className="w-4 h-4 text-gray-600" />
        )}
      </div>
      
      {/* Stars for night mode */}
      {!isDayMode && (
        <>
          <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-pulse" />
          <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-75" />
          <div className="absolute top-3 left-5 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-150" />
        </>
      )}
      
      {/* Cloud for day mode */}
      {isDayMode && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-2 bg-white/60 rounded-full" />
          <div className="w-2 h-1.5 bg-white/60 rounded-full -mt-1 ml-1" />
        </div>
      )}
    </button>
  );
};