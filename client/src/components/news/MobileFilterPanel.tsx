import React from 'react';
import { TagWithCount, CategoryWithCount } from '../../services/tagService';

interface MobileFilterPanelProps {
  tags: TagWithCount[];
  categories: CategoryWithCount[];
  selectedTags: string[];
  selectedCategories: string[];
  onTagsChange: (tags: string[]) => void;
  onCategoriesChange: (categories: string[]) => void;
  onClearAll: () => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

export const MobileFilterPanel: React.FC<MobileFilterPanelProps> = ({
  tags,
  categories,
  selectedTags,
  selectedCategories,
  onTagsChange,
  onCategoriesChange,
  onClearAll,
  onClose,
  loading = false,
  error = null
}) => {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedCategories.length > 0;

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="w-16" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Articles</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1f4e79] text-white rounded-lg font-medium hover:bg-[#1f4e79]/90 transition-colors"
          >
            Close
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f4e79]"></div>
            <p className="mt-4 text-gray-500">Loading filters...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="w-16" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Articles</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1f4e79] text-white rounded-lg font-medium hover:bg-[#1f4e79]/90 transition-colors"
          >
            Close
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        {/* Clear all button - left side */}
        <button
          onClick={onClearAll}
          className={`text-sm font-medium transition-colors ${
            hasActiveFilters 
              ? 'text-[#1f4e79] hover:text-[#1f4e79]/80' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          disabled={!hasActiveFilters}
        >
          Clear all
        </button>
        
        {/* Title - center */}
        <h2 className="text-lg font-semibold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
          Filter Articles
        </h2>
        
        {/* Close button - right side */}
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#1f4e79] text-white rounded-lg font-medium hover:bg-[#1f4e79]/90 transition-colors"
        >
          Close
        </button>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
            Categories
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(({ category, count }) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedCategories.includes(category)
                    ? 'border-[#1f4e79] bg-[#1f4e79] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">{category}</div>
                <div className="text-xs opacity-75 mt-1">({count})</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
            Popular Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 20).map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-[#879651] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag} ({count})
              </button>
            ))}
          </div>
          {tags.length > 20 && (
            <p className="text-sm text-gray-500 mt-3">
              Showing top 20 tags of {tags.length} total
            </p>
          )}
        </div>
      )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{selectedTags.length + selectedCategories.length}</span> filters active
            </p>
          </div>
        )}
      </div>
    </div>
  );
};