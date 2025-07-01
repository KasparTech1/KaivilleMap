import React, { useEffect, useRef } from 'react';

interface AnimatedOrbProps {
  pathData: string;
  duration?: number;
  size?: number;
  color?: string;
  onComplete?: () => void;
}

interface PathPoint {
  x: number;
  y: number;
}

export const AnimatedOrb: React.FC<AnimatedOrbProps> = ({
  pathData,
  duration = 3000,
  size = 24,
  color = '#3B82F6',
  onComplete
}) => {
  const orbRef = useRef<SVGGElement>(null);
  const animationRef = useRef<number | null>(null);

  // Parse SVG path to extract points
  const parsePathData = (path: string): PathPoint[] => {
    const points: PathPoint[] = [];
    const commands = path.match(/[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g) || [];
    
    let currentX = 0;
    let currentY = 0;

    commands.forEach(cmd => {
      const type = cmd[0];
      const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number);

      switch (type.toUpperCase()) {
        case 'M': // Move to
          currentX = args[0];
          currentY = args[1];
          points.push({ x: currentX, y: currentY });
          break;
        case 'L': // Line to
          currentX = args[0];
          currentY = args[1];
          points.push({ x: currentX, y: currentY });
          break;
        case 'H': // Horizontal line
          currentX = args[0];
          points.push({ x: currentX, y: currentY });
          break;
        case 'V': // Vertical line
          currentY = args[0];
          points.push({ x: currentX, y: currentY });
          break;
        case 'C': // Cubic Bezier
          // Add intermediate points for smooth animation
          for (let t = 0.25; t <= 1; t += 0.25) {
            const x = bezierCubic(currentX, args[0], args[2], args[4], t);
            const y = bezierCubic(currentY, args[1], args[3], args[5], t);
            points.push({ x, y });
          }
          currentX = args[4];
          currentY = args[5];
          break;
        case 'Q': // Quadratic Bezier
          // Add intermediate points for smooth animation
          for (let t = 0.33; t <= 1; t += 0.33) {
            const x = bezierQuadratic(currentX, args[0], args[2], t);
            const y = bezierQuadratic(currentY, args[1], args[3], t);
            points.push({ x, y });
          }
          currentX = args[2];
          currentY = args[3];
          break;
      }
    });

    return points;
  };

  // Cubic Bezier calculation
  const bezierCubic = (p0: number, p1: number, p2: number, p3: number, t: number): number => {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3 * p3;
  };

  // Quadratic Bezier calculation
  const bezierQuadratic = (p0: number, p1: number, p2: number, t: number): number => {
    const mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
  };

  useEffect(() => {
    if (!orbRef.current || !pathData) return;

    const points = parsePathData(pathData);
    if (points.length === 0) return;

    let startTime: number | null = null;
    let currentIndex = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress >= 1) {
        // Animation complete
        if (orbRef.current) {
          const lastPoint = points[points.length - 1];
          orbRef.current.setAttribute('transform', `translate(${lastPoint.x}, ${lastPoint.y})`);
        }
        if (onComplete) onComplete();
        return;
      }

      // Calculate which point we should be at
      const totalProgress = progress * (points.length - 1);
      const targetIndex = Math.floor(totalProgress);
      const localProgress = totalProgress - targetIndex;

      if (targetIndex < points.length - 1) {
        const from = points[targetIndex];
        const to = points[targetIndex + 1];
        
        // Interpolate between points
        const x = from.x + (to.x - from.x) * localProgress;
        const y = from.y + (to.y - from.y) * localProgress;

        if (orbRef.current) {
          orbRef.current.setAttribute('transform', `translate(${x}, ${y})`);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pathData, duration, onComplete]);

  return (
    <g ref={orbRef} style={{ transition: 'none' }}>
      {/* Glow effect */}
      <circle
        r={size / 2 + 8}
        fill={color}
        opacity="0.3"
        style={{ filter: 'blur(8px)' }}
      />
      
      {/* Main orb */}
      <circle
        r={size / 2}
        fill={color}
        opacity="0.9"
      />
      
      {/* Inner highlight */}
      <circle
        r={size / 3}
        fill="white"
        opacity="0.5"
        cx={-size / 6}
        cy={-size / 6}
      />
      
      {/* AI Icon (simple robot) */}
      <g transform={`scale(${size / 24})`}>
        <rect x="-4" y="-6" width="8" height="10" fill="white" rx="2" opacity="0.9" />
        <circle cx="-2" cy="-3" r="1" fill={color} />
        <circle cx="2" cy="-3" r="1" fill={color} />
        <rect x="-1" y="0" width="2" height="3" fill={color} opacity="0.8" />
      </g>
      
      {/* Pulse animation */}
      <circle
        r={size / 2}
        fill="none"
        stroke="white"
        strokeWidth="2"
        opacity="0.6"
      >
        <animate
          attributeName="r"
          from={size / 2}
          to={size / 2 + 10}
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.6"
          to="0"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
};