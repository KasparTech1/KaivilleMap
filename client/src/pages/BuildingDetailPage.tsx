import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBuildingDetails } from '../api/buildings';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Building2, MapPin, Loader2 } from 'lucide-react';

interface BuildingDetail {
  id: string;
  title: string;
  description: string;
  details: string;
}

const buildingSvgMap: Record<string, string> = {
  heritage_center: '/assets/heritage_center-notext.svg',
  learning_lodge: '/assets/learning_lodge-notext.svg',
  craft_works: '/assets/craft_works.svg',
  'community-center': '/assets/community-center.svg',
  knn_tower: '/assets/knn-tower.svg',
  celebration_station: '/assets/celebration-station-notext.svg',
  kasp_tower: '/assets/kasp-tower.svg',
  safety_station: '/assets/safety-station.svg',
  town_hall: '/assets/town-hall.svg'
};

export const BuildingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [building, setBuilding] = useState<BuildingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-sky-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Welcome Sign Logo */}
            <Link to="/" className="group">
              <img
                src="/assets/kai-sign-small.png"
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
              src={buildingSvgMap[building.id] || '/assets/town-hall.svg'}
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
          <div className="text-center space-y-4">
            <div className="mx-auto">
              <img 
                src={buildingSvgMap[building.id] || '/assets/town-hall.svg'}
                alt={building.title}
                className="h-32 w-auto mx-auto"
              />
            </div>
            
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {building.title}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {building.description}
              </p>
            </div>
          </div>

          {/* Building Details Card */}
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
                  {building.details}
                </p>
              </div>

              {/* Placeholder for future content */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
                <div className="space-y-4">
                  <div className="mx-auto">
                    <img 
                      src={buildingSvgMap[building.id] || '/assets/town-hall.svg'}
                      alt={building.title}
                      className="h-16 w-auto mx-auto opacity-50"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      More Content Coming Soon
                    </h3>
                    <p className="text-gray-600">
                      We're working on adding more interactive features, photos, and detailed information about {building.title}.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return to Map CTA */}
          <div className="text-center pt-8">
            <Link to="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Explore More Buildings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};