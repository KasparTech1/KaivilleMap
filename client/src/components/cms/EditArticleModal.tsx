import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface EditArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    id: string;
    headline: string;
    subheadline?: string;
    tags?: string[];
    primary_category?: string;
    section_title?: string;
    card_description?: string;
    author_name?: string;
    reading_time?: number;
  };
  onSave: (updatedArticle: any) => Promise<void>;
}

const CATEGORIES = [
  'News',
  'Community',
  'Technology',
  'Sports',
  'Arts & Culture',
  'Business',
  'Environment'
];

export const EditArticleModal: React.FC<EditArticleModalProps> = ({
  isOpen,
  onClose,
  article,
  onSave
}) => {
  const [formData, setFormData] = useState({
    headline: '',
    subheadline: '',
    tags: '',
    primary_category: 'News',
    section_title: '',
    card_description: '',
    author_name: '',
    reading_time: 5
  });
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (article && isOpen) {
      setFormData({
        headline: article.headline || '',
        subheadline: article.subheadline || '',
        tags: article.tags?.join(', ') || '',
        primary_category: article.primary_category || 'News',
        section_title: article.section_title || '',
        card_description: article.card_description || '',
        author_name: article.author_name || 'Kaiville Team',
        reading_time: article.reading_time || 5
      });
      setError(null);
    }
  }, [article, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const updatedData = {
        ...formData,
        tags: tagsArray,
        last_edited_at: new Date().toISOString(),
        last_edited_by: 'user' // TODO: Replace with actual user info when auth is implemented
      };

      await onSave(updatedData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Edit Article</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Headline */}
            <div className="mb-6">
              <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
                Headline
              </label>
              <input
                type="text"
                id="headline"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Subheadline */}
            <div className="mb-6">
              <label htmlFor="subheadline" className="block text-sm font-medium text-gray-700 mb-2">
                Subheadline
              </label>
              <input
                type="text"
                id="subheadline"
                value={formData.subheadline}
                onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Card Description */}
            <div className="mb-6">
              <label htmlFor="card_description" className="block text-sm font-medium text-gray-700 mb-2">
                Card Description
                <span className="text-gray-500 text-xs ml-2">(Shows on article cards)</span>
              </label>
              <textarea
                id="card_description"
                value={formData.card_description}
                onChange={(e) => setFormData({ ...formData, card_description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description for the article card..."
              />
            </div>

            {/* Primary Category */}
            <div className="mb-6">
              <label htmlFor="primary_category" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Category
              </label>
              <select
                id="primary_category"
                value={formData.primary_category}
                onChange={(e) => setFormData({ ...formData, primary_category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
                <span className="text-gray-500 text-xs ml-2">(Comma separated)</span>
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="local, breaking, technology, world..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Add "world" tag for world news, otherwise it will be categorized as local news
              </p>
            </div>

            {/* Section Title */}
            <div className="mb-6">
              <label htmlFor="section_title" className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
                <span className="text-gray-500 text-xs ml-2">(Optional custom section header)</span>
              </label>
              <input
                type="text"
                id="section_title"
                value={formData.section_title}
                onChange={(e) => setFormData({ ...formData, section_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Breaking News, Featured Story..."
              />
            </div>

            {/* Author and Reading Time */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Author Name
                </label>
                <input
                  type="text"
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="reading_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Reading Time (minutes)
                </label>
                <input
                  type="number"
                  id="reading_time"
                  min="1"
                  value={formData.reading_time}
                  onChange={(e) => setFormData({ ...formData, reading_time: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};