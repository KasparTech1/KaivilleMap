import React, { useState } from 'react';
import { Button } from './ui/button';
import { HelpCircle, X } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [showLegend, setShowLegend] = useState(false);

  const buildings = [
    { id: 'stewardship_hall', name: 'Stewardship Hall', description: 'Learn about our 125-year heritage and values' },
    { id: 'skills_academy', name: 'SKILLS Academy', description: 'Develop AI skills with our learning framework' },
    { id: 'city_hall', name: 'City Hall', description: 'Submit permits and applications' },
    { id: 'innovation_plaza', name: 'Innovation Plaza', description: 'Discover AI success stories and metrics' },
    { id: 'trading_post', name: 'Trading Post', description: 'Browse and access AI tools and solutions' }
  ];

  return (
    <>
      {/* ElevenLabs ConvAI Widget - positioned in bottom right */}
      <div className="fixed bottom-6 right-6 z-40">
        <elevenlabs-convai agent-id="agent_01jxss2x07fvda3f2e504bkhq6"></elevenlabs-convai>
      </div>
      
      {/* Optional: Keep legend functionality accessible via other means if needed */}
      {/* You can uncomment this if you want to add a secondary legend button elsewhere */}
      {/* <Button
        onClick={() => setShowLegend(true)}
        className="fixed bottom-20 right-6 bg-[#1f4e79] text-white rounded-full w-10 h-10 p-0 shadow-lg hover:bg-[#1f4e79]/90 z-40"
        aria-label="Show map legend"
        title="View map legend"
      >
        <HelpCircle className="w-4 h-4" />
      </Button> */}

      {/* Legend Modal */}
      {showLegend && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legend-title"
          onClick={(e) => e.target === e.currentTarget && setShowLegend(false)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 id="legend-title" className="text-2xl font-serif text-[#1f4e79] font-bold">
                  How to Use the Map
                </h2>
                <Button
                  onClick={() => setShowLegend(false)}
                  variant="ghost"
                  size="sm"
                  aria-label="Close map legend"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#1f4e79] mb-3">Getting Started</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Click on any building to explore its contents</li>
                    <li>• Follow the glowing path to travel between buildings</li>
                    <li>• Use your keyboard to navigate (Tab to move, Enter to select)</li>
                    <li>• Look for the animated orb showing the recommended journey</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1f4e79] mb-3">Buildings Guide</h3>
                  <div className="space-y-3">
                    {buildings.map((building, index) => (
                      <div key={building.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-[#D4AF37] text-[#1f4e79] font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#1f4e79]">{building.name}</h4>
                          <p className="text-sm text-gray-600">{building.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1f4e79] mb-3">Tips</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Buildings glow when you hover over them</li>
                    <li>• Each building connects to the next in your journey</li>
                    <li>• You can return to the map anytime using the "Return to Map" button</li>
                    <li>• The journey is designed to be completed in order for the best experience</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={() => setShowLegend(false)}
                  className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]/90 px-8"
                >
                  Start Exploring
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};