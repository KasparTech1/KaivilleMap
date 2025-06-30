import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EditableText } from '../../components/cms/EditableText';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Save, RotateCcw, Building2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useToast } from '../../hooks/useToast';
import { getBuildingDetails } from '../../api/buildings';
import { getAssetUrl } from '../../config/assetUrls';

interface BuildingContent {
  title: string;
  description: string;
  details: string;
}

export const BuildingEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [content, setContent] = useState<BuildingContent>({
    title: '',
    description: '',
    details: ''
  });
  const [originalContent, setOriginalContent] = useState<BuildingContent | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const buildingSvgMap: Record<string, string> = {
    heritage_center: getAssetUrl('heritage_center-notext.svg'),
    learning_lodge: getAssetUrl('learning_lodge-notext.svg'),
    craft_works: getAssetUrl('craft_works.svg'),
    'community-center': getAssetUrl('community-center.svg'),
    knn_tower: getAssetUrl('knn-tower.svg'),
    celebration_station: getAssetUrl('celebration-station-notext.svg'),
    kasp_tower: getAssetUrl('kasp-tower.svg'),
    safety_station: getAssetUrl('safety-station.svg'),
    town_hall: getAssetUrl('town-hall.svg')
  };

  useEffect(() => {
    checkAuth();
    if (id) {
      loadContent();
    }
  }, [id]);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    }
  };

  const loadContent = async () => {
    if (!id) return;
    
    try {
      // First try to load from CMS content
      const { data: cmsData, error: cmsError } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('page', 'building')
        .eq('block_key', id)
        .single();

      if (cmsData && !cmsError) {
        const loadedContent = JSON.parse(cmsData.content);
        setContent(loadedContent);
        setOriginalContent(loadedContent);
      } else {
        // Fallback to original building data
        const response = await getBuildingDetails(id) as { building: BuildingContent };
        const buildingData = response.building;
        setContent({
          title: buildingData.title,
          description: buildingData.description,
          details: buildingData.details
        });
        setOriginalContent({
          title: buildingData.title,
          description: buildingData.description,
          details: buildingData.details
        });
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: "Error",
        description: "Failed to load building content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof BuildingContent, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const saveContent = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('content_blocks')
        .upsert({
          page: 'building',
          block_key: id,
          content: JSON.stringify(content),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page,block_key'
        });

      if (error) throw error;

      setOriginalContent(content);
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Building content saved successfully",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading building content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to={`/building/${id}`} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                {id && buildingSvgMap[id] && (
                  <img 
                    src={buildingSvgMap[id]} 
                    alt={content.title}
                    className="h-8 w-auto"
                  />
                )}
                <h1 className="text-2xl font-bold text-gray-900">Edit Building: {content.title}</h1>
              </div>
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
        {/* Building Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Building Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building Name
              </label>
              <EditableText
                value={content.title}
                onChange={(value) => updateField('title', value)}
                onSave={saveContent}
                tag="h1"
                className="text-2xl font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description (appears on map card)
              </label>
              <EditableText
                value={content.description}
                onChange={(value) => updateField('description', value)}
                onSave={saveContent}
                tag="p"
                className="text-base text-gray-600"
                multiline
              />
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Description</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Details (appears on building page)
            </label>
            <EditableText
              value={content.details}
              onChange={(value) => updateField('details', value)}
              onSave={saveContent}
              tag="p"
              className="text-base"
              multiline
            />
          </div>
        </div>

        {/* Preview Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              <strong>Preview:</strong> See how this building looks on the site
            </p>
            <Link to={`/building/${id}`}>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>View Building Page</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Tip:</strong> Click on any text to edit it inline. Press Ctrl+S (or Cmd+S on Mac) to quickly save your changes.
          </p>
        </div>
      </div>
    </div>
  );
};