import { useState, useEffect } from 'react';
import { Theme } from '../types';

export function useDarkMode(theme: Theme = 'system'): [boolean, () => void] {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    if (theme === 'dark' || theme === 'oled') {
        return true;
    }
    if (theme === 'light') {
        return false;
    }
    // For 'system' theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || theme === 'oled' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(isDark);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleDarkMode = () => {
    // This is now more of a manual override, actual theme change is handled in settings
    setIsDarkMode(!isDarkMode);
  };

  return [isDarkMode, toggleDarkMode];
}
