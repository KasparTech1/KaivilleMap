import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { ResearchPromptModal } from '../components/research/ResearchPromptModal';
import { Sparkles, Building2, Factory, Cpu, Brain, Zap } from 'lucide-react';

export const ResearchCenterPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);
  const [showPromptBuilder, setShowPromptBuilder] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const url = showPending 
          ? '/api/research/articles?page=1&page_size=50&sort=newest&include_pending=true'
          : '/api/research/articles?page=1&page_size=12&sort=newest';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setItems(json.items || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load research articles');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showPending]);

  async function submitPaste() {
    setSubmitting(true);
    setSubmitMsg(null);
    setProcessingStatus('Processing your submission...');
    
    try {
      // Check if content might need formatting
      const hasYamlFrontmatter = pasteText.trim().startsWith('---');
      if (!hasYamlFrontmatter) {
        setProcessingStatus('Analyzing content and extracting metadata...');
      }
      
      const res = await fetch('/api/research/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pasteText })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
      setSubmitMsg('Submitted for review. It will appear after moderation (status: published).');
      setPasteText('');
      setProcessingStatus(null);
    } catch (e: any) {
      setSubmitMsg(`Error: ${e.message}`);
      setProcessingStatus(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="no-underline">
            <h1 className="text-2xl text-[#1f4e79] font-serif font-bold hover:text-[#D4AF37] transition cursor-pointer">Kaiville</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <Button 
              className="bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2" 
              onClick={() => setShowPromptBuilder(true)}
            >
              <Sparkles size={18} />
              AI Research Lab
            </Button>
            <Button className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90" onClick={() => setShowUpload(true)}>
              Submit Research
            </Button>
            <Link to="/building/learning_lodge">
              <Button className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90">Back to SKILLS Academy</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-br from-[#1f4e79] to-[#355E3B] text-white py-14">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold mb-2">Kaiville AI Research Center</h2>
          <p className="text-white/80">Recent research across welding, CNC, leather, firearms, and more.</p>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#1f4e79]">Submit Kaiville Research Markdown</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowUpload(false)}>✕</button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Paste content with YAML frontmatter (title, year, domains/topics, etc.). All submissions go to moderation.
            </p>
            <textarea
              className="w-full h-64 border rounded p-3 font-mono text-sm"
              placeholder={`---\ntitle: "Exact title"\nauthors: ["Name"]\nyear: 2025\npublisher: "Org"\nsource_url: "https://..."\nsource_type: "report"\nregion: "Texas"\ndomains: ["welding"]\ntopics: ["computer vision","quality control"]\nkeywords: ["weld"]\nsummary: "> short abstract"\nkey_points: ["point a","point b"]\n---\n# Body\nClean Markdown here...`}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <div className="mt-4">
              {processingStatus && (
                <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-[#1f4e79] rounded-full"></div>
                  <span>{processingStatus}</span>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button className="bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90" onClick={submitPaste} disabled={submitting || !pasteText.trim()}>
                  {submitting ? 'Submitting…' : 'Submit'}
                </Button>
              </div>
            </div>
            {submitMsg && (
              <div className="mt-3 text-sm text-[#1f4e79]">{submitMsg}</div>
            )}
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-10">
        {/* Admin Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="show-pending"
              checked={showPending}
              onCheckedChange={setShowPending}
            />
            <Label htmlFor="show-pending" className="text-sm font-medium">
              Show pending review articles
            </Label>
          </div>
          {showPending && (
            <p className="text-sm text-gray-600">
              Showing {items.filter(a => a.status === 'needs_review').length} pending, {items.filter(a => a.status === 'published').length} published
            </p>
          )}
        </div>

        {loading && (
          <div className="text-center text-[#1f4e79]">Loading research…</div>
        )}
        {error && (
          <div className="text-center text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((a: any) => (
              <Link key={a.id} to={`/research/${a.slug}`} className="no-underline">
                <Card className={`bg-white p-6 hover:shadow-xl transition h-full flex flex-col ${a.status === 'needs_review' ? 'border-2 border-orange-300' : ''}`}>
                  <div className="mb-2 flex justify-between items-start">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {a.ai_model ? (
                        <div className="flex items-center gap-1">
                          {a.ai_model === 'gpt5' && <Cpu className="w-3 h-3 text-green-400" />}
                          {a.ai_model === 'claude' && <Brain className="w-3 h-3 text-orange-500" />}
                          {a.ai_model === 'grok' && <Zap className="w-3 h-3 text-purple-500" />}
                          <span className="text-xs font-medium">
                            {a.ai_model === 'gpt5' ? 'GPT-5' : a.ai_model === 'claude' ? 'Claude' : 'Grok'}
                          </span>
                        </div>
                      ) : (
                        <span>{a.publisher || '—'}</span>
                      )}
                      <span>•</span>
                      <span>{a.year || new Date(a.created_at).getFullYear()}</span>
                    </div>
                    {a.status === 'needs_review' && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Pending Review</span>
                    )}
                  </div>
                  
                  {/* Research Generator Metadata Strip */}
                  {(a.business_unit || a.research_domain) && (
                    <div className="mb-2 flex items-center gap-2 text-xs">
                      {a.business_unit && (
                        <div className="flex items-center gap-1 text-[#1f4e79]">
                          <Building2 className="w-3 h-3" />
                          <span className="font-medium">{a.business_unit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                      )}
                      {a.business_unit && a.research_domain && <span className="text-gray-300">|</span>}
                      {a.research_domain && (
                        <div className="flex items-center gap-1 text-[#D4AF37]">
                          <Factory className="w-3 h-3" />
                          <span className="font-medium">{a.research_domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="text-xl text-[#1f4e79] font-bold mb-2">{a.title}</h3>
                  <div className="text-gray-700 flex-1 text-sm leading-relaxed">
                    {(() => {
                      const content = a.summary || (a.key_points?.[0] || '');
                      return content.length > 300 ? content.substring(0, 300) + '...' : content;
                    })()}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {/* Show Research Generator specific badges first */}
                    {a.report_type && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                        {a.report_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    )}
                    {a.analysis_method && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {a.analysis_method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    )}
                    {/* Fallback to legacy domains/topics if no Research Generator data */}
                    {!a.business_unit && !a.research_domain && (
                      <>
                        {(a.domains || []).slice(0, 2).map((d: string) => (
                          <span key={d} className="text-xs bg-[#1f4e79]/10 text-[#1f4e79] px-2 py-1 rounded">{d}</span>
                        ))}
                        {(a.topics || []).slice(0, 2).map((t: string) => (
                          <span key={t} className="text-xs bg-[#D4AF37]/10 text-[#6b5400] px-2 py-1 rounded">{t}</span>
                        ))}
                      </>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-10 mt-10">
        <div className="container mx-auto px-6 text-center text-gray-400">
          © 2025 Kaspar Companies. All rights reserved.
        </div>
      </footer>

      {/* Research Prompt Builder Modal */}
      <ResearchPromptModal 
        isOpen={showPromptBuilder} 
        onClose={() => setShowPromptBuilder(false)} 
      />
    </div>
  );
};

export default ResearchCenterPage;

