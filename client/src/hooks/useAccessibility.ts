import { useEffect, useState } from 'react';

interface AccessibilityPreferences {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersDarkTheme: boolean;
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
}

export function useAccessibility(): AccessibilityPreferences {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkTheme: false,
    prefersColorScheme: 'no-preference',
  });

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    const updatePreferences = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const darkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      let colorScheme: 'light' | 'dark' | 'no-preference' = 'no-preference';
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        colorScheme = 'dark';
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        colorScheme = 'light';
      }

      setPreferences({
        prefersReducedMotion: reducedMotion,
        prefersHighContrast: highContrast,
        prefersDarkTheme: darkTheme,
        prefersColorScheme: colorScheme,
      });
    };

    // Initial check
    updatePreferences();

    // Set up media query listeners
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-color-scheme: light)'),
    ];

    mediaQueries.forEach(mq => {
      if (mq.addEventListener) {
        mq.addEventListener('change', updatePreferences);
      } else {
        // Fallback for older browsers
        mq.addListener(updatePreferences);
      }
    });

    // Cleanup listeners
    return () => {
      mediaQueries.forEach(mq => {
        if (mq.removeEventListener) {
          mq.removeEventListener('change', updatePreferences);
        } else {
          // Fallback for older browsers
          mq.removeListener(updatePreferences);
        }
      });
    };
  }, []);

  return preferences;
}

// Hook for managing focus
export function useFocusManagement() {
  const [focusVisible, setFocusVisible] = useState(false);

  useEffect(() => {
    let hadKeyboardEvent = false;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
          e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter' || 
          e.key === 'Space') {
        hadKeyboardEvent = true;
      }
    };

    const onFocus = (e: FocusEvent) => {
      if (hadKeyboardEvent) {
        setFocusVisible(true);
      }
    };

    const onBlur = () => {
      setFocusVisible(false);
    };

    const onMouseDown = () => {
      hadKeyboardEvent = false;
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  return { focusVisible };
}

// Hook for announcing content to screen readers
export function useScreenReader() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
}

export default useAccessibility;