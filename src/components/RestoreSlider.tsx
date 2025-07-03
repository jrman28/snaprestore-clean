import React, { useState, useRef, useEffect } from 'react';

interface RestoreSliderProps {
  originalImage: string;
  restoredImage: string;
}

export function RestoreSlider({ originalImage, restoredImage }: RestoreSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderInputRef = useRef<HTMLInputElement>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = Number(e.target.value);
    setSliderPosition(newPosition);
    // Announce the change to screen readers
    const percentage = Math.round(newPosition);
    const message = `Slider at ${percentage}%, showing ${percentage}% of restored image`;
    announceToScreenReader(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1; // Larger steps with shift key
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition(prev => {
        const newPosition = Math.max(0, prev - step);
        announceToScreenReader(`Slider moved left to ${Math.round(newPosition)}%`);
        return newPosition;
      });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition(prev => {
        const newPosition = Math.min(100, prev + step);
        announceToScreenReader(`Slider moved right to ${Math.round(newPosition)}%`);
        return newPosition;
      });
    }
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    const touch = e.touches[0];
    const rect = sliderRef.current.getBoundingClientRect();
    const position = ((touch.clientX - rect.left) / rect.width) * 100;
    const newPosition = Math.max(0, Math.min(100, position));
    setSliderPosition(newPosition);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Function to announce changes to screen readers
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  useEffect(() => {
    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('touchend', handleGlobalTouchEnd);
    return () => {
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, []);

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto"
      role="region"
      aria-label="Image comparison slider"
    >
      <div 
        className="relative overflow-hidden rounded-lg shadow-2xl"
        ref={sliderRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Before Image */}
        <img
          src={originalImage}
          alt="Original image before restoration"
          className="w-full h-64 sm:h-72 object-contain bg-gray-50"
          loading="lazy"
        />
        
        {/* After Image */}
        <div 
          className="absolute top-0 left-0 w-full h-full overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          aria-hidden="true"
        >
          <img
            src={restoredImage}
            alt="Restored image after enhancement"
            className="w-full h-64 sm:h-72 object-contain bg-gray-50"
            loading="lazy"
          />
        </div>
        
        {/* Labels */}
        <div 
          className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm"
          role="text"
          aria-label="Original image"
        >
          Before
        </div>
        <div 
          className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm"
          role="text"
          aria-label="Restored image"
        >
          After
        </div>
        
        {/* Slider */}
        <div 
          className="absolute top-0 left-0 w-full h-full flex items-center"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sliderPosition}
          aria-valuetext={`${Math.round(sliderPosition)}% restored image visible`}
          aria-label="Image comparison slider"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <input
            ref={sliderInputRef}
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={handleSliderChange}
            className="w-full opacity-0 cursor-pointer"
            aria-label="Adjust image comparison"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={sliderPosition}
            aria-valuetext={`${Math.round(sliderPosition)}% restored image visible`}
          />
          <div 
            className="absolute w-1 h-full bg-white shadow-lg pointer-events-none"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            aria-hidden="true"
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-center text-gray-600 mt-4">
        Drag the slider or use arrow keys to compare the original and restored images. Hold Shift for larger steps.
      </p>
    </div>
  );
}
