import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBuildingDetails } from '../api/buildings';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Building2, MapPin, Loader2, ChevronRight } from 'lucide-react';
import { getAssetUrl } from '../config/assetUrls';
import { EditButton } from '../components/cms/EditButton';
import { useCMSContent } from '../hooks/useCMSContent';

interface BuildingDetail {
  id: string;
  title: string;
  description: string;
  details: string;
}

const buildingSvgMap: Record<string, string> = {
  heritage_center: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/stewardship_hall_01.svg?t=${Date.now()}`,
  learning_lodge: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/skills_academy_02.svg?t=${Date.now()}`,
  craft_works: getAssetUrl('craft_works.svg'),
  'community-center': `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/join-junction-070325a.svg?t=${Date.now()}`,
  knn_tower: getAssetUrl('knn-tower.svg'),
  celebration_station: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/innovation_plaza_01.svg?t=${Date.now()}`,
  kasp_tower: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/kaizen_tower_01.svg?t=${Date.now()}`,
  safety_station: getAssetUrl('safety-station.svg'),
  town_hall: getAssetUrl('town-hall.svg')
};

// Next building navigation map
const nextBuildingMap: Record<string, { id: string, name: string }> = {
  heritage_center: { id: 'community-center', name: 'Job Junction' },
  'community-center': { id: 'learning_lodge', name: 'Skills Academy' },
  learning_lodge: { id: 'celebration_station', name: 'Innovation Plaza' },
  celebration_station: { id: 'kasp_tower', name: 'Kaizen Tower' },
  kasp_tower: { id: 'community-center', name: 'Job Junction' }
};

export const BuildingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [building, setBuilding] = useState<BuildingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Get CMS content for this building
  const { content: cmsContent, loading: cmsLoading } = useCMSContent('building', id || '', {});

  const fetchBuildingDetails = useCallback(async () => {
    if (!id) {
      console.error('No building ID provided');
      setLoading(false);
      return;
    }

    try {
      const response = await getBuildingDetails(id) as { building: BuildingDetail };
      setBuilding(response.building);
    } catch (error) {
      console.error('Error fetching building details:', error);
      toast({
        title: "Error",
        description: "Failed to load building details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchBuildingDetails();
  }, [fetchBuildingDetails]);

  // Set page title dynamically
  useEffect(() => {
    if (building) {
      document.title = `${cmsContent.title || building.title} - Kaiville Map`;
    }
    return () => {
      document.title = 'Kaiville Map';
    };
  }, [building, cmsContent.title]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className="text-lg text-gray-600">Loading building details...</p>
        </div>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <div className="text-center space-y-6">
          <Building2 className="w-16 h-16 mx-auto text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Building Not Found</h1>
            <p className="text-gray-600 mb-6">The requested building could not be found.</p>
            <Link to="/">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Map
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const nextBuilding = nextBuildingMap[building.id];

  return (
    <div className="min-h-screen bg-sky-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Welcome Sign Logo */}
            <Link to="/" className="group">
              <img
                src="https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/optimized/kai-sign-small.svg"
                alt="Kaiville"
                className="h-16 w-auto transition-transform duration-200 group-hover:scale-105"
              />
            </Link>

            {/* Center: Back to Map Link */}
            <Link to="/" className="group flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-lg font-medium">Back to Map</span>
            </Link>

            {/* Right: Building SVG */}
            <img 
              src={buildingSvgMap[building.id] || getAssetUrl('town-hall.svg')}
              alt={building.title}
              className="h-16 w-auto"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Building Header */}
          <div className="text-center space-y-6">
            {cmsContent.subtitle && (
              <h2 className="text-2xl md:text-3xl font-semibold text-blue-600">
                {cmsContent.subtitle}
              </h2>
            )}
            
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {cmsContent.title || building.title}
              </h1>
              
              {/* Hero Quote */}
              {cmsContent.heroQuote && (
                <div className="max-w-3xl mx-auto mt-6 mb-8">
                  <blockquote className="text-xl md:text-2xl text-gray-700 italic font-medium leading-relaxed">
                    {cmsContent.heroQuote}
                  </blockquote>
                </div>
              )}
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {cmsContent.description || building.description}
              </p>
            </div>
          </div>

          {/* Dynamic Content Sections */}
          {cmsContent.sections && cmsContent.sections.length > 0 ? (
            <div className="space-y-8">
              {cmsContent.sections.map((section: any, index: number) => (
                <Card key={index} className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-800">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none">
                      <div 
                        className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: section.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br />')
                            .replace(/•/g, '<li>')
                            .replace(/<li>(.*?)(?=<br \/>|$)/g, '<ul><li>$1</li></ul>')
                            .replace(/<\/ul><ul>/g, '')
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Fallback content if no sections
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-gray-800">About This Location</CardTitle>
                <CardDescription className="text-lg">
                  Learn more about what makes this place special
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-center">
                    {cmsContent.details || building.details}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          {cmsContent.callToAction && (
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl border-0">
              <CardContent className="p-8">
                <p className="text-xl text-center font-medium mb-6">
                  {cmsContent.callToAction}
                </p>
                {nextBuilding && (
                  <div className="text-center">
                    <Link to={`/building/${nextBuilding.id}`}>
                      <Button
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Continue to {nextBuilding.name}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Return to Map CTA */}
          <div className="text-center pt-8">
            <Link to="/">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Explore More Buildings
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Floating Edit Button */}
      {building && (
        <EditButton 
          editPath={`/admin/building/${building.id}`} 
          label="Edit Building" 
        />
      )}
    </div>
  );
};