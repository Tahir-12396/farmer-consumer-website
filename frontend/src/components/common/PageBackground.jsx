import React from 'react';
import { useBackground } from '../../contexts/BackgroundContext';

const PageBackground = ({ image, customOpacity, blur = false, className = '' }) => {
  const { bgOpacity, bgMode } = useBackground();
  const effectiveOpacity = customOpacity !== undefined ? customOpacity : bgOpacity;

  return (
    <div className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden ${className}`}>
      <img
        src={image}
        alt="KisanDirect Agriculture Background"
        style={{ opacity: effectiveOpacity, imageRendering: '-webkit-optimize-contrast' }}
        className={`w-full h-full object-cover object-center transition-opacity duration-500 will-change-transform ${
          blur ? 'filter blur-[1px]' : ''
        }`}
      />
      {/* Dynamic protective gradient overlay to ensure text contrast remains clear on any device */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-kisan-bg/90 via-kisan-bg/60 to-kisan-bg/95 transition-opacity duration-500" 
        style={{ opacity: bgMode === 'vivid' ? 0.35 : 0.85 }}
      />
    </div>
  );
};

export default PageBackground;
