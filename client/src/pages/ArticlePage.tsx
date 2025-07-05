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
  const { '*': slugPath } = useParams();
  const slug = slugPath || '';
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
          let contentArray = article.content_blocks || [];
          
          // If pageData.content is a string, parse it
          if (typeof pageData.content === 'string') {
            try {
              contentArray = JSON.parse(pageData.content);
            } catch (e) {
              console.error('Failed to parse page content:', e);
            }
          } else if (pageData.content) {
            contentArray = pageData.content;
          }
          
          if (Array.isArray(contentArray)) {
            htmlContent = contentArray
              .map((item: any) => {
                switch (item.type) {
                  case 'paragraph':
                    return `<p class="mb-4 ${item.style?.fontStyle === 'italic' ? 'italic' : ''} ${item.style?.fontSize ? 'text-sm' : ''}" ${item.style?.color ? `style="color: ${item.style.color}"` : ''}>${item.content}</p>`;
                  case 'heading':
                    const level = item.level || 2;
                    return `<h${level} class="text-${level === 2 ? '2xl' : 'xl'} font-bold my-4">${item.content}</h${level}>`;
                  case 'video':
                    return `<div class="my-6">
                      ${item.caption ? `<p class="text-sm text-gray-600 mb-2">${item.caption}</p>` : ''}
                      <iframe src="${item.url.replace('watch?v=', 'embed/')}" class="w-full aspect-video rounded-lg" frameborder="0" allowfullscreen></iframe>
                    </div>`;
                  case 'divider':
                    return '<hr class="my-8 border-gray-300" />';
                  default:
                    return '';
                }
              })
              .join('\n');
          }
        }

        console.log('Debug - Article content parsing:', {
          slug,
          pageId: pageData.id,
          hasContentBlocks: contentBlocks?.length > 0,
          hasPageContent: !!pageData.content,
          hasArticleContentBlocks: !!article.content_blocks,
          htmlContentLength: htmlContent.length,
          pageContentType: typeof pageData.content,
          firstCharsOfHtml: htmlContent.substring(0, 100)
        });
        
        // If we still have no content, log what we tried
        if (!htmlContent) {
          console.log('No HTML content generated. Data check:', {
            pageContent: pageData.content?.substring(0, 100),
            articleContentBlocks: article.content_blocks?.slice(0, 2)
          });
        }

        const transformedArticle: Article = {
          id: article.id || pageData.id,
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
        headline: 'Grand Opening of JOB Junction',
        subheadline: 'A new hub for career development and professional growth in the heart of Kaiville',
        content: `
          <p>Today marks a significant milestone for Kaiville as we celebrate the grand opening of our new state-of-the-art JOB Junction. This modern facility represents our commitment to fostering career development, professional networking, and economic growth for all residents.</p>

          <p>The 25,000 square foot center features multiple training rooms, computer labs, interview preparation spaces, and dedicated areas for job fairs and networking events. The building was designed with sustainability in mind, incorporating solar panels, rainwater harvesting, and energy-efficient systems throughout.</p>

          <h2>Programs for Everyone</h2>

          <p>JOB Junction will offer programs for all career stages, from entry-level job seekers to experienced professionals looking to advance. Some highlights include:</p>

          <ul>
            <li>Resume writing and interview skills workshops</li>
            <li>Professional certification programs</li>
            <li>Career counseling and job placement services</li>
            <li>Networking events and job fairs</li>
          </ul>

          <p>"This center is more than just a building," said Mayor Thompson at the ribbon-cutting ceremony. "It's a place where careers are launched, where skills meet opportunities, and where our community's workforce thrives."</p>

          <h2>Join Us</h2>

          <p>JOB Junction is now open Monday through Saturday, 6 AM to 10 PM, and Sunday from 8 AM to 8 PM. Stop by for a tour, pick up a program guide, or sign up for career services at the front desk.</p>

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
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
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
        </div>

        {/* Article Header */}
        <div className="px-4 py-6 space-y-3 md:max-w-3xl lg:max-w-4xl mx-auto">
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
          className="px-4 prose prose-lg md:max-w-3xl lg:max-w-4xl mx-auto
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