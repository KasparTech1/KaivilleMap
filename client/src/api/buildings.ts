import api from './api';
import { getAssetUrl } from '../config/assetUrls';

// ============================================================================
// BUILDING LAYOUT DATA - INTENTIONALLY HARDCODED (NOT FROM DATABASE)
// ============================================================================
//
// ⚠️ IMPORTANT: This is MOCK DATA, not an API call despite the file location
//
// WHY IS THIS HARDCODED?
// - Building layout changes infrequently (static configuration)
// - Simpler than database for static spatial data
// - Easier to track changes via Git version control
// - No need for database overhead for static content
//
// DATA SOURCE:
// - This file is the SINGLE SOURCE OF TRUTH for building positions
// - The old town-layout.json file has been archived and is NOT used
// - There is NO backend API endpoint for this data
// - There is NO database table for building layout
//
// TO MODIFY BUILDING LAYOUT:
// ✅ DO: Edit this file directly
// ✅ DO: Commit changes to Git
// ❌ DON'T: Create API endpoints for this data
// ❌ DON'T: Create database tables/migrations for building layout
// ❌ DON'T: Try to fetch this from a server
//
// FOR MORE CONTEXT:
// - See: client/src/data/README.md
// - Architecture decision: Static config over database complexity
//
// ============================================================================

// Description: Get all buildings data for the interactive map
// Endpoint: NONE - This is mocked data, not a real API call
// Request: {}
// Response: { buildings: Array<Building> }
export const getBuildings = () => {
  // MOCK DATA: Simulates API response with hardcoded building layout
  
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        buildings: [
          {
            id: "heritage_center",
            title: "Stewardship Hall",
            row: 1,
            column: 1,
            span: 1,
            illustration: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/stewardship_hall_01.svg?t=${Date.now()}`,
            connections: ["learning_lodge"]
          },
          {
            id: "learning_lodge",
            title: "Skills University",
            row: 1,
            column: 2,
            span: 1,
            illustration: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/skills_academy_02.svg?t=${Date.now()}`,
            connections: ["heritage_center", "city_hall"]
          },
          {
            id: "city_hall",
            title: "City Hall",
            row: 1,
            column: 3,
            span: 1,
            illustration: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/join-junction-070325a.svg?t=${Date.now()}`,
            connections: ["learning_lodge", "community-center"]
          },
          {
            id: "community-center",
            title: "JOB Junction",
            row: 2,
            column: 1,
            span: 1,
            illustration: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/join-junction-070325a.svg?t=${Date.now()}`,
            connections: ["city_hall", "celebration_station"]
          },
          {
            id: "celebration_station",
            title: "Innovation Plaza",
            row: 2,
            column: 3,
            span: 1,
            illustration: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/innovation_plaza_01.svg?t=${Date.now()}`,
            connections: ["community-center", "trading_post"]
          },
          {
            id: "trading_post",
            title: "Trading Post",
            row: 2,
            column: 2,
            span: 1,
            illustration: `https://yvbtqcmiuymyvtvaqgcf.supabase.co/storage/v1/object/public/kaiville-assets/maps/svg/full/kaizen_tower_01.svg?t=${Date.now()}`,
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
          title: "Stewardship Hall",
          description: "Where responsible leadership and community care come together to shape Kaiville's future.",
          details: "Stewardship Hall is dedicated to fostering responsible governance, environmental sustainability, and community stewardship. This center hosts leadership development programs, sustainability initiatives, and civic engagement activities that empower residents to be active stewards of their community."
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
        "city_hall": {
          id: "city_hall",
          title: "City Hall",
          description: "The administrative center where residents submit permits and applications for community services.",
          details: "City Hall serves as the official permit and approval center for Kaiville. Residents come here to submit applications for custom tool deployments, unvetted tool usage, building modifications, and various permits required for community projects and innovations."
        },
        "community-center": {
          id: "community-center",
          title: "JOB Junction",
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
          title: "Innovation Plaza",
          description: "Where groundbreaking ideas come to life and entrepreneurial dreams take flight.",
          details: "Innovation Plaza is Kaiville's hub for startups, tech innovation, and creative collaboration. This dynamic space features co-working areas, maker spaces, and incubator programs that foster entrepreneurship and technological advancement."
        },
        "trading_post": {
          id: "trading_post",
          title: "Trading Post",
          description: "Your one-stop shop for AI tools and solutions, outfitting innovation since 1898.",
          details: "The Trading Post is Kaiville's marketplace for tested and approved AI tools. From career navigation to process optimization, every tool has been vetted by the Kaspar community. Our experienced shopkeepers guide residents to the perfect solutions for their challenges."
        },
        "kasp_tower": {
          id: "kasp_tower",
          title: "Kaizen Tower",
          description: "The center of continuous improvement and excellence in Kaiville.",
          details: "Kaizen Tower embodies the philosophy of continuous improvement, housing quality management systems, process optimization teams, and excellence training programs that help Kaiville residents and businesses achieve their highest potential."
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