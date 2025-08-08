import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ChevronLeft, ExternalLink, Calendar, Building2, MapPin, Users } from 'lucide-react';

interface ResearchArticle {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  year?: number;
  region?: string;
  source_url?: string;
  source_type?: string;
  domains: string[];
  topics: string[];
  keywords: string[];
  summary?: string;
  key_points: string[];
  content_html: string;
  created_at: string;
  updated_at: string;
}

export const ResearchArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ResearchArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticle() {
      if (!slug) return;
      
      try {
        const res = await fetch(`/api/research/articles/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Research article not found');
          }
          throw new Error(`Error loading article: ${res.status}`);
        }
        const data = await res.json();
        setArticle(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load research article');
      } finally {
        setLoading(false);
      }
    }
    
    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <div className="text-[#1f4e79]">Loading research article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#F5F5DC]">
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <Link to="/" className="no-underline">
              <h1 className="text-2xl text-[#1f4e79] font-serif font-bold hover:text-[#D4AF37] transition cursor-pointer">
                Kaiville
              </h1>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-6 py-10 text-center">
          <h2 className="text-2xl text-[#1f4e79] mb-4">Article Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The research article you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/research')} className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Research Center
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="no-underline">
            <h1 className="text-2xl text-[#1f4e79] font-serif font-bold hover:text-[#D4AF37] transition cursor-pointer">
              Kaiville
            </h1>
          </Link>
          <Button 
            onClick={() => navigate('/research')} 
            className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Research Center
          </Button>
        </div>
      </header>

      {/* Article Content */}
      <article className="container mx-auto px-6 py-10 max-w-5xl">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1f4e79] mb-4">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-xl text-gray-600 mb-4">{article.subtitle}</p>
          )}
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            {article.authors.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{article.authors.join(', ')}</span>
              </div>
            )}
            {article.publisher && (
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{article.publisher}</span>
              </div>
            )}
            {article.year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{article.year}</span>
              </div>
            )}
            {article.region && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{article.region}</span>
              </div>
            )}
          </div>

          {/* Source Link */}
          {article.source_url && (
            <div className="mb-6">
              <a 
                href={article.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#1f4e79] hover:text-[#D4AF37] transition"
              >
                <ExternalLink className="w-4 h-4" />
                View Original Source
              </a>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {article.domains.map((domain) => (
              <Badge key={domain} className="bg-[#1f4e79]/10 text-[#1f4e79] hover:bg-[#1f4e79]/20">
                {domain}
              </Badge>
            ))}
            {article.topics.map((topic) => (
              <Badge key={topic} className="bg-[#D4AF37]/10 text-[#6b5400] hover:bg-[#D4AF37]/20">
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        {article.summary && (
          <Card className="bg-white p-6 mb-8 border-l-4 border-[#1f4e79]">
            <h2 className="text-lg font-semibold text-[#1f4e79] mb-2">Summary</h2>
            <p className="text-gray-700 italic">{article.summary.replace(/^>\s*/, '')}</p>
          </Card>
        )}

        {/* Key Points */}
        {article.key_points.length > 0 && (
          <Card className="bg-white p-6 mb-8">
            <h2 className="text-lg font-semibold text-[#1f4e79] mb-4">Key Points</h2>
            <ul className="space-y-2">
              {article.key_points.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-[#D4AF37] mr-2">•</span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Main Content */}
        <Card className="bg-white p-8">
          <h2 className="text-xl font-semibold text-[#1f4e79] mb-6">Full Research Content</h2>
          <div 
            className="prose prose-lg max-w-none
              prose-headings:text-[#1f4e79] prose-headings:font-serif prose-headings:font-bold
              prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
              prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
              prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-[#1f4e79] prose-a:no-underline hover:prose-a:text-[#D4AF37]
              prose-strong:text-[#1f4e79] prose-strong:font-bold
              prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
              prose-li:mb-2
              prose-blockquote:border-l-4 prose-blockquote:border-[#D4AF37] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4
              prose-code:bg-gray-100 prose-code:text-[#1f4e79] prose-code:px-1 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded prose-pre:overflow-x-auto
              [&>*]:mb-4 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: article.content_html }}
          />
        </Card>

        {/* Footer Metadata */}
        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>Published: {new Date(article.created_at).toLocaleDateString()}</p>
          {article.source_type && (
            <p className="mt-1">Type: {article.source_type.replace(/_/g, ' ')}</p>
          )}
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 mt-20">
        <div className="container mx-auto px-6 text-center text-gray-400">
          © 2025 Kaspar Companies. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ResearchArticleDetailPage;