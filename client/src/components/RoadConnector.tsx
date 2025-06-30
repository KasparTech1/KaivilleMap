import React, { useEffect, useState, useCallback, useRef } from 'react';

interface Building {
  id: string;
  title: string;
  row: number;
  column: number;
  span: number;
  illustration: string;
  connections: string[];
}

interface RoadConnectorProps {
  buildings: Building[];
  connections: Array<{ from: string; to: string }>;
}

interface ConnectionPath {
  from: string;
  to: string;
  path: string;
}

export const RoadConnector: React.FC<RoadConnectorProps> = React.memo(({ buildings, connections }) => {
  const [mainPath, setMainPath] = useState<string>('');
  const [pathLength, setPathLength] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [containerSize, setContainerSize] = useState({ width: 1000, height: 1000 });
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePaths = useCallback(() => {
    const buildingPositions = new Map();
    const isMobile = window.innerWidth < 768; // md breakpoint
    
    console.log('Calculating paths, isMobile:', isMobile, 'window width:', window.innerWidth);

    // Calculate building positions based on grid
    // Sort buildings for mobile layout consistency
    const sortedBuildingsForPosition = [...buildings].sort((a, b) => a.row - b.row || a.column - b.column);
    
    sortedBuildingsForPosition.forEach((building, index) => {
      const element = document.querySelector(`[data-building-id="${building.id}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const container = element.closest('.buildings-grid');
        
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const position = {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
            row: isMobile ? Math.floor(index / 2) + 1 : building.row,
            column: isMobile ? (index % 2) + 1 : building.column
          };
          buildingPositions.set(building.id, position);
          console.log(`Building ${building.id} position:`, position, 'rect:', rect, 'container:', containerRect);
          
          // Update container size only if valid
          if (containerRect.width > 0 && containerRect.height > 0) {
            setContainerSize({ width: containerRect.width, height: containerRect.height });
          }
        } else {
          console.warn(`No .buildings-grid container found for building ${building.id}`);
          // Fallback: use absolute positioning
          const position = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            row: isMobile ? Math.floor(index / 2) + 1 : building.row,
            column: isMobile ? (index % 2) + 1 : building.column
          };
          buildingPositions.set(building.id, position);
          console.log(`Building ${building.id} fallback position:`, position);
        }
      } else {
        console.warn(`No element found for building ${building.id}`);
      }
    });

    // Create a single continuous path connecting buildings in a logical order
    let sortedBuildings;
    
    if (isMobile) {
      // For mobile, use simple left-to-right, top-to-bottom order
      sortedBuildings = [...buildings].sort((a, b) => {
        const aIndex = buildings.indexOf(a);
        const bIndex = buildings.indexOf(b);
        // KASP Tower should always be last
        if (a.id === 'kasp_tower') return 1;
        if (b.id === 'kasp_tower') return -1;
        return aIndex - bIndex;
      });
    } else {
      // Desktop sorting logic
      sortedBuildings = [...buildings].sort((a, b) => {
        // KASP Tower should always be last
        if (a.id === 'kasp_tower') return 1;
        if (b.id === 'kasp_tower') return -1;
        
        if (a.row !== b.row) return a.row - b.row;
        // Alternate direction on each row for snake pattern
        if (a.row % 2 === 0) {
          return b.column - a.column; // Even rows: right to left
        }
        return a.column - b.column; // Odd rows: left to right
      });
    }

    // Create the main road path
    let pathString = '';
    console.log('Building path for buildings:', sortedBuildings.map(b => `${b.id} (row:${b.row}, col:${b.column})`));
    console.log('Building positions found:', buildingPositions.size);
    
    sortedBuildings.forEach((building, index) => {
      const pos = buildingPositions.get(building.id);
      if (pos) {
        if (index === 0) {
          pathString = `M ${pos.x} ${pos.y}`;
        } else {
          const prevBuilding = sortedBuildings[index - 1];
          const prevPos = buildingPositions.get(prevBuilding.id);
          if (prevPos) {
            // Create smooth curves between buildings
            const controlX = (pos.x + prevPos.x) / 2;
            const controlY = (pos.y + prevPos.y) / 2;
            
            // Adjust control points for smoother curves
            if (isMobile) {
              // Mobile: simpler curves
              pathString += ` Q ${controlX} ${controlY} ${pos.x} ${pos.y}`;
            } else {
              // Desktop: more elaborate curves
              if (pos.row !== prevPos.row) {
                // Vertical connection - add horizontal offset for curve
                pathString += ` Q ${controlX + 50} ${controlY} ${pos.x} ${pos.y}`;
              } else {
                // Horizontal connection - add vertical offset for curve
                pathString += ` Q ${controlX} ${controlY - 30} ${pos.x} ${pos.y}`;
              }
            }
          }
        }
      } else {
        console.warn(`No position found for building ${building.id}`);
      }
    });

    console.log('Path includes', sortedBuildings.length, 'buildings');
    console.log('Final path string length:', pathString.length);
    console.log('Last building in path:', sortedBuildings[sortedBuildings.length - 1]?.id);
    
    // Only set path if we have valid positions
    if (pathString && buildingPositions.size > 0) {
      setMainPath(pathString);
    } else {
      console.warn('No valid path generated, positions found:', buildingPositions.size);
    }
  }, [buildings]);

  // Burst animation logic
  const startBurstAnimation = useCallback(() => {
    console.log('AI Orb burst animation started');
    setIsAnimating(true);
    setAnimationKey(prev => prev + 1); // Force SVG re-render
    // Animation duration is 2 seconds
    setTimeout(() => {
      setIsAnimating(false);
      console.log('AI Orb burst animation ended');
    }, 2000);
  }, []);

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    // Calculate paths after a short delay to ensure DOM is ready
    const timer = setTimeout(calculatePaths, 300);

    // Recalculate on window resize
    const handleResize = () => {
      checkMobile();
      setTimeout(calculatePaths, 200);
    };

    window.addEventListener('resize', handleResize);
    
    // Also listen for DOM changes in case buildings load late
    const observer = new MutationObserver(() => {
      setTimeout(calculatePaths, 100);
    });
    
    // Observe all grid elements (both desktop and mobile)
    const gridElements = document.querySelectorAll('.buildings-grid');
    gridElements.forEach(gridElement => {
      observer.observe(gridElement, { childList: true, subtree: true });
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [calculatePaths]);

  // Recalculate paths when buildings change
  useEffect(() => {
    if (buildings.length > 0) {
      const timer = setTimeout(calculatePaths, 300);
      return () => clearTimeout(timer);
    }
  }, [buildings, calculatePaths]);

  // Separate effect for animation to prevent restarts
  useEffect(() => {
    if (!mainPath) return;

    // Start burst animation cycle
    let isAlternate = false;
    const runBurst = () => {
      console.log('Starting next burst cycle');
      startBurstAnimation();
      // Alternate between 4 and 8 seconds
      const nextInterval = isAlternate ? 8000 : 4000;
      isAlternate = !isAlternate;
      console.log(`Next burst in ${nextInterval/1000} seconds`);
      
      intervalRef.current = setTimeout(runBurst, nextInterval);
    };
    
    // Start first burst after 1 second
    console.log('Initializing burst animation cycle');
    intervalRef.current = setTimeout(runBurst, 1000);

    return () => {
      console.log('Cleaning up burst animation');
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [mainPath, startBurstAnimation]);

  if (!mainPath) {
    console.log('No main path generated, returning null');
    return null;
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
      viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="road-shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feFlood floodColor="#000000" floodOpacity="0.3"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <pattern id="asphalt" patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill="#a0a0a0"/>
          <circle cx="1" cy="1" r="0.5" fill="#909090"/>
          <circle cx="3" cy="3" r="0.5" fill="#909090"/>
        </pattern>
      </defs>

      <g id="road-group">
        {/* Road base with shadow */}
        <path
          d={mainPath}
          stroke="#888888"
          strokeWidth={isMobile ? "12" : "24"}
          fill="none"
          filter="url(#road-shadow)"
          opacity="0.5"
        />
        
        {/* White/light gray edge lines */}
        <path
          d={mainPath}
          stroke="#e5e5e5"
          strokeWidth={isMobile ? "10" : "22"}
          fill="none"
          strokeDasharray="none"
          opacity="0.8"
        />
        
        {/* Light gray road surface */}
        <path
          d={mainPath}
          stroke="#b0b0b0"
          strokeWidth={isMobile ? "8" : "18"}
          fill="none"
        />
        
        {/* Center white dashed line */}
        <path
          d={mainPath}
          stroke="#ffffff"
          strokeWidth={isMobile ? "1" : "1.5"}
          fill="none"
          strokeDasharray={isMobile ? "10,5" : "20,10"}
          opacity="0.7"
        />
        
        {/* Subtle road texture */}
        <path
          d={mainPath}
          stroke="url(#asphalt)"
          strokeWidth={isMobile ? "6" : "16"}
          fill="none"
          opacity="0.2"
        />
      </g>

      {/* Animated AI Orb - Only visible during burst */}
      {isAnimating && (
        <g id="ai-orb" key={animationKey}>
          {/* Glow effect */}
          <defs>
            <radialGradient id="orbGlow">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Orb container that moves along path */}
          <g filter="url(#glow)">
            {/* Outer glow halo */}
            <circle r="30" fill="url(#orbGlow)" opacity="0.8">
              <animateMotion
                dur="2s"
                repeatCount="1"
                rotate="auto"
                fill="freeze"
                keyPoints="0;1"
                keyTimes="0;1"
              >
                <mpath href={`#road-path-burst`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;0.8;0.8;0"
                dur="2s"
                repeatCount="1"
              />
            </circle>

            {/* Triple diamond AI icon */}
            <g opacity="1">
              <animateMotion
                dur="2s"
                repeatCount="1"
                rotate="auto"
                fill="freeze"
                keyPoints="0;1"
                keyTimes="0;1"
              >
                <mpath href={`#road-path-burst`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="2s"
                repeatCount="1"
              />
              
              {/* Diamond 1 - Left */}
              <path d="M -12 0 L -8 -4 L -4 0 L -8 4 Z" fill="#60a5fa" stroke="#ffffff" strokeWidth="0.5" />
              
              {/* Diamond 2 - Center */}
              <path d="M -4 0 L 0 -4 L 4 0 L 0 4 Z" fill="#3b82f6" stroke="#ffffff" strokeWidth="0.5" />
              
              {/* Diamond 3 - Right */}
              <path d="M 4 0 L 8 -4 L 12 0 L 8 4 Z" fill="#60a5fa" stroke="#ffffff" strokeWidth="0.5" />
            </g>

            {/* Inner bright core */}
            <circle r="5" fill="#ffffff" opacity="1">
              <animateMotion
                dur="2s"
                repeatCount="1"
                rotate="auto"
                fill="freeze"
                keyPoints="0;1"
                keyTimes="0;1"
              >
                <mpath href={`#road-path-burst`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="2s"
                repeatCount="1"
              />
            </circle>

            {/* Motion blur trail effect */}
            <line x1="-20" y1="0" x2="-50" y2="0" stroke="url(#orbGlow)" strokeWidth="20" opacity="0.6">
              <animateMotion
                dur="2s"
                repeatCount="1"
                rotate="auto"
                fill="freeze"
                keyPoints="0;1"
                keyTimes="0;1"
              >
                <mpath href={`#road-path-burst`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;0.6;0.6;0"
                dur="2s"
                repeatCount="1"
              />
            </line>
          </g>

          {/* Hidden path for animation */}
          <path
            id="road-path-burst"
            d={mainPath}
            fill="none"
            stroke="none"
          />
        </g>
      )}
    </svg>
  );
});

RoadConnector.displayName = 'RoadConnector';