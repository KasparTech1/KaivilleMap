import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { ChevronLeft, ExternalLink, Calendar, Building2, MapPin, Users, Trash2, Cpu, Brain, Zap, FileText, BarChart3, Factory, Clock, Edit, Save, X } from 'lucide-react';
// Temporarily comment out MDEditor to debug
// import MDEditor from '@uiw/react-md-editor';
import { EditableField } from '../components/research/EditableField';
import { updateResearchArticle } from '../api/research';
import DOMPurify from 'dompurify';

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
  content_md?: string;
  created_at: string;
  updated_at: string;
  // Research Generator aligned fields
  business_unit?: string;
  research_domain?: string;
  analysis_method?: string;
  report_type?: string;
  ai_model?: string;
  generation_template?: string;
  prompt_segments?: any;
  tokens_used?: number;
  generation_time_ms?: number;
}

export const ResearchArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ResearchArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedArticle, setEditedArticle] = useState<ResearchArticle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
        console.log('Article loaded:', { 
          id: data.id, 
          title: data.title, 
          slug: data.slug,
          hasContentMd: !!data.content_md,
          contentMdLength: data.content_md?.length || 0
        });
        setArticle(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load research article');
      } finally {
        setLoading(false);
      }
    }
    
    loadArticle();
  }, [slug]);

  async function handleDelete() {
    if (!article) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/research/articles/${article.id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        throw new Error(`Failed to delete: ${res.status}`);
      }
      
      // Navigate back to research list after successful deletion
      navigate('/research');
    } catch (e: any) {
      console.error('Delete error:', e);
      alert(`Failed to delete article: ${e.message}`);
    } finally {
      setDeleting(false);
    }
  }

  const handleEdit = () => {
    if (!article) {
      console.error('Cannot edit: article is null');
      return;
    }
    
    // Create a deep copy of the article to avoid reference issues
    const articleCopy = {
      ...article,
      // Ensure content_md exists - if not, try to convert from HTML or use empty string
      content_md: article.content_md || '', // We'll just use empty string if no markdown exists
      authors: [...(article.authors || [])],
      key_points: [...(article.key_points || [])],
      domains: [...(article.domains || [])],
      topics: [...(article.topics || [])],
      keywords: [...(article.keywords || [])],
    };
    
    console.log('Entering edit mode with article:', articleCopy);
    
    setEditedArticle(articleCopy);
    setIsEditMode(true);
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return;
      }
    }
    setIsEditMode(false);
    setEditedArticle(null);
    setHasUnsavedChanges(false);
  };

  const handleSave = async () => {
    if (!editedArticle) return;
    
    setIsSaving(true);
    try {
      const updatedArticle = await updateResearchArticle(editedArticle.id, {
        title: editedArticle.title,
        subtitle: editedArticle.subtitle,
        business_unit: editedArticle.business_unit,
        research_domain: editedArticle.research_domain,
        analysis_method: editedArticle.analysis_method,
        report_type: editedArticle.report_type,
        summary: editedArticle.summary,
        key_points: editedArticle.key_points,
        content_md: editedArticle.content_md,
        authors: editedArticle.authors,
        year: editedArticle.year,
        region: editedArticle.region,
        source_url: editedArticle.source_url,
        domains: editedArticle.domains,
        topics: editedArticle.topics,
        keywords: editedArticle.keywords,
      });
      
      setArticle(updatedArticle);
      setIsEditMode(false);
      setEditedArticle(null);
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Failed to save changes: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!editedArticle) {
      console.error('Cannot change field: editedArticle is null');
      return;
    }
    
    setEditedArticle({
      ...editedArticle,
      [field]: value,
    });
    setHasUnsavedChanges(true);
  };

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
          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <>
                <Button
                  onClick={handleEdit}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Research Article?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the research article
                    "{article.title}" and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Article
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
                <Button 
                  onClick={() => navigate('/research')} 
                  className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Research Center
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSaving || !hasUnsavedChanges}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Debug Info */}
      {isEditMode && (
        <div className="container mx-auto px-6 py-2 max-w-5xl">
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
            Debug: isEditMode={String(isEditMode)}, editedArticle={editedArticle ? 'exists' : 'null'}, 
            hasContentMd={editedArticle?.content_md ? 'yes' : 'no'}
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="container mx-auto px-6 py-10 max-w-5xl">
        {/* Title Section */}
        <div className="mb-8">
          {!isEditMode ? (
            <>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1f4e79] mb-4">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="text-xl text-gray-600 mb-4">{article.subtitle}</p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <EditableField
                label="Title"
                value={editedArticle?.title || ''}
                type="text"
                onChange={(value) => handleFieldChange('title', value)}
                placeholder="Enter article title"
              />
              <EditableField
                label="Subtitle"
                value={editedArticle?.subtitle || ''}
                type="text"
                onChange={(value) => handleFieldChange('subtitle', value)}
                placeholder="Enter subtitle (optional)"
              />
            </div>
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

          {/* Edit Mode - Metadata Fields */}
          {isEditMode && editedArticle && (
            <Card className="bg-gray-50 p-6 mb-6 border border-gray-300">
              <h3 className="text-lg font-semibold text-[#1f4e79] mb-4">Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                  label="Business Unit"
                  value={editedArticle?.business_unit || 'none'}
                  type="select"
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'bedrock', label: 'Bedrock Truck Beds' },
                    { value: 'circle_y', label: 'Circle Y Saddles' },
                    { value: 'horizon', label: 'Horizon Firearms' },
                    { value: 'wire_works', label: 'Wire Works' },
                    { value: 'precious_metals', label: 'TX Precious Metals' },
                  ]}
                  onChange={(value) => handleFieldChange('business_unit', value === 'none' ? null : value)}
                />
                <EditableField
                  label="Research Domain"
                  value={editedArticle?.research_domain || 'none'}
                  type="select"
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'manufacturing', label: 'Manufacturing Optimization' },
                    { value: 'quality', label: 'Quality & Automation' },
                    { value: 'supply_chain', label: 'Supply Chain' },
                    { value: 'market', label: 'Market Analysis' },
                    { value: 'innovation', label: 'Product Innovation' },
                  ]}
                  onChange={(value) => handleFieldChange('research_domain', value === 'none' ? null : value)}
                />
                <EditableField
                  label="Analysis Method"
                  value={editedArticle?.analysis_method || 'none'}
                  type="select"
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'predictive', label: 'Predictive Analytics' },
                    { value: 'process_mining', label: 'Process Mining' },
                    { value: 'ai_automation', label: 'AI Automation' },
                    { value: 'benchmarking', label: 'Industry Benchmarking' },
                    { value: 'roi_analysis', label: 'ROI Analysis' },
                  ]}
                  onChange={(value) => handleFieldChange('analysis_method', value === 'none' ? null : value)}
                />
                <EditableField
                  label="Report Type"
                  value={editedArticle?.report_type || 'none'}
                  type="select"
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'executive', label: 'Executive Brief' },
                    { value: 'technical', label: 'Technical Report' },
                    { value: 'implementation', label: 'Implementation Plan' },
                    { value: 'case_study', label: 'Case Study' },
                  ]}
                  onChange={(value) => handleFieldChange('report_type', value === 'none' ? null : value)}
                />
                <EditableField
                  label="Authors"
                  value={editedArticle?.authors || []}
                  type="list"
                  onChange={(value) => handleFieldChange('authors', value)}
                />
                <EditableField
                  label="Year"
                  value={editedArticle?.year || ''}
                  type="number"
                  onChange={(value) => handleFieldChange('year', value)}
                  placeholder="Enter publication year"
                />
                <EditableField
                  label="Summary"
                  value={editedArticle?.summary || ''}
                  type="textarea"
                  onChange={(value) => handleFieldChange('summary', value)}
                  placeholder="Enter article summary"
                  className="md:col-span-2"
                />
                <EditableField
                  label="Key Points"
                  value={editedArticle?.key_points || []}
                  type="list"
                  onChange={(value) => handleFieldChange('key_points', value)}
                  className="md:col-span-2"
                />
              </div>
            </Card>
          )}

          {/* Research Generator Metadata */}
          {!isEditMode && (article.business_unit || article.research_domain || article.analysis_method || article.report_type || article.ai_model) && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 mb-6 border border-blue-200">
              <h3 className="text-sm font-semibold text-[#1f4e79] mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                AI Research Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {article.business_unit && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1f4e79]" />
                    <span className="font-medium">Business Unit:</span>
                    <Badge className="bg-[#1f4e79] text-white text-xs">
                      {article.business_unit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                )}
                {article.research_domain && (
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-medium">Research Domain:</span>
                    <Badge className="bg-[#D4AF37] text-white text-xs">
                      {article.research_domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                )}
                {article.analysis_method && (
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Analysis Method:</span>
                    <Badge className="bg-purple-600 text-white text-xs">
                      {article.analysis_method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                )}
                {article.report_type && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Report Type:</span>
                    <Badge className="bg-green-600 text-white text-xs">
                      {article.report_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                )}
                {article.ai_model && (
                  <div className="flex items-center gap-2">
                    {article.ai_model === 'gpt5' && <Cpu className="w-4 h-4 text-green-400" />}
                    {article.ai_model === 'claude' && <Brain className="w-4 h-4 text-orange-500" />}
                    {article.ai_model === 'grok' && <Zap className="w-4 h-4 text-purple-500" />}
                    <span className="font-medium">AI Model:</span>
                    <Badge className={`text-white text-xs ${
                      article.ai_model === 'gpt5' ? 'bg-green-500' : 
                      article.ai_model === 'claude' ? 'bg-orange-500' : 'bg-purple-500'
                    }`}>
                      {article.ai_model === 'gpt5' ? 'GPT-5' : 
                       article.ai_model === 'claude' ? 'Claude Opus 4.1' : 'Grok 4'}
                    </Badge>
                  </div>
                )}
                {article.generation_template && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">Template:</span>
                    <Badge className="bg-gray-600 text-white text-xs">
                      {article.generation_template}
                    </Badge>
                  </div>
                )}
              </div>
              {(article.tokens_used || article.generation_time_ms) && (
                <div className="mt-3 pt-3 border-t border-blue-200 flex gap-4 text-xs text-gray-600">
                  {article.tokens_used && (
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {article.tokens_used.toLocaleString()} tokens
                    </span>
                  )}
                  {article.generation_time_ms && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {(article.generation_time_ms / 1000).toFixed(1)}s generation
                    </span>
                  )}
                </div>
              )}
            </Card>
          )}

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
          <h2 className="text-xl font-semibold text-[#1f4e79] mb-6">
            {isEditMode ? 'Edit Content (Markdown)' : 'Full Research Content'}
          </h2>
          {!isEditMode ? (
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
          ) : editedArticle ? (
            <div className="min-h-[500px]">
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-800">Markdown editor temporarily disabled for debugging. Using plain text editor.</p>
                </div>
                <textarea
                  className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm"
                  value={editedArticle?.content_md || ''}
                  onChange={(e) => handleFieldChange('content_md', e.target.value)}
                  placeholder="Enter markdown content here...

# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

- Bullet list
- Another item

1. Numbered list
2. Another item"
                />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold mb-2">Markdown Quick Reference:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <code className="bg-gray-100 px-1"># Heading 1</code><br/>
                    <code className="bg-gray-100 px-1">## Heading 2</code><br/>
                    <code className="bg-gray-100 px-1">### Heading 3</code><br/>
                    <code className="bg-gray-100 px-1">**Bold text**</code><br/>
                    <code className="bg-gray-100 px-1">*Italic text*</code>
                  </div>
                  <div>
                    <code className="bg-gray-100 px-1">- Bullet list</code><br/>
                    <code className="bg-gray-100 px-1">1. Numbered list</code><br/>
                    <code className="bg-gray-100 px-1">&gt; Blockquote</code><br/>
                    <code className="bg-gray-100 px-1">`inline code`</code><br/>
                    <code className="bg-gray-100 px-1">[Link text](url)</code>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Loading editor...</p>
            </div>
          )}
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