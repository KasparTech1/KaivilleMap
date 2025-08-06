import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatedOrb } from './AnimatedOrb';

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
  const [reversePath, setReversePath] = useState<string>('');
  const [pathLength, setPathLength] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [isReverseAnimation, setIsReverseAnimation] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [containerSize, setContainerSize] = useState({ width: 100, height: 100 });
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePaths = useCallback(() => {
    const buildingPositions = new Map();
    const isMobile = window.innerWidth < 768; // md breakpoint
    
    // console.log('Calculating paths, isMobile:', isMobile, 'window width:', window.innerWidth);

    // Calculate building positions based on grid
    // Sort buildings for mobile layout consistency
    const sortedBuildingsForPosition = [...buildings].sort((a, b) => a.row - b.row || a.column - b.column);
    
    sortedBuildingsForPosition.forEach((building, index) => {
      // Look for all elements with this building ID (there might be two during transition)
      const elements = document.querySelectorAll(`[data-building-id="${building.id}"]`);
      // Find the visible one
      const element = Array.from(elements).find(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }) || elements[0];
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const container = element.closest('.buildings-grid');
        
        if (container) {
          const containerRect = container.getBoundingClientRect();
          
          // Always connect to the center of buildings
          let position = {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
            row: building.row,
            column: building.column
          };
          
          // Special offset for Kaizen Tower on desktop
          if (building.id === 'kasp_tower' && !isMobile) {
            position.x -= 175; // Move connection point 175px to the left (was 100)
          }
          
          // For mobile, we need to find the actual visual center of the SVG image
          if (isMobile) {
            // Try to find the IMG element inside the building card
            const imgElement = element.querySelector('img');
            if (imgElement) {
              const imgRect = imgElement.getBoundingClientRect();
              // Use the image's actual position instead
              position.x = imgRect.left - containerRect.left + imgRect.width / 2;
              position.y = imgRect.top - containerRect.top + imgRect.height / 2;
            }
            
            // Fine-tune adjustments per building if needed
            if (building.id === 'heritage_center') {
              // Top left building
              position.y += 20;
            } else if (building.id === 'community-center') {
              // Top right building
              position.y += 20;
            } else if (building.id === 'learning_lodge') {
              // Middle left - SKILLS Academy
              position.y += 30;
            } else if (building.id === 'celebration_station') {
              // Middle right - Innovation Plaza
              position.x -= 30;
              position.y += 20;
            } else if (building.id === 'kasp_tower') {
              // Bottom - Kaizen Tower
              position.y += 40;
            }
          }
          
          buildingPositions.set(building.id, position);
          // console.log(`Building ${building.id} position:`, position, 'rect:', rect, 'container:', containerRect);
          
          // Update container size with minimum values
          if (containerRect.width > 0 && containerRect.height > 0) {
            setContainerSize({ 
              width: Math.max(containerRect.width, 300), 
              height: Math.max(containerRect.height, 300) 
            });
          }
        } else {
          // console.warn(`No .buildings-grid container found for building ${building.id}`);
          // Fallback: use window size as reference
          const container = document.querySelector('.buildings-grid');
          if (container) {
            const containerRect = container.getBoundingClientRect();
            let position = {
              x: rect.left - containerRect.left + rect.width / 2,
              y: rect.top - containerRect.top + rect.height / 2,
              row: building.row,
              column: building.column
            };
            
            // Special offset for Kaizen Tower on desktop
            if (building.id === 'kasp_tower' && !isMobile) {
              position.x -= 175; // Move connection point 175px to the left (was 100)
            }
            
            // For mobile, we need to find the actual visual center of the SVG image
            if (isMobile) {
              // Try to find the IMG element inside the building card
              const imgElement = element.querySelector('img');
              if (imgElement) {
                const imgRect = imgElement.getBoundingClientRect();
                // Use the image's actual position instead
                position.x = imgRect.left - containerRect.left + imgRect.width / 2;
                position.y = imgRect.top - containerRect.top + imgRect.height / 2;
              }
              
              // Fine-tune adjustments per building if needed
              if (building.id === 'heritage_center') {
                // Top left building
                position.y += 20;
              } else if (building.id === 'community-center') {
                // Top right building
                position.y += 20;
              } else if (building.id === 'learning_lodge') {
                // Middle left - SKILLS Academy
                position.y += 30;
              } else if (building.id === 'celebration_station') {
                // Middle right - Innovation Plaza
                position.x -= 30;
                position.y += 20;
              } else if (building.id === 'kasp_tower') {
                // Bottom - Kaizen Tower
                position.y += 40;
              }
            }
            
            buildingPositions.set(building.id, position);
            // console.log(`Building ${building.id} alternative position:`, position);
          }
        }
      } else {
        // console.warn(`No element found for building ${building.id}`);
      }
    });

    // Create a single continuous path connecting buildings in the specified order
    // Always follow: Stewardship Hall → SKILLS Academy → City Hall → JOB Junction → Innovation Plaza → Trading Post
    const buildingOrder = [
      'heritage_center',      // Stewardship Hall
      'learning_lodge',       // SKILLS Academy
      'city_hall',            // City Hall
      'community-center',     // JOB Junction
      'celebration_station',  // Innovation Plaza
      'trading_post'         // Trading Post
    ];
    
    const sortedBuildings = buildingOrder
      .map(id => buildings.find(b => b.id === id))
      .filter(b => b !== undefined) as Building[];

    // Create the main road path
    let pathString = '';
    // console.log('Building path for buildings:', sortedBuildings.map(b => `${b.id} (row:${b.row}, col:${b.column})`));
    // console.log('Building positions found:', buildingPositions.size);
    
    sortedBuildings.forEach((building, index) => {
      const pos = buildingPositions.get(building.id);
      if (pos) {
        if (index === 0) {
          pathString = `M ${pos.x} ${pos.y}`;
        } else {
          const prevBuilding = sortedBuildings[index - 1];
          const prevPos = buildingPositions.get(prevBuilding.id);
          if (prevPos) {
            // Calculate distance and direction
            const dx = pos.x - prevPos.x;
            const dy = pos.y - prevPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (isMobile) {
              // Mobile: Create flowing S-curves
              const isHorizontal = Math.abs(dx) > Math.abs(dy);
              
              if (isHorizontal) {
                // Horizontal connection - create S-curve
                const cp1x = prevPos.x + dx * 0.5;
                const cp1y = prevPos.y - (distance * 0.2); // Curve up first
                const cp2x = prevPos.x + dx * 0.5;
                const cp2y = pos.y + (distance * 0.2); // Then curve down
                pathString += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pos.x} ${pos.y}`;
              } else {
                // Vertical connection - create gentle curve
                const curveOffset = distance * 0.3;
                const cp1x = prevPos.x + curveOffset;
                const cp1y = prevPos.y + dy * 0.3;
                const cp2x = pos.x - curveOffset;
                const cp2y = pos.y - dy * 0.3;
                pathString += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pos.x} ${pos.y}`;
              }
            } else {
              // Desktop: Keep existing behavior but enhance curves
              if (pos.row !== prevPos.row) {
                // Vertical connection - add more dramatic curve
                const curveIntensity = 80;
                const cp1x = prevPos.x + (dx > 0 ? curveIntensity : -curveIntensity);
                const cp1y = prevPos.y + dy * 0.3;
                const cp2x = pos.x - (dx > 0 ? curveIntensity : -curveIntensity);
                const cp2y = pos.y - dy * 0.3;
                pathString += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pos.x} ${pos.y}`;
              } else {
                // Horizontal connection - gentle arc
                const arcHeight = 40;
                const cpx = (pos.x + prevPos.x) / 2;
                const cpy = (pos.y + prevPos.y) / 2 - arcHeight;
                pathString += ` Q ${cpx} ${cpy} ${pos.x} ${pos.y}`;
              }
            }
          }
        }
      } else {
        // console.warn(`No position found for building ${building.id}`);
      }
    });

    // console.log('Path includes', sortedBuildings.length, 'buildings');
    // console.log('Final path string length:', pathString.length);
    // console.log('First building in path:', sortedBuildings[0]?.id);
    // console.log('Last building in path:', sortedBuildings[sortedBuildings.length - 1]?.id);
    
    // Only set path if we have valid positions
    if (pathString && buildingPositions.size > 0) {
      setMainPath(pathString);
      
      // Create reverse path by parsing and reversing the forward path
      // This ensures the exact same curves but in reverse order
      const reversePath = (() => {
        // Parse the forward path to extract all commands and points
        const commands = pathString.match(/[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g) || [];
        const pathSegments: Array<{ type: string; points: number[] }> = [];
        
        commands.forEach(cmd => {
          const type = cmd[0];
          const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
          pathSegments.push({ type, points: args });
        });
        
        // Reverse the segments (except the initial M command)
        const reversed: Array<{ type: string; points: number[] }> = [];
        
        // Start from the last point
        const lastSegment = pathSegments[pathSegments.length - 1];
        let lastX = 0, lastY = 0;
        
        // Get the final position from the last segment
        if (lastSegment) {
          switch (lastSegment.type) {
            case 'L':
            case 'M':
              lastX = lastSegment.points[0];
              lastY = lastSegment.points[1];
              break;
            case 'C':
              lastX = lastSegment.points[4];
              lastY = lastSegment.points[5];
              break;
            case 'Q':
              lastX = lastSegment.points[2];
              lastY = lastSegment.points[3];
              break;
          }
        }
        
        // Start the reverse path from the last point
        reversed.push({ type: 'M', points: [lastX, lastY] });
        
        // Process segments in reverse order
        for (let i = pathSegments.length - 1; i > 0; i--) {
          const segment = pathSegments[i];
          const prevSegment = pathSegments[i - 1];
          
          // Get the start point of this segment (end point of previous segment)
          let startX = 0, startY = 0;
          switch (prevSegment.type) {
            case 'L':
            case 'M':
              startX = prevSegment.points[0];
              startY = prevSegment.points[1];
              break;
            case 'C':
              startX = prevSegment.points[4];
              startY = prevSegment.points[5];
              break;
            case 'Q':
              startX = prevSegment.points[2];
              startY = prevSegment.points[3];
              break;
          }
          
          // Reverse the segment
          switch (segment.type) {
            case 'L':
              reversed.push({ type: 'L', points: [startX, startY] });
              break;
            case 'C':
              // Reverse cubic bezier by swapping control points
              reversed.push({
                type: 'C',
                points: [
                  segment.points[2], segment.points[3], // Second control point becomes first
                  segment.points[0], segment.points[1], // First control point becomes second
                  startX, startY // End point becomes start
                ]
              });
              break;
            case 'Q':
              // Quadratic bezier - control point stays the same
              reversed.push({
                type: 'Q',
                points: [segment.points[0], segment.points[1], startX, startY]
              });
              break;
          }
        }
        
        // Construct the reverse path string
        return reversed.map(seg => `${seg.type} ${seg.points.join(' ')}`).join(' ');
      })();
      
      setReversePath(reversePath);
      // console.log('Reverse path - First building:', reversedBuildings[0]?.id);
      // console.log('Reverse path - Last building:', reversedBuildings[reversedBuildings.length - 1]?.id);
    } else {
      // console.warn('No valid path generated, positions found:', buildingPositions.size);
    }
  }, [buildings]);

  // Burst animation logic
  const startBurstAnimation = useCallback((reverse: boolean = false) => {
    // console.log('AI Orb burst animation started, reverse:', reverse);
    setIsReverseAnimation(reverse);
    setIsAnimating(true);
    setAnimationKey(prev => prev + 1); // Force SVG re-render
    // Animation duration is 5 seconds
    setTimeout(() => {
      setIsAnimating(false);
      // console.log('AI Orb burst animation ended');
    }, 5000);
  }, []);

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    // Multiple attempts to calculate paths to ensure we catch the road
    const calculateWithRetries = () => {
      calculatePaths();
      // Retry a few times to ensure we get the road drawn
      setTimeout(calculatePaths, 100);
      setTimeout(calculatePaths, 500);
      setTimeout(calculatePaths, 1000);
    };
    
    calculateWithRetries();

    // Recalculate on window resize
    const handleResize = () => {
      checkMobile();
      calculateWithRetries();
    };

    window.addEventListener('resize', handleResize);
    
    // Also listen for DOM changes in case buildings load late
    const observer = new MutationObserver(() => {
      setTimeout(calculatePaths, 100);
    });
    
    // Observe the single grid element
    const gridElement = document.querySelector('.buildings-grid');
    if (gridElement) {
      observer.observe(gridElement, { childList: true, subtree: true, attributes: true });
      
      // Also observe for class changes which happen during responsive transitions
      const classObserver = new MutationObserver(() => {
        // console.log('Grid classes changed, recalculating paths');
        setTimeout(calculatePaths, 100);
      });
      classObserver.observe(gridElement, { attributes: true, attributeFilter: ['class'] });
      
      // Store observer for cleanup
      (window as any).__roadClassObserver = classObserver;
    }
    
    // Also observe the parent container for visibility changes
    const parentContainer = document.querySelector('.relative.z-10');
    if (parentContainer) {
      observer.observe(parentContainer, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if ((window as any).__roadClassObserver) {
        (window as any).__roadClassObserver.disconnect();
        delete (window as any).__roadClassObserver;
      }
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
    if (!mainPath || !reversePath) return;

    // Start burst animation cycle with alternating directions
    let isReverse = false;
    const runBurst = () => {
      // console.log('Starting next burst cycle, reverse:', isReverse);
      startBurstAnimation(isReverse);
      
      // Toggle direction for next animation
      isReverse = !isReverse;
      
      // Wait 5 seconds for animation to complete, then 5 seconds pause
      intervalRef.current = setTimeout(runBurst, 10000); // 5s animation + 5s pause
    };
    
    // Start first burst after 7 seconds
    // console.log('Initializing burst animation cycle');
    intervalRef.current = setTimeout(runBurst, 7000);

    return () => {
      // console.log('Cleaning up burst animation');
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [mainPath, reversePath, startBurstAnimation]);

  if (!mainPath) {
    // console.log('No main path generated, returning null');
    return null;
  }

  // Ensure we have valid container dimensions
  const svgWidth = Math.max(containerSize.width, 300);
  const svgHeight = Math.max(containerSize.height, 300);

  return (
    <>
      <svg
        className="absolute inset-0 pointer-events-none z-0"
        style={{ width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
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
          strokeWidth={isMobile ? "16" : "24"}
          fill="none"
          filter="url(#road-shadow)"
          opacity="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* White/light gray edge lines */}
        <path
          d={mainPath}
          stroke="#e5e5e5"
          strokeWidth={isMobile ? "14" : "22"}
          fill="none"
          strokeDasharray="none"
          opacity="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Light gray road surface */}
        <path
          d={mainPath}
          stroke="#b0b0b0"
          strokeWidth={isMobile ? "12" : "18"}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Center white dashed line */}
        <path
          d={mainPath}
          stroke="#ffffff"
          strokeWidth={isMobile ? "1.5" : "2"}
          fill="none"
          strokeDasharray={isMobile ? "8,8" : "20,10"}
          opacity="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Subtle road texture */}
        <path
          d={mainPath}
          stroke="url(#asphalt)"
          strokeWidth={isMobile ? "10" : "16"}
          fill="none"
          opacity="0.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      </svg>
      
      {/* Animated AI Orb using JavaScript animation */}
      {isAnimating && mainPath && reversePath && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <svg
            style={{ width: '100%', height: '100%' }}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <AnimatedOrb
              pathData={isReverseAnimation ? reversePath : mainPath}
              duration={5000}
              size={24}
              color="#3B82F6"
            />
          </svg>
        </div>
      )}
    </>
  );
});

RoadConnector.displayName = 'RoadConnector';