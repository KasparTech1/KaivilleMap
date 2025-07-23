import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, Loader2, GripVertical, Edit2 } from 'lucide-react';
import { getAssetUrl } from '../config/assetUrls';
import { EditButton } from '../components/cms/EditButton';
import { supabase } from '../config/supabase';
import { FilterPanel } from '../components/news/FilterPanel';
import { ActiveFilters } from '../components/news/ActiveFilters';
import { BottomSheet } from '../components/news/BottomSheet';
import { FloatingFilterButton } from '../components/news/FloatingFilterButton';
import { MobileFilterPanel } from '../components/news/MobileFilterPanel';
import { TagService } from '../services/tagService';

interface ArticleCard {
  id: string;
  article_id: string;
  card_title: string;
  card_description: string;
  card_image_id: string | null;
  card_image_url?: string | null;
  card_style: string;
  published_at: string;
  reading_time: number;
  author_name: string;
  category_name?: string;
  primary_category?: string;
  tags?: string[];
  news_type: 'local' | 'world';
  slug: string;
  display_order?: number;
}

export const KNNFeedPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'local' | 'world'>(() => {
    const type = searchParams.get('type');
    return (type === 'local' || type === 'world') ? type : 'all';
  });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tags = searchParams.get('tags');
    return tags ? tags.split(',').filter(Boolean) : [];
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categories = searchParams.get('categories');
    return categories ? categories.split(',').filter(Boolean) : [];
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filterData, setFilterData] = useState<{
    tags: any[];
    categories: any[];
    loading: boolean;
    error: string | null;
  }>({
    tags: [],
    categories: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchArticles();
    fetchFilterData();
  }, []);
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    }
    
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    }
    
    if (activeFilter !== 'all') {
      params.set('type', activeFilter);
    }
    
    setSearchParams(params);
  }, [selectedTags, selectedCategories, activeFilter, setSearchParams]);

  useEffect(() => {
    let filtered = articles;
    
    // Filter by news type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(article => article.news_type === activeFilter);
    }
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(article => 
        article.primary_category && selectedCategories.includes(article.primary_category)
      );
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(article => {
        if (!article.tags || article.tags.length === 0) return false;
        const articleTagsLower = article.tags.map(t => t.toLowerCase());
        return selectedTags.some(tag => articleTagsLower.includes(tag.toLowerCase()));
      });
    }
    
    setFilteredArticles(filtered);
  }, [articles, activeFilter, selectedTags, selectedCategories]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, articleId: string) => {
    setDraggedItem(articleId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', articleId);
  };

  const handleDragOver = (e: React.DragEvent, articleId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(articleId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      setDraggedOver(null);
      return;
    }

    // Reorder the articles
    const newArticles = [...articles];
    const draggedIndex = newArticles.findIndex(article => article.id === draggedItem);
    const targetIndex = newArticles.findIndex(article => article.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedArticle] = newArticles.splice(draggedIndex, 1);
      newArticles.splice(targetIndex, 0, draggedArticle);
      
      // Update display_order for all articles
      const updatedArticles = newArticles.map((article, index) => ({
        ...article,
        display_order: index + 1
      }));
      
      setArticles(updatedArticles);
      
      // Save the new order to database
      await saveArticleOrder(updatedArticles);
    }
    
    setDraggedItem(null);
    setDraggedOver(null);
  };

  const saveArticleOrder = async (orderedArticles: ArticleCard[]) => {
    try {
      // Update each article's display_order in the database
      const updates = orderedArticles.map((article, index) => ({
        id: article.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('articles')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      
      console.log('Article order saved successfully');
    } catch (error) {
      console.error('Error saving article order:', error);
    }
  };

  // Helper function to extract YouTube video ID and get thumbnail URL
  const getYouTubeThumbnail = (pageData: any): string | null => {
    try {
      // Check featured_video_url first
      if (pageData?.featured_video_url && pageData.featured_video_url.includes('youtube.com')) {
        const match = pageData.featured_video_url.match(/[?&]v=([^&]+)/);
        if (match) {
          return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
        }
      }

      // Check content if it's a string (YouTube imports)
      if (typeof pageData?.content === 'string') {
        try {
          const content = JSON.parse(pageData.content);
          if (Array.isArray(content)) {
            const videoItem = content.find((item: any) => item.type === 'video' && item.url?.includes('youtube.com'));
            if (videoItem?.url) {
              const match = videoItem.url.match(/[?&]v=([^&]+)/);
              if (match) {
                return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
              }
            }
          }
        } catch (e) {
          // Not JSON, skip
        }
      }

      // Check content_blocks array
      if (Array.isArray(pageData?.content_blocks)) {
        const videoBlock = pageData.content_blocks.find((block: any) => 
          block.block_type === 'video' && block.content?.video_url?.includes('youtube.com')
        );
        if (videoBlock?.content?.video_url) {
          const match = videoBlock.content.video_url.match(/[?&]v=([^&]+)/);
          if (match) {
            return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
          }
        }
      }
    } catch (error) {
      console.error('Error extracting YouTube thumbnail:', error);
    }
    return null;
  };

  const fetchFilterData = async () => {
    try {
      setFilterData(prev => ({ ...prev, loading: true, error: null }));
      
      const [tagsResult, categoriesResult] = await Promise.all([
        TagService.getUniqueTags(),
        TagService.getUniqueCategories()
      ]);

      if (tagsResult.error) throw tagsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setFilterData({
        tags: tagsResult.data || [],
        categories: categoriesResult.data || [],
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Error fetching filter data:', err);
      setFilterData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load filters'
      }));
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch articles directly from articles table with pages
      const { data: articlesData, error: fetchError } = await supabase
        .from('articles')
        .select(`
          *,
          pages!inner (
            *
          )
        `)
        .eq('pages.is_published', true)
        .eq('pages.status', 'published')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        console.error('Error fetching articles:', fetchError);
        throw fetchError;
      }

      // Transform the data to match our interface, building cards from article data
      const transformedArticles: ArticleCard[] = articlesData?.map(article => {
        // Extract YouTube thumbnail if no featured image
        let cardImageUrl = null;
        if (!article.featured_image_id) {
          cardImageUrl = getYouTubeThumbnail(article.pages);
        }

        // Generate card description from article content or use subheadline
        let cardDescription = article.subheadline || '';
        if (!cardDescription && article.content_blocks) {
          try {
            // Try to extract description from content blocks
            const blocks = Array.isArray(article.content_blocks) ? article.content_blocks : JSON.parse(article.content_blocks);
            const textBlock = blocks.find(block => block.type === 'text' || block.type === 'paragraph');
            if (textBlock && textBlock.content) {
              cardDescription = textBlock.content.substring(0, 200) + '...';
            }
          } catch (e) {
            // If content parsing fails, use a default description
            cardDescription = `Read about ${article.headline}`;
          }
        }

        return {
          id: article.id,
          article_id: article.id,
          card_title: article.headline,
          card_description: cardDescription,
          card_image_id: article.featured_image_id,
          card_image_url: cardImageUrl,
          card_style: 'default',
          published_at: article.pages?.published_at || article.created_at || new Date().toISOString(),
          reading_time: article.reading_time || 5,
          author_name: article.author_name || 'Kaiville Team',
          category_name: article.primary_category || 'News',
          primary_category: article.primary_category || 'News',
          tags: article.tags || [],
          // Determine news type based on tags or author
          news_type: article.tags?.includes('world') || 
                     article.author_name === 'KNN AI' || 
                     article.author_name === 'KNN Analysis' ? 'world' : 'local',
          slug: article.pages?.slug || `article-${article.id}`,
          display_order: article.display_order || 999
        };
      }).filter(article => article.card_title && article.card_description) || [];

      // Set articles from database (no mock data fallback)
      setArticles(transformedArticles);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load news articles');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-gray-400" />
          <p className="text-lg text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-red-600">{error}</p>
          <Link to="/">
            <button className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              Back to Map
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="text-[#1f4e79] hover:text-[#D4AF37] transition mr-4">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center gap-2">
                <img 
                  src={getAssetUrl('knn-tower.svg')} 
                  alt="KNN" 
                  className="h-8 w-auto"
                />
                <h1 className="text-2xl text-[#1f4e79] font-serif font-bold">Kaiville News Network</h1>
              </div>
              <nav className="ml-10 hidden md:block">
                <ul className="flex space-x-8">
                  <li>
                    <Link to="/" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      Map
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/heritage_center" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (1) Stewardship Hall
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/community-center" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (2) JOB Junction
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/learning_lodge" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (3) SKILLS Academy
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/celebration_station" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (4) Innovation Plaza
                    </Link>
                  </li>
                  <li>
                    <Link to="/building/kasp_tower" className="text-[#1f4e79] hover:text-[#D4AF37] transition">
                      (5) Kaizen Tower
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <button className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90 px-4 py-2 rounded-md transition">
                  Return to Map
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Filter Panel */}
      <div className="hidden md:block">
        <FilterPanel
          selectedTags={selectedTags}
          selectedCategories={selectedCategories}
          onTagsChange={setSelectedTags}
          onCategoriesChange={setSelectedCategories}
          className="sticky top-[73px] z-30"
        />
      </div>

      {/* Active Filters - Show on both mobile and desktop */}
      <ActiveFilters
        selectedTags={selectedTags}
        selectedCategories={selectedCategories}
        onRemoveTag={(tag) => setSelectedTags(selectedTags.filter(t => t !== tag))}
        onRemoveCategory={(cat) => setSelectedCategories(selectedCategories.filter(c => c !== cat))}
        onClearAll={() => {
          setSelectedTags([]);
          setSelectedCategories([]);
        }}
        className="sticky top-[73px] md:top-[120px] z-30"
      />

      {/* Filter Buttons */}
      <div className="sticky top-[120px] md:top-[169px] z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="px-4 py-3">
          <div className="flex gap-2 max-w-md mx-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                activeFilter === 'all'
                  ? 'bg-[#6f5a37] text-white shadow-lg shadow-[#6f5a37]/30' // Warm brown from buildings
                  : 'bg-white/70 backdrop-blur text-gray-600 hover:bg-white hover:shadow-md border border-gray-200/50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('local')}
              className={`flex-1 py-2 px-4 rounded-full font-medium transition-all ${
                activeFilter === 'local'
                  ? 'bg-[#879651] text-white shadow-lg shadow-[#879651]/30' // Olive green from buildings
                  : 'bg-white/70 backdrop-blur text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
              }`}
            >
              Local News
            </button>
            <button
              onClick={() => setActiveFilter('world')}
              className={`flex-1 py-2 px-4 rounded-full font-medium transition-all ${
                activeFilter === 'world'
                  ? 'bg-[#1a464f] text-white shadow-lg shadow-[#1a464f]/30' // Dark teal from welcome sign
                  : 'bg-white/70 backdrop-blur text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
              }`}
            >
              World News
            </button>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <main className="pb-20 bg-gray-50">
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="block group relative"
              draggable
              onDragStart={(e) => handleDragStart(e, article.id)}
              onDragOver={(e) => handleDragOver(e, article.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, article.id)}
            >
              {/* Drag Handle */}
              <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-move">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200/50">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              
              <Link 
                to={`/news/${article.slug}`}
                className="block"
              >
                <article className={`bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1 ${
                  draggedOver === article.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                } ${draggedItem === article.id ? 'opacity-50' : ''}`}>
                {/* Image - Only show if we have an image */}
                {(article.card_image_id || article.card_image_url) && (
                  <div className="aspect-[16/9] bg-gray-200 overflow-hidden">
                    {article.card_image_id ? (
                      <img 
                        src={`/api/assets/${article.card_image_id}`} 
                        alt={article.card_title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <img 
                        src={article.card_image_url} 
                        alt={article.card_title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Hide the entire image container on error
                          const imageContainer = e.currentTarget.parentElement;
                          if (imageContainer) {
                            imageContainer.style.display = 'none';
                          }
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                    <span className={`font-medium ${
                      article.news_type === 'local' ? 'text-[#879651]' : 'text-[#1a464f]'
                    }`}>
                      {article.news_type === 'local' ? 'Local' : 'World'}
                    </span>
                    {article.category_name && (
                      <>
                        <span>•</span>
                        <span>{article.category_name}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{formatDate(article.published_at)}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                    {article.card_title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                    {article.card_description}
                  </p>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs font-medium text-gray-500">
                          +{article.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.reading_time} min
                    </span>
                    <span className="text-blue-600 text-sm font-medium">
                      Read →
                    </span>
                  </div>
                </div>
              </article>
              </Link>
              {/* Edit Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: Open edit modal for this article
                  console.log('Edit article:', article.id);
                }}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-gray-900 p-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                title="Edit Article"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Mobile Feed */}
        <div className="md:hidden px-4 py-4 space-y-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="block group relative"
              draggable
              onDragStart={(e) => handleDragStart(e, article.id)}
              onDragOver={(e) => handleDragOver(e, article.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, article.id)}
            >
              {/* Drag Handle */}
              <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-move">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200/50">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              
              <Link 
                to={`/news/${article.slug}`}
                className="block"
              >
                <article className={`bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  draggedOver === article.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                } ${draggedItem === article.id ? 'opacity-50' : ''}`}>
                <div className="p-4">
                {/* Large Image - Only show if we have an image */}
                {(article.card_image_id || article.card_image_url) && (
                  <div className="aspect-[16/9] bg-gray-200 rounded-lg mb-3 overflow-hidden">
                    {article.card_image_id ? (
                      <img 
                        src={`/api/assets/${article.card_image_id}`} 
                        alt={article.card_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={article.card_image_url} 
                        alt={article.card_title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide the entire image container on error
                          const imageContainer = e.currentTarget.parentElement;
                          if (imageContainer) {
                            imageContainer.style.display = 'none';
                          }
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="space-y-2">
                  {/* Category and Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className={`font-medium ${
                      article.news_type === 'local' ? 'text-[#879651]' : 'text-[#1a464f]'
                    }`}>
                      {article.news_type === 'local' ? 'Local' : 'World'}
                    </span>
                    {article.category_name && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-gray-600">{article.category_name}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{formatDate(article.published_at)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.reading_time} min read
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">
                    {article.card_title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 line-clamp-2">
                    {article.card_description}
                  </p>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs font-medium text-gray-500">
                          +{article.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Read More */}
                  <span className="text-blue-600 text-sm font-medium">
                    Read more →
                  </span>
                </div>
              </div>
            </article>
            </Link>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="flex items-center justify-center py-20 px-4">
            <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg p-12 max-w-md mx-auto text-center">
              <img 
                src={getAssetUrl('knn-tower.svg')} 
                alt="KNN"
                className="w-24 h-24 mx-auto opacity-30 mb-6"
              />
              <p className="text-gray-600 font-medium text-lg mb-2">
                {activeFilter === 'local' ? 'No local news articles yet.' : 
                 activeFilter === 'world' ? 'No world news articles yet.' : 
                 'No news articles yet.'}
              </p>
              <p className="text-gray-500 text-sm">Check back soon for the latest updates!</p>
            </div>
          </div>
        )}
      </main>

      {/* Edit Button */}
      <EditButton editPath="/admin/news" label="Edit News Feed" />
      
      {/* Mobile Filter Button */}
      <div className="md:hidden">
        <FloatingFilterButton
          onClick={() => setFilterSheetOpen(true)}
          activeCount={selectedTags.length + selectedCategories.length}
        />
      </div>
      
      {/* Mobile Filter Bottom Sheet */}
      <BottomSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        snapPoints={[0.5, 0.9]}
        defaultSnapPoint={0}
      >
        <MobileFilterPanel
          tags={filterData.tags}
          categories={filterData.categories}
          selectedTags={selectedTags}
          selectedCategories={selectedCategories}
          onTagsChange={setSelectedTags}
          onCategoriesChange={setSelectedCategories}
          onClearAll={() => {
            setSelectedTags([]);
            setSelectedCategories([]);
          }}
          onClose={() => setFilterSheetOpen(false)}
          loading={filterData.loading}
          error={filterData.error}
        />
      </BottomSheet>
    </div>
  );
};