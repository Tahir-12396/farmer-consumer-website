import React, { createContext, useContext, useState, useEffect } from 'react';

const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
  // Modes: 'subtle' (0.18), 'medium' (0.45), 'vivid' (1.0 - no opacity reduction)
  const [bgMode, setBgMode] = useState(() => {
    return localStorage.getItem('kisan_bg_mode') || 'subtle';
  });

  const getOpacityForMode = (mode) => {
    switch (mode) {
      case 'vivid': return 0.95; // Full opacity without reduction
      case 'medium': return 0.45;
      case 'subtle':
      default: return 0.18; // Like real online agricultural websites
    }
  };

  const [bgOpacity, setBgOpacity] = useState(getOpacityForMode(bgMode));

  useEffect(() => {
    const op = getOpacityForMode(bgMode);
    setBgOpacity(op);
    localStorage.setItem('kisan_bg_mode', bgMode);
  }, [bgMode]);

  const cycleBgMode = () => {
    if (bgMode === 'subtle') setBgMode('medium');
    else if (bgMode === 'medium') setBgMode('vivid');
    else setBgMode('subtle');
  };

  return (
    <BackgroundContext.Provider value={{ bgMode, setBgMode, bgOpacity, setBgOpacity, cycleBgMode }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => useContext(BackgroundContext);
