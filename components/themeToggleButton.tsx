// app/components/ThemeToggleButton.tsx
'use client';

import { useTheme } from '@/app/contexts/themeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        fixed          
        bottom-5       
        right-5        
        z-50           
        bg-header    
        text-accent
        dark:bg-primary 
        dark:text-accent 
        p-3            
        rounded-full   
        hover:scale-105 
        active:scale-90  
        transition-all 
        shadow-lg
      "
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
    </button>
  );
};