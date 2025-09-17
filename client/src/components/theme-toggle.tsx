
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 touch-target"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun 
          className="h-4 w-4 transition-all duration-200 ease-in-out" 
          aria-hidden="true"
        />
      ) : (
        <Moon 
          className="h-4 w-4 transition-all duration-200 ease-in-out" 
          aria-hidden="true"
        />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
