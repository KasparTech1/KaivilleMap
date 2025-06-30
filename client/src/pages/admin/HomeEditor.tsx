import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EditableText } from '../../components/cms/EditableText';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useToast } from '../../hooks/useToast';

interface HomeContent {
  welcomeTitle: string;
  welcomeSubtitle: string;
  heroText: string;
  aboutTitle: string;
  aboutText: string;
}

export const HomeEditor: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState<HomeContent>({
    welcomeTitle: 'Welcome to Kaiville',
    welcomeSubtitle: 'Explore Our Interactive Town Map',
    heroText: 'Discover the heart of our community through this interactive map. Click on any building to learn more about what makes Kaiville special.',
    aboutTitle: 'About Kaiville',
    aboutText: 'Kaiville is a vibrant community where innovation meets tradition. Our town is home to diverse businesses, cultural centers, and community spaces that make life here truly special.'
  });
  const [originalContent, setOriginalContent] = useState<HomeContent | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuth();
    loadContent();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    }
  };

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('simple_content')
        .select('*')
        .eq('page_type', 'home')
        .eq('page_id', 'main')
        .single();

      if (data && !error) {
        setContent(data.content as HomeContent);
        setOriginalContent(data.content as HomeContent);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const updateField = (field: keyof HomeContent, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('simple_content')
        .update({
          content: content,
          updated_at: new Date().toISOString()
        })
        .eq('page_type', 'home')
        .eq('page_id', 'main');

      if (error) throw error;

      setOriginalContent(content);
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Home page content saved successfully",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    if (originalContent) {
      setContent(originalContent);
      setHasChanges(false);
    }
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges) {
          saveContent();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, content]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit Home Page</h1>
            </div>
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <Button
                  onClick={resetChanges}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </Button>
              )}
              <Button
                onClick={saveContent}
                disabled={!hasChanges || saving}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Title
              </label>
              <EditableText
                value={content.welcomeTitle}
                onChange={(value) => updateField('welcomeTitle', value)}
                onSave={saveContent}
                tag="h1"
                className="text-3xl font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Subtitle
              </label>
              <EditableText
                value={content.welcomeSubtitle}
                onChange={(value) => updateField('welcomeSubtitle', value)}
                onSave={saveContent}
                tag="p"
                className="text-lg text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hero Text
            </label>
            <EditableText
              value={content.heroText}
              onChange={(value) => updateField('heroText', value)}
              onSave={saveContent}
              tag="p"
              className="text-base"
              multiline
            />
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Title
              </label>
              <EditableText
                value={content.aboutTitle}
                onChange={(value) => updateField('aboutTitle', value)}
                onSave={saveContent}
                tag="h2"
                className="text-2xl font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Text
              </label>
              <EditableText
                value={content.aboutText}
                onChange={(value) => updateField('aboutText', value)}
                onSave={saveContent}
                tag="p"
                className="text-base"
                multiline
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Click on any text to edit it inline. Press Ctrl+S (or Cmd+S on Mac) to quickly save your changes.
          </p>
        </div>
      </div>
    </div>
  );
};