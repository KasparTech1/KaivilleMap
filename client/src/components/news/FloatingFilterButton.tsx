import React from 'react';
import { Filter } from 'lucide-react';

interface FloatingFilterButtonProps {
  onClick: () => void;
  activeCount: number;
  className?: string;
}

export const FloatingFilterButton: React.FC<FloatingFilterButtonProps> = ({
  onClick,
  activeCount,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 bg-[#1f4e79] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 z-30 ${className}`}
      aria-label="Open filters"
    >
      <div className="relative p-4">
        <Filter className="w-6 h-6" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#1f4e79] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </div>
    </button>
  );
};