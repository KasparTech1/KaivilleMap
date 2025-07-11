import React from 'react';
import { X } from 'lucide-react';

interface ActiveFiltersProps {
  selectedTags: string[];
  selectedCategories: string[];
  onRemoveTag: (tag: string) => void;
  onRemoveCategory: (category: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  selectedTags,
  selectedCategories,
  onRemoveTag,
  onRemoveCategory,
  onClearAll,
  className = ''
}) => {
  const hasActiveFilters = selectedTags.length > 0 || selectedCategories.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className={`px-4 py-3 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/50 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 font-medium">Active filters:</span>
        
        {/* Category Pills */}
        {selectedCategories.map(category => (
          <button
            key={category}
            onClick={() => onRemoveCategory(category)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#1f4e79] text-white text-sm rounded-full hover:bg-[#1f4e79]/90 transition-colors"
          >
            <span>{category}</span>
            <X className="w-3 h-3" />
          </button>
        ))}
        
        {/* Tag Pills */}
        {selectedTags.map(tag => (
          <button
            key={tag}
            onClick={() => onRemoveTag(tag)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#879651] text-white text-sm rounded-full hover:bg-[#879651]/90 transition-colors"
          >
            <span>{tag}</span>
            <X className="w-3 h-3" />
          </button>
        ))}
        
        {/* Clear All Button */}
        <button
          onClick={onClearAll}
          className="ml-auto text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  );
};