import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, Loader2 } from 'lucide-react';
import { getAssetUrl } from '../config/assetUrls';
import { EditButton } from '../components/cms/EditButton';
import { supabase } from '../config/supabase';

interface Article {
  id: string;
  headline: string;
  subheadline: string;
  content: string;
  content_blocks?: any[];
  author_name: string;
  published_at: string;
  reading_time: number;
  featured_image_id: string | null;
  category_name?: string;
  news_type?: 'local' | 'world';
}

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try to find the page by slug
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('page_type', 'article')
        .single();

      if (pageError) {
        console.error('Error fetching page:', pageError);
        throw pageError;
      }

      if (pageData) {
        // Now fetch the article using the page_id
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select('*')
          .eq('page_id', pageData.id)
          .single();

        if (articleError && articleError.code !== 'PGRST116') {
          console.error('Error fetching article:', articleError);
        }

        // Fetch content blocks
        const { data: contentBlocks } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('page_id', pageData.id)
          .order('order_index', { ascending: true });

        const article = articleData || {};
        
        // Convert content blocks to HTML if available
        let htmlContent = '';
        
        // First check for content blocks (newer format)
        if (contentBlocks && contentBlocks.length > 0) {
          htmlContent = contentBlocks
            .map((block: any) => {
              switch (block.block_type) {
                case 'text':
                  return block.content?.text ? `<div>${block.content.text}</div>` : '';
                case 'image':
                  return block.content?.image_id ? 
                    `<img src="/api/assets/${block.content.image_id}" alt="${block.content.alt || ''}" class="my-6 rounded-lg" />` : '';
                case 'video':
                  return block.content?.video_url ? 
                    `<div class="my-6"><iframe src="${block.content.video_url}" class="w-full aspect-video rounded-lg" frameborder="0" allowfullscreen></iframe></div>` : '';
                case 'hero':
                  return block.content?.title ? 
                    `<h2 class="text-2xl font-bold my-4">${block.content.title}</h2>` : '';
                default:
                  return '';
              }
            })
            .join('\n');
        } 
        // If no content blocks, check for content in pages.content or articles.content_blocks
        else if (pageData.content || article.content_blocks) {
          const contentArray = pageData.content || article.content_blocks || [];
          if (Array.isArray(contentArray)) {
            htmlContent = contentArray
              .map((item: any) => {
                if (item.type === 'paragraph' && item.content) {
                  return `<p class="mb-4">${item.content}</p>`;
                }
                return '';
              })
              .join('\n');
          }
        }

        const transformedArticle: Article = {
          id: article.id,
          headline: article.headline || pageData.title,
          subheadline: article.subheadline || pageData.subtitle,
          content: htmlContent || article.content || pageData.description || '',
          content_blocks: contentBlocks,
          author_name: article.author_name || 'Kaiville Team',
          published_at: pageData.published_at || pageData.created_at,
          reading_time: article.reading_time || 5,
          featured_image_id: article.featured_image_id,
          category_name: 'News',
          news_type: article.tags?.includes('world') || 
                     article.author_name === 'KNN AI' ? 'world' : 'local'
        };

        setArticle(transformedArticle);
        return;
      }

      // If no article found, use mock data as fallback
      const mockArticle: Article = {
        id: '1',
        headline: 'Grand Opening of the New Community Center',
        subheadline: 'A new hub for connection and growth in the heart of Kaiville',
        content: `
          <p>Today marks a significant milestone for Kaiville as we celebrate the grand opening of our new state-of-the-art Community Center. This modern facility represents our commitment to fostering connection, learning, and growth for all residents.</p>

          <p>The 25,000 square foot center features multiple activity rooms, a full gymnasium, a teaching kitchen, and dedicated spaces for arts and crafts. The building was designed with sustainability in mind, incorporating solar panels, rainwater harvesting, and energy-efficient systems throughout.</p>

          <h2>Programs for Everyone</h2>

          <p>The Community Center will offer programs for all ages, from early childhood development classes to senior fitness programs. Some highlights include:</p>

          <ul>
            <li>Youth after-school programs and summer camps</li>
            <li>Adult education and skill-building workshops</li>
            <li>Health and wellness classes</li>
            <li>Community meeting spaces available for reservation</li>
          </ul>

          <p>"This center is more than just a building," said Mayor Thompson at the ribbon-cutting ceremony. "It's a place where neighbors become friends, where skills are shared, and where our community comes together to support one another."</p>

          <h2>Join Us</h2>

          <p>The Community Center is now open Monday through Saturday, 6 AM to 10 PM, and Sunday from 8 AM to 8 PM. Stop by for a tour, pick up a program guide, or sign up for classes at the front desk.</p>

          <p>We look forward to seeing you there!</p>
        `,
        author_name: 'Kaiville Team',
        published_at: new Date().toISOString(),
        reading_time: 3,
        featured_image_id: null,
        category_name: 'Community'
      };

      setArticle(mockArticle);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-gray-400" />
          <p className="text-lg text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-red-600">{error || 'Article not found'}</p>
          <Link to="/building/knn_tower">
            <button className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/building/knn_tower" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <img 
              src={getAssetUrl('knn-tower.svg')} 
              alt="KNN" 
              className="h-6 w-auto"
            />
            <span className="text-sm font-medium">KNN</span>
          </div>
          <button className="text-gray-600 hover:text-gray-900">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Article Content */}
      <article className="pb-20">
        {/* Hero Image */}
        <div className="aspect-[16/9] bg-gray-200 overflow-hidden">
          {article.featured_image_id ? (
            <img 
              src={`/api/assets/${article.featured_image_id}`} 
              alt={article.headline}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src={getAssetUrl('knn-tower.svg')} 
                alt="KNN Placeholder"
                className="w-24 h-24 opacity-20"
              />
            </div>
          )}
        </div>

        {/* Article Header */}
        <div className="px-4 py-6 space-y-3">
          <div className="flex items-center gap-3">
            {article.news_type && (
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                article.news_type === 'local' 
                  ? 'bg-[#879651]/10 text-[#879651]' 
                  : 'bg-[#1a464f]/10 text-[#1a464f]'
              }`}>
                {article.news_type === 'local' ? 'Local News' : 'World News'}
              </span>
            )}
            {article.category_name && (
              <span className="text-sm font-medium text-gray-600">{article.category_name}</span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {article.headline}
          </h1>
          
          {article.subheadline && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {article.subheadline}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
            <span>By {article.author_name}</span>
            <span>•</span>
            <span>{formatDate(article.published_at)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.reading_time} min read
            </span>
          </div>
        </div>

        {/* Article Body */}
        <div 
          className="px-4 prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-ul:my-6 prose-ul:space-y-2
            prose-li:text-gray-700 prose-li:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      {/* Edit Button */}
      <EditButton editPath={`/admin/article/${article.id}`} label="Edit Article" />
    </div>
  );
};