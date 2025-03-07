
import { useEffect } from 'react';

/**
 * Hook that adds visual focus indicators when using keyboard navigation
 * but hides them during mouse/touch interaction.
 * - Improves accessibility for keyboard users
 * - Maintains clean visuals for mouse/touch users
 * - Mobile-friendly implementation
 */
export function useKeyboardNavigation() {
  useEffect(() => {
    // Add keyboard focus styles when Tab key is used
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    // Remove keyboard focus styles when mouse is used
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };
    
    // Remove keyboard focus styles when touch is used (mobile)
    const handleTouchStart = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleTouchStart);

    // Clean up on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);
}
