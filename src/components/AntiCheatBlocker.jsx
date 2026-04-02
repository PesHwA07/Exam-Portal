import { useEffect, useCallback } from 'react';

/**
 * AntiCheatBlocker
 * Wraps exam content and blocks common cheating vectors:
 * - Tab switch / window blur detection
 * - Right-click context menu
 * - Copy / Cut / Paste / Drag
 * - Keyboard shortcuts (PrintScreen, F12, Ctrl+Shift+I/J/C, Ctrl+S, Ctrl+U, etc.)
 */
export default function AntiCheatBlocker({ children, onViolation }) {

  // -- Visibility change detection (tab switch) --
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      onViolation();
    }
  }, [onViolation]);

  // -- Window blur detection (alt-tab, etc.) --
  const handleBlur = useCallback(() => {
    // Small delay to avoid false positives with fullscreen prompts
    setTimeout(() => {
      if (document.hidden) {
        onViolation();
      }
    }, 200);
  }, [onViolation]);

  // -- Context menu block --
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  // -- Copy/Cut/Paste/Drag block --
  const handleCopyCutPaste = useCallback((e) => {
    e.preventDefault();
  }, []);

  // -- Keyboard shortcut block --
  const handleKeyDown = useCallback((e) => {
    // Block PrintScreen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      onViolation();
      // Clear clipboard attempt
      navigator.clipboard?.writeText?.('').catch(() => {});
      return;
    }

    // Block F12 (dev tools)
    if (e.key === 'F12') {
      e.preventDefault();
      return;
    }

    // Block Ctrl+Shift+I/J/C (dev tools)
    if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    // Block Ctrl+U (view source)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      return;
    }

    // Block Ctrl+S (save page)
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      return;
    }

    // Block Ctrl+C / Ctrl+V / Ctrl+X (copy/paste/cut)
    if (e.ctrlKey && ['c', 'C', 'v', 'V', 'x', 'X'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    // Block Ctrl+A (select all)
    if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      return;
    }

    // Block Alt+Tab (detection only, can't truly prevent)
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    // Block Meta key (Win key)
    if (e.metaKey) {
      e.preventDefault();
      return;
    }

    // Block Escape (would exit fullscreen, but browser may still process it)
    if (e.key === 'Escape') {
      e.preventDefault();
      return;
    }
  }, [onViolation]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('dragstart', handleCopyCutPaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('dragstart', handleCopyCutPaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleVisibilityChange, handleBlur, handleContextMenu, handleCopyCutPaste, handleKeyDown]);

  return <>{children}</>;
}
