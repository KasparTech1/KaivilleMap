# IMPORTANT: Building Layout Data

## Current Status
The building layout data is currently hardcoded in:
- `/client/src/api/buildings.ts` - THIS IS THE ONLY FILE BEING USED BY THE APP

## Archived Files
- `town-layout.json` has been moved to `/client/src/archive/town-layout.json.archived`
- This file was NOT being used by the app and was causing confusion

## When Making Changes
When you need to update building positions, connections, or remove/add buildings:
- Update the mock data in `/client/src/api/buildings.ts` in the `getBuildings()` function

## TODO
Consider implementing proper data loading from a JSON file or database instead of hardcoded mock data.