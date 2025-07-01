import React, { useEffect, useRef, useState } from 'react';

interface AnimatedOrbProps {
  pathData: string;
  duration?: number; // Duration in milliseconds
  reverse?: boolean;
  size?: number;
  color?: string;
  onComplete?: () => void;
}

interface Point {
  x: number;
  y: number;
}

const AnimatedOrb: React.FC<AnimatedOrbProps> = ({
  pathData,
  duration = 3000,
  reverse = false,
  size = 24,
  color = '#3B82F6',
  onComplete
}) => {
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(true);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const pathPointsRef = useRef<Point[]>([]);

  // Parse SVG path data to extract points
  const parsePathData = (path: string): Point[] => {
    const points: Point[] = [];
    const commands = path.match(/[MLCQSTHVZmlcqsthvz][^MLCQSTHVZmlcqsthvz]*/g) || [];
    
    let currentX = 0;
    let currentY = 0;

    commands.forEach(command => {
      const type = command[0];
      const coords = command.slice(1).trim().split(/[\s,]+/).map(Number);

      switch (type.toUpperCase()) {
        case 'M': // Move to
          currentX = type === 'M' ? coords[0] : currentX + coords[0];
          currentY = type === 'M' ? coords[1] : currentY + coords[1];
          points.push({ x: currentX, y: currentY });
          break;
        
        case 'L': // Line to
          currentX = type === 'L' ? coords[0] : currentX + coords[0];
          currentY = type === 'L' ? coords[1] : currentY + coords[1];
          points.push({ x: currentX, y: currentY });
          break;
        
        case 'H': // Horizontal line
          currentX = type === 'H' ? coords[0] : currentX + coords[0];
          points.push({ x: currentX, y: currentY });
          break;
        
        case 'V': // Vertical line
          currentY = type === 'V' ? coords[0] : currentY + coords[0];
          points.push({ x: currentX, y: currentY });
          break;
        
        case 'C': // Cubic bezier
          // For cubic bezier, we'll sample points along the curve
          const startPoint = { x: currentX, y: currentY };
          const cp1 = { x: coords[0], y: coords[1] };
          const cp2 = { x: coords[2], y: coords[3] };
          const endPoint = { x: coords[4], y: coords[5] };
          
          // Sample 10 points along the bezier curve
          for (let t = 0.1; t <= 1; t += 0.1) {
            const point = cubicBezierPoint(startPoint, cp1, cp2, endPoint, t);
            points.push(point);
          }
          
          currentX = endPoint.x;
          currentY = endPoint.y;
          break;
        
        case 'Q': // Quadratic bezier
          const qStart = { x: currentX, y: currentY };
          const qCP = { x: coords[0], y: coords[1] };
          const qEnd = { x: coords[2], y: coords[3] };
          
          // Sample points along the quadratic bezier
          for (let t = 0.1; t <= 1; t += 0.1) {
            const point = quadraticBezierPoint(qStart, qCP, qEnd, t);
            points.push(point);
          }
          
          currentX = qEnd.x;
          currentY = qEnd.y;
          break;
      }
    });

    // Add more interpolated points for smoother animation
    const interpolatedPoints: Point[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      interpolatedPoints.push(points[i]);
      
      // Add 5 interpolated points between each pair
      for (let j = 1; j < 5; j++) {
        const t = j / 5;
        interpolatedPoints.push({
          x: points[i].x + (points[i + 1].x - points[i].x) * t,
          y: points[i].y + (points[i + 1].y - points[i].y) * t
        });
      }
    }
    interpolatedPoints.push(points[points.length - 1]);

    return interpolatedPoints;
  };

  // Cubic bezier calculation
  const cubicBezierPoint = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
    const oneMinusT = 1 - t;
    const oneMinusT2 = oneMinusT * oneMinusT;
    const oneMinusT3 = oneMinusT2 * oneMinusT;
    const t2 = t * t;
    const t3 = t2 * t;

    return {
      x: oneMinusT3 * p0.x + 3 * oneMinusT2 * t * p1.x + 3 * oneMinusT * t2 * p2.x + t3 * p3.x,
      y: oneMinusT3 * p0.y + 3 * oneMinusT2 * t * p1.y + 3 * oneMinusT * t2 * p2.y + t3 * p3.y
    };
  };

  // Quadratic bezier calculation
  const quadraticBezierPoint = (p0: Point, p1: Point, p2: Point, t: number): Point => {
    const oneMinusT = 1 - t;
    const oneMinusT2 = oneMinusT * oneMinusT;
    const t2 = t * t;

    return {
      x: oneMinusT2 * p0.x + 2 * oneMinusT * t * p1.x + t2 * p2.x,
      y: oneMinusT2 * p0.y + 2 * oneMinusT * t * p1.y + t2 * p2.y
    };
  };

  // Animation loop
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const adjustedProgress = reverse ? 1 - progress : progress;

    const pathPoints = pathPointsRef.current;
    if (pathPoints.length > 0) {
      const pointIndex = Math.floor(adjustedProgress * (pathPoints.length - 1));
      const point = pathPoints[pointIndex];
      
      if (point) {
        setPosition({ x: point.x, y: point.y });
      }
    }

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      onComplete?.();
    }
  };

  // Initialize animation
  useEffect(() => {
    pathPointsRef.current = parsePathData(pathData);
    
    if (pathPointsRef.current.length > 0) {
      setPosition(pathPointsRef.current[reverse ? pathPointsRef.current.length - 1 : 0]);
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pathData, duration, reverse]);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        transform: `translate(${position.x - size / 2}px, ${position.y - size / 2}px)`,
        transition: 'none',
        willChange: 'transform'
      }}
    >
      {/* Orb with glow effect */}
      <div className="relative">
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-60"
          style={{
            backgroundColor: color,
            width: size * 1.5,
            height: size * 1.5,
            top: -size * 0.25,
            left: -size * 0.25
          }}
        />
        
        {/* Orb */}
        <div
          className="relative rounded-full flex items-center justify-center shadow-lg"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}40`
          }}
        >
          {/* AI Icon */}
          <svg
            width={size * 0.6}
            height={size * 0.6}
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M21 10.975V8a2 2 0 0 0-2-2h-6V4.688c.305-.274.5-.668.5-1.11a1.5 1.5 0 0 0-3 0c0 .442.195.836.5 1.11V6H5a2 2 0 0 0-2 2v2.998l-.072.005A.999.999 0 0 0 2 12v2a1 1 0 0 0 1 1v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a1 1 0 0 0 1-1v-1.938a1.004 1.004 0 0 0-.072-.455c-.202-.488-.635-.605-.928-.632zM7 12c0-1.104.672-2 1.5-2s1.5.896 1.5 2-.672 2-1.5 2S7 13.104 7 12zm8.998 6c-1.001-.003-7.997 0-7.998 0v-2s7.001-.002 8.002 0l-.004 2zm-.498-4c-.828 0-1.5-.896-1.5-2s.672-2 1.5-2 1.5.896 1.5 2-.672 2-1.5 2z" />
          </svg>
        </div>

        {/* Pulse animation */}
        {isAnimating && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: color,
              opacity: 0.3
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AnimatedOrb;