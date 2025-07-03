import api from './api';
import { getAssetUrl } from '../config/assetUrls';

// Description: Get all buildings data for the interactive map
// Endpoint: GET /api/buildings
// Request: {}
// Response: { buildings: Array<{ id: string, title: string, row: number, column: number, span: number, illustration: string, connections: string[] }> }
export const getBuildings = () => {
  // IMPORTANT: This is the ONLY place where building layout data is stored
  // The town-layout.json file has been archived and is NOT used
  // When changing building positions, update only this mock data below
  
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        buildings: [
          {
            id: "heritage_center",
            title: "Heritage Center",
            row: 1,
            column: 1,
            span: 1,
            illustration: getAssetUrl('heritage_center_animated.svg'),
            connections: ["community-center"]
          },
          {
            id: "community-center",
            title: "Join Junction",
            row: 1,
            column: 2,
            span: 1,
            illustration: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/join-junction-070325a.svg?t=${Date.now()}`,
            connections: ["heritage_center", "learning_lodge", "celebration_station"]
          },
          {
            id: "learning_lodge",
            title: "Skills University",
            row: 1,
            column: 3,
            span: 1,
            illustration: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/skills_academy_02.svg?t=${Date.now()}`,
            connections: ["community-center", "celebration_station"]
          },
          {
            id: "celebration_station",
            title: "Celebration Station",
            row: 2,
            column: 3,
            span: 1,
            illustration: getAssetUrl('celebration-station.svg'),
            connections: ["learning_lodge", "kasp_tower"]
          },
          {
            id: "kasp_tower",
            title: "KASP Tower",
            row: 2,
            column: 2,
            span: 1,
            illustration: getAssetUrl('kasp-tower.svg'),
            connections: ["celebration_station"]
          }
        ]
      });
    }, 300);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/buildings');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get building details by ID
// Endpoint: GET /api/buildings/:id
// Request: { id: string }
// Response: { building: { id: string, title: string, description: string, details: string } }
export const getBuildingDetails = (id: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const buildingDetails = {
        "heritage_center": {
          id: "heritage_center",
          title: "Heritage Center",
          description: "Discover the rich history and cultural heritage of Kaiville through interactive exhibits and historical artifacts.",
          details: "The Heritage Center houses a collection of artifacts, photographs, and documents that tell the story of Kaiville's founding and development over the years."
        },
        "learning_lodge": {
          id: "learning_lodge",
          title: "Skills University",
          description: "The premier institution for professional development and skill mastery in Kaiville.",
          details: "Skills University provides comprehensive training programs, certifications, and workshops designed to empower residents with practical skills for career advancement and personal growth."
        },
        "craft_works": {
          id: "craft_works",
          title: "Craft Works",
          description: "A creative workshop space where artisans and makers bring their ideas to life.",
          details: "Craft Works provides tools, materials, and expert guidance for woodworking, pottery, textiles, and other traditional and modern crafts."
        },
        "community-center": {
          id: "community-center",
          title: "Join Junction",
          description: "The connection hub of Kaiville, where paths cross and community thrives.",
          details: "Join Junction serves as the central meeting point where residents connect, collaborate, and build lasting relationships throughout Kaiville."
        },
        "knn_tower": {
          id: "knn_tower",
          title: "KNN Tower",
          description: "The broadcasting hub of Kaiville, bringing news and entertainment to the community.",
          details: "KNN Tower houses the local news station, radio broadcasts, and communication infrastructure that keeps Kaiville connected."
        },
        "celebration_station": {
          id: "celebration_station",
          title: "Celebration Station",
          description: "The heart of joy and festivities in Kaiville, where every day is a celebration.",
          details: "Celebration Station hosts parties, events, and community gatherings, bringing smiles and laughter to residents of all ages."
        },
        "kasp_tower": {
          id: "kasp_tower",
          title: "KASP Tower",
          description: "The technological hub of Kaiville, where innovation meets community service.",
          details: "KASP Tower houses advanced technology services, digital infrastructure, and serves as the nerve center for Kaiville's smart city initiatives."
        },
        "safety_station": {
          id: "safety_station",
          title: "Safety Station",
          description: "Your trusted guardian for all safety and emergency needs in Kaiville.",
          details: "Safety Station provides comprehensive emergency services, safety education, and community protection programs to keep all residents safe and secure."
        }
      };

      resolve({
        building: buildingDetails[id] || {
          id,
          title: "Unknown Building",
          description: "Building information not available.",
          details: "Please contact the town office for more information about this location."
        }
      });
    }, 200);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/buildings/${id}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};