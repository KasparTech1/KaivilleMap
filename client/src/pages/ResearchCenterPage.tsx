import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export const ResearchCenterPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/research/articles?page=1&page_size=12&sort=newest');
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
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="no-underline">
            <h1 className="text-2xl text-[#1f4e79] font-serif font-bold hover:text-[#D4AF37] transition cursor-pointer">Kaiville</h1>
          </Link>
          <div className="flex items-center space-x-4">
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

      <main className="container mx-auto px-6 py-10">
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
                <Card className="bg-white p-6 hover:shadow-xl transition h-full flex flex-col">
                  <div className="mb-2 text-sm text-gray-500">{a.publisher || '—'} • {a.year || ''}</div>
                  <h3 className="text-xl text-[#1f4e79] font-bold mb-2">{a.title}</h3>
                  <div className="text-gray-700 flex-1">{a.summary || (a.key_points?.[0] || '')}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(a.domains || []).slice(0, 3).map((d: string) => (
                      <span key={d} className="text-xs bg-[#1f4e79]/10 text-[#1f4e79] px-2 py-1 rounded">{d}</span>
                    ))}
                    {(a.topics || []).slice(0, 2).map((t: string) => (
                      <span key={t} className="text-xs bg-[#D4AF37]/10 text-[#6b5400] px-2 py-1 rounded">{t}</span>
                    ))}
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
    </div>
  );
};

export default ResearchCenterPage;

