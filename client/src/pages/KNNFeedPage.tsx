import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { getAssetUrl } from '../config/assetUrls';
import { EditButton } from '../components/cms/EditButton';
import { supabase } from '../config/supabase';

interface ArticleCard {
  id: string;
  article_id: string;
  card_title: string;
  card_description: string;
  card_image_id: string | null;
  card_style: string;
  published_at: string;
  reading_time: number;
  author_name: string;
  category_name?: string;
  news_type: 'local' | 'world';
  slug: string;
}

export const KNNFeedPage: React.FC = () => {
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'local' | 'world'>('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(article => article.news_type === activeFilter));
    }
  }, [articles, activeFilter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try to fetch articles with a simpler query
      const { data: articlesData, error: fetchError } = await supabase
        .from('article_cards')
        .select(`
          *,
          articles!inner (
            *,
            pages!inner (
              *
            )
          )
        `)
        .eq('articles.pages.is_published', true)
        .eq('articles.pages.status', 'published')
        .limit(20);

      if (fetchError) {
        console.error('Error fetching articles:', fetchError);
        throw fetchError;
      }

      // Transform the data to match our interface
      const transformedArticles: ArticleCard[] = articlesData?.map(item => ({
        id: item.id,
        article_id: item.article_id,
        card_title: item.card_title,
        card_description: item.card_description,
        card_image_id: item.card_image_id,
        card_style: item.card_style || 'default',
        published_at: item.articles?.pages?.published_at || new Date().toISOString(),
        reading_time: item.articles?.reading_time || 5,
        author_name: item.articles?.author_name || 'Kaiville Team',
        category_name: 'News', // Simplified for now
        // Determine news type based on tags or author
        news_type: item.articles?.tags?.includes('world') || 
                   item.articles?.author_name === 'KNN Analysis' ? 'world' : 'local',
        slug: item.articles?.pages?.slug || `article-${item.id}`
      })).filter(article => article.card_title && article.card_description) || [];

      // If no articles in database, use mock data
      if (transformedArticles.length === 0) {
        const mockArticles: ArticleCard[] = [
        // Local News articles
        {
          id: '1',
          article_id: '1',
          card_title: 'Grand Opening of the New Community Center',
          card_description: 'Kaiville celebrates the opening of our state-of-the-art community center with activities for all ages...',
          card_image_id: null,
          card_style: 'default',
          published_at: new Date().toISOString(),
          reading_time: 3,
          author_name: 'Kaiville Team',
          category_name: 'Community',
          news_type: 'local',
          slug: 'grand-opening-community-center'
        },
        {
          id: '2',
          article_id: '2',
          card_title: 'Local Artist Wins National Recognition',
          card_description: 'Craft Works resident artist Jane Smith receives prestigious award for innovative sculpture series...',
          card_image_id: null,
          card_style: 'default',
          published_at: new Date(Date.now() - 86400000).toISOString(),
          reading_time: 5,
          author_name: 'Kaiville Team',
          category_name: 'Arts',
          news_type: 'local',
          slug: 'local-artist-national-recognition'
        },
        {
          id: '3',
          article_id: '3',
          card_title: 'Tech Innovation Hub Coming to Learning Lodge',
          card_description: 'New partnership brings cutting-edge technology programs and resources to our education center...',
          card_image_id: null,
          card_style: 'default',
          published_at: new Date(Date.now() - 172800000).toISOString(),
          reading_time: 4,
          author_name: 'Kaiville Team',
          category_name: 'Technology',
          news_type: 'local',
          slug: 'tech-hub-learning-lodge'
        },
        // World News articles (from YouTube analysis)
        {
          id: '4',
          article_id: '4',
          card_title: 'AI Breakthrough: New Language Model Achieves Human-Level Understanding',
          card_description: 'Researchers announce a revolutionary AI system that demonstrates unprecedented language comprehension...',
          card_image_id: null,
          card_style: 'default',
          published_at: new Date(Date.now() - 3600000).toISOString(),
          reading_time: 6,
          author_name: 'KNN Analysis',
          category_name: 'Technology',
          news_type: 'world',
          slug: 'ai-breakthrough-language-model'
        },
        {
          id: '5',
          article_id: '5',
          card_title: 'Global Climate Summit Reaches Historic Agreement',
          card_description: 'World leaders commit to ambitious new targets for carbon reduction and renewable energy adoption...',
          card_image_id: null,
          card_style: 'default',
          published_at: new Date(Date.now() - 7200000).toISOString(),
          reading_time: 7,
          author_name: 'KNN Analysis',
          category_name: 'Environment',
          news_type: 'world',
          slug: 'climate-summit-agreement'
        }
        ];
        setArticles(mockArticles);
      } else {
        setArticles(transformedArticles);
      }
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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <img 
              src={getAssetUrl('knn-tower.svg')} 
              alt="KNN" 
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-semibold">Kaiville News Network</h1>
          </div>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Filter Buttons */}
      <div className="sticky top-[57px] z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
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
            <Link 
              key={article.id} 
              to={`/news/${article.slug}`}
              className="block group"
            >
              <article className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
                {/* Image */}
                <div className="aspect-[16/9] bg-gray-200 overflow-hidden">
                  {article.card_image_id ? (
                    <img 
                      src={`/api/assets/${article.card_image_id}`} 
                      alt={article.card_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src={getAssetUrl('knn-tower.svg')} 
                        alt="KNN Placeholder"
                        className="w-16 h-16 opacity-20"
                      />
                    </div>
                  )}
                </div>

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
          ))}
        </div>

        {/* Mobile Feed */}
        <div className="md:hidden px-4 py-4 space-y-4">
          {filteredArticles.map((article) => (
            <Link 
              key={article.id} 
              to={`/news/${article.slug}`}
              className="block"
            >
              <article className="bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-4">
                {/* Large Image */}
                <div className="aspect-[16/9] bg-gray-200 rounded-lg mb-3 overflow-hidden">
                  {article.card_image_id ? (
                    <img 
                      src={`/api/assets/${article.card_image_id}`} 
                      alt={article.card_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src={getAssetUrl('knn-tower.svg')} 
                        alt="KNN Placeholder"
                        className="w-20 h-20 opacity-20"
                      />
                    </div>
                  )}
                </div>

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

                  {/* Read More */}
                  <span className="text-blue-600 text-sm font-medium">
                    Read more →
                  </span>
                </div>
              </div>
            </article>
          </Link>
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
    </div>
  );
};