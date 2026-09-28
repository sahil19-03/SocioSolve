import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTop Component
 * 1. Guarantees every new page starts from the very top (0, 0).
 * 2. Guarantees the scroll-to-top button is completely hidden on arrival.
 * 3. Shows the floating scroll-to-top button only after the user scrolls down > 300px.
 * 4. Smoothly scrolls back to top when clicked.
 */
export default function ScrollToTop() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const suppressed = useRef(false);
  const suppressTimer = useRef(null);

  // Helper to get true current scroll position across all browsers and potential containers
  const getScrollY = () => {
    const winY = window.scrollY || window.pageYOffset || 0;
    const docY = document.documentElement?.scrollTop || 0;
    const bodyY = document.body?.scrollTop || 0;
    const mainY = document.querySelector('.app-main')?.scrollTop || 0;
    return Math.max(winY, docY, bodyY, mainY);
  };

  // Helper to reset all scroll positions instantly
  const resetAllScroll = () => {
    // Reset window & document scroll (the primary scrolling container)
    try {
      window.scrollTo(0, 0);
    } catch {
      // fallback
    }
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
    // Reset .app-main if it ever has overflow
    const main = document.querySelector('.app-main');
    if (main) {
      main.scrollTop = 0;
    }
  };

  // 1. Disable browser's automatic scroll restoration so React Router controls it
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 2. On EVERY route/navigation change -> force scroll to top & hide button
  useEffect(() => {
    // Instantly hide the button
    setVisible(false);

    // Suppress scroll listener so page layout shifts or inertial scrolls don't trigger the button
    suppressed.current = true;
    if (suppressTimer.current) {
      clearTimeout(suppressTimer.current);
    }

    // Reset scroll immediately
    resetAllScroll();

    // Reset again on next animation frame (after React commits DOM changes)
    const rafId = requestAnimationFrame(() => {
      resetAllScroll();
    });

    // Reset again after micro-delay (handles any async render / layout recalculations)
    const timeoutId = setTimeout(() => {
      resetAllScroll();
    }, 50);

    // Un-suppress after transition has settled (350ms)
    suppressTimer.current = setTimeout(() => {
      suppressed.current = false;
      // Re-verify: button must only show if genuinely scrolled down > 300px
      if (getScrollY() <= 300) {
        setVisible(false);
      }
    }, 350);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      if (suppressTimer.current) {
        clearTimeout(suppressTimer.current);
      }
    };
  }, [location.pathname, location.search, location.key]);

  // 3. Listen to scroll events on window, document, and .app-main
  useEffect(() => {
    const handleScroll = () => {
      if (suppressed.current) {
        setVisible(false);
        return;
      }
      const scrollY = getScrollY();
      setVisible(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    const main = document.querySelector('.app-main');
    if (main) {
      main.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      if (main) {
        main.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // 4. Smooth scroll back to top when clicked
  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }

    if (document.documentElement) {
      try {
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {
        document.documentElement.scrollTop = 0;
      }
    }

    if (document.body) {
      try {
        document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {
        document.body.scrollTop = 0;
      }
    }

    const main = document.querySelector('.app-main');
    if (main) {
      try {
        main.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {
        main.scrollTop = 0;
      }
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Scroll to top"
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 99999,
        width: 46,
        height: 46,
        borderRadius: '50%',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        background: 'linear-gradient(135deg, #6d28d9 0%, #3b82f6 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(109, 40, 217, 0.45)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.85)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.25s ease, transform 0.25s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(109, 40, 217, 0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.85)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(109, 40, 217, 0.45)';
      }}
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
}
