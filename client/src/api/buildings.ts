import api from './api';
import { getAssetUrl } from '../config/assetUrls';

// Description: Get all buildings data for the interactive map
// Endpoint: GET /api/buildings
// Request: {}
// Response: { buildings: Array<{ id: string, title: string, row: number, column: number, span: number, illustration: string, connections: string[] }> }
export const getBuildings = () => {
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
            connections: ["learning_lodge", "craft_works"]
          },
          {
            id: "learning_lodge",
            title: "Learning Lodge",
            row: 1,
            column: 2,
            span: 1,
            illustration: getAssetUrl('learning_lodge.svg'),
            connections: ["heritage_center", "craft_works", "community-center"]
          },
          {
            id: "craft_works",
            title: "Craft Works",
            row: 1,
            column: 3,
            span: 1,
            illustration: getAssetUrl('craft_works.svg'),
            connections: ["learning_lodge", "community-center"]
          },
          {
            id: "community-center",
            title: "Community Center",
            row: 2,
            column: 3,
            span: 1,
            illustration: getAssetUrl('community-center.svg'),
            connections: ["learning_lodge", "craft_works", "knn_tower", "celebration_station"]
          },
          {
            id: "knn_tower",
            title: "KNN Tower",
            row: 2,
            column: 1,
            span: 1,
            illustration: getAssetUrl('knn-tower.svg'),
            connections: ["community-center", "celebration_station"]
          },
          {
            id: "celebration_station",
            title: "Celebration Station",
            row: 2,
            column: 2,
            span: 1,
            illustration: getAssetUrl('celebration-station.svg'),
            connections: ["community-center", "knn_tower", "kasp_tower"]
          },
          {
            id: "kasp_tower",
            title: "KASP Tower",
            row: 3,
            column: 2,
            span: 1,
            illustration: getAssetUrl('kasp-tower.svg'),
            connections: ["celebration_station", "safety_station"]
          },
          {
            id: "safety_station",
            title: "Safety Station",
            row: 3,
            column: 1,
            span: 1,
            illustration: getAssetUrl('safety-station.svg'),
            connections: ["kasp_tower"]
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
          title: "Learning Lodge",
          description: "A modern educational hub where knowledge meets innovation and creativity flourishes.",
          details: "The Learning Lodge offers workshops, seminars, and hands-on learning experiences for all ages, fostering lifelong learning and skill development."
        },
        "craft_works": {
          id: "craft_works",
          title: "Craft Works",
          description: "A creative workshop space where artisans and makers bring their ideas to life.",
          details: "Craft Works provides tools, materials, and expert guidance for woodworking, pottery, textiles, and other traditional and modern crafts."
        },
        "community-center": {
          id: "community-center",
          title: "Community Center",
          description: "The social hub of Kaiville, hosting events, classes, and bringing neighbors together.",
          details: "The Community Center features multipurpose rooms, a gymnasium, and regularly hosts fitness classes, social events, and community gatherings."
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