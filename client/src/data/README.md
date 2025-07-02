# IMPORTANT: Building Layout Data

## Current Issue
The building layout data is currently duplicated in two places:
1. `/client/src/data/town-layout.json` - NOT USED BY THE APP
2. `/client/src/api/buildings.ts` - ACTUALLY USED BY THE APP (hardcoded mock data)

## When Making Changes
When you need to update building positions, connections, or remove/add buildings, you MUST update BOTH files:
- `town-layout.json` (for future use when we switch to loading from JSON)
- `buildings.ts` (the actual data being used now)

## TODO
Consider refactoring the code to load building data from `town-layout.json` directly to avoid this duplication and confusion.