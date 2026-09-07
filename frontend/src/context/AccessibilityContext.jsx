import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

const STORAGE_KEY = 'coopserve_a11y_mode';

export const AccessibilityProvider = ({ children }) => {
  const [accessibilityMode, setAccessibilityModeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'ELDERLY' ? 'ELDERLY' : 'STANDARD';
    } catch {
      return 'STANDARD';
    }
  });

  const isElderlyMode = accessibilityMode === 'ELDERLY';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, accessibilityMode);
      if (accessibilityMode === 'ELDERLY') {
        document.documentElement.setAttribute('data-a11y', 'elderly');
      } else {
        document.documentElement.removeAttribute('data-a11y');
      }
    } catch (err) {
      console.warn('Error saving accessibility preference:', err);
    }
  }, [accessibilityMode]);

  const toggleAccessibilityMode = () => {
    setAccessibilityModeState(prev => (prev === 'ELDERLY' ? 'STANDARD' : 'ELDERLY'));
  };

  const setAccessibilityMode = (mode) => {
    if (mode === 'ELDERLY' || mode === 'STANDARD') {
      setAccessibilityModeState(mode);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        accessibilityMode,
        isElderlyMode,
        toggleAccessibilityMode,
        setAccessibilityMode
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
