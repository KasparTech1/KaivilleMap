import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[]; // Percentage heights: [0.2, 0.5, 0.9] = 20%, 50%, 90%
  defaultSnapPoint?: number;
  showHandle?: boolean;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  snapPoints = [0.3, 0.9], // Default: peek at 30%, full at 90%
  defaultSnapPoint = 0,
  showHandle = true,
  className = ''
}) => {
  const [currentSnap, setCurrentSnap] = useState(defaultSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Calculate sheet height based on snap point
  const getSheetHeight = useCallback(() => {
    if (!isOpen) return '0%';
    return `${snapPoints[currentSnap] * 100}%`;
  }, [isOpen, currentSnap, snapPoints]);

  // Handle touch/mouse start
  const handleStart = useCallback((clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setCurrentY(clientY);
  }, []);

  // Handle touch/mouse move
  const handleMove = useCallback((clientY: number) => {
    if (!isDragging || !sheetRef.current) return;
    
    const deltaY = clientY - startY;
    const sheetHeight = sheetRef.current.offsetHeight;
    const windowHeight = window.innerHeight;
    const currentHeight = (snapPoints[currentSnap] * windowHeight) - deltaY;
    const newHeightPercent = currentHeight / windowHeight;
    
    // Constrain between 0 and max snap point
    const maxSnap = Math.max(...snapPoints);
    const constrainedPercent = Math.max(0, Math.min(maxSnap, newHeightPercent));
    
    // Apply transform for smooth dragging
    if (sheetRef.current) {
      sheetRef.current.style.height = `${constrainedPercent * 100}%`;
    }
    
    setCurrentY(clientY);
  }, [isDragging, startY, currentSnap, snapPoints]);

  // Handle touch/mouse end
  const handleEnd = useCallback(() => {
    if (!isDragging || !sheetRef.current) return;
    
    const deltaY = currentY - startY;
    const threshold = 50; // pixels
    const velocity = Math.abs(deltaY) / 100; // Simple velocity calculation
    
    let newSnapIndex = currentSnap;
    
    // Determine new snap point based on drag direction and velocity
    if (deltaY > threshold || velocity > 1) {
      // Dragging down - go to lower snap point
      newSnapIndex = Math.max(0, currentSnap - 1);
      if (newSnapIndex === 0 && deltaY > threshold * 2) {
        // Close if dragging down from lowest snap point
        onClose();
        setIsDragging(false);
        return;
      }
    } else if (deltaY < -threshold || velocity > 1) {
      // Dragging up - go to higher snap point
      newSnapIndex = Math.min(snapPoints.length - 1, currentSnap + 1);
    }
    
    setCurrentSnap(newSnapIndex);
    setIsDragging(false);
    
    // Reset inline styles
    if (sheetRef.current) {
      sheetRef.current.style.height = '';
    }
  }, [isDragging, currentY, startY, currentSnap, snapPoints, onClose]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse event handlers (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle backdrop click
  const handleBackdropClick = () => {
    if (!isDragging) {
      onClose();
    }
  };

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Reset snap point when sheet opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentSnap(defaultSnapPoint);
    }
  }, [isOpen, defaultSnapPoint]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={handleBackdropClick}
        style={{ opacity: isOpen ? 1 : 0 }}
      />
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transition-all duration-300 ${
          isDragging ? '' : 'ease-out'
        } ${className}`}
        style={{
          height: getSheetHeight(),
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: isDragging ? 'none' : undefined
        }}
      >
        {/* Handle */}
        {showHandle && (
          <div
            className="absolute top-0 left-0 right-0 flex justify-center p-3 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
        
        {/* Close button for accessibility */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close filters"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Content */}
        <div 
          ref={contentRef}
          className="h-full overflow-y-auto overscroll-contain pt-8"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>
      </div>
    </>
  );
};