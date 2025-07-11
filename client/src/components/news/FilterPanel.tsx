import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';
import { TagService, TagWithCount, CategoryWithCount } from '../../services/tagService';

interface FilterPanelProps {
  selectedTags: string[];
  selectedCategories: string[];
  onTagsChange: (tags: string[]) => void;
  onCategoriesChange: (categories: string[]) => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedTags,
  selectedCategories,
  onTagsChange,
  onCategoriesChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tagsResult, categoriesResult] = await Promise.all([
        TagService.getUniqueTags(),
        TagService.getUniqueCategories()
      ]);

      if (tagsResult.error) throw tagsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setTags(tagsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (err) {
      console.error('Error fetching filters:', err);
      setError('Failed to load filters');
    } finally {
      setLoading(false);
    }
  };

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

  const clearAllFilters = () => {
    onTagsChange([]);
    onCategoriesChange([]);
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedCategories.length > 0;

  return (
    <div className={`bg-white/80 backdrop-blur-xl border-b border-gray-200/50 ${className}`}>
      {/* Mobile Collapsed View */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              Filters {hasActiveFilters && `(${selectedTags.length + selectedCategories.length})`}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Mobile Expanded Content */}
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[80vh]' : 'max-h-0'}`}>
          <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading filters...</div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">{error}</div>
            ) : (
              <>
                {/* Categories Section */}
                {categories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map(({ category, count }) => (
                        <label key={category} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="w-4 h-4 text-[#1f4e79] rounded border-gray-300 focus:ring-[#1f4e79]"
                          />
                          <span className="flex-1 text-gray-700">{category}</span>
                          <span className="text-sm text-gray-500">({count})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags Section */}
                {tags.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {tags.map(({ tag, count }) => (
                        <label key={tag} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag)}
                            onChange={() => toggleTag(tag)}
                            className="w-4 h-4 text-[#1f4e79] rounded border-gray-300 focus:ring-[#1f4e79]"
                          />
                          <span className="flex-1 text-gray-700">{tag}</span>
                          <span className="text-sm text-gray-500">({count})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                  >
                    Clear All Filters
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Horizontal View */}
      <div className="hidden md:block">
        <div className="px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filter by:</span>
            </div>

            {/* Desktop Categories */}
            {!loading && categories.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Category:</span>
                <div className="flex gap-2">
                  {categories.map(({ category, count }) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        selectedCategories.includes(category)
                          ? 'bg-[#1f4e79] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category} ({count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Tags Dropdown */}
            {!loading && tags.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                  Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3 max-h-80 overflow-y-auto">
                    {tags.map(({ tag, count }) => (
                      <label key={tag} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded px-2">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="w-4 h-4 text-[#1f4e79] rounded border-gray-300 focus:ring-[#1f4e79]"
                        />
                        <span className="flex-1 text-gray-700">{tag}</span>
                        <span className="text-sm text-gray-500">({count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="ml-auto flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};