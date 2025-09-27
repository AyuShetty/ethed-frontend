"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  posterSrc: string;      // "/pause.png" or "/media/poster.png"
  p1Src: string;          // "/p1.gif" (3s peek/emerge animation)
  p2Src: string;          // "/p2.gif" (2s retreat/idle animation)
  size?: number;          // px 
  offset?: { right: number; bottom: number };
};

export default function AgentHover({
  posterSrc,
  p1Src,
  p2Src,
  size = 128,
  offset = { right: 16, bottom: 16 },
}: Props) {
  const [src, setSrc] = useState(posterSrc);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cacheBust = useRef(0);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const hoveredRef = useRef(false);

  // Check for prefers-reduced-motion on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Clear any pending timers on unmount
  useEffect(() => {
    return () => { 
      if (timer.current) clearTimeout(timer.current); 
    };
  }, []);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const showPoster = () => {
    setSrc(posterSrc);
  };

  const playGif = (gifSrc: string, duration: number, onComplete?: () => void) => {
    // Cache-bust to restart from frame 1
    cacheBust.current += 1;
    setSrc(`${gifSrc}?v=${cacheBust.current}`);
    
    // Clear any existing timer
    clearTimer();
    
    // Set timer for when animation completes
    timer.current = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);
  };

  const onEnter = () => {
    // If reduced motion is preferred, just show poster
    if (prefersReducedMotion) {
      setIsVisible(true);
      showPoster();
      return;
    }

    // Set hovered state and make visible immediately
    hoveredRef.current = true;
    setIsVisible(true);
    
    // Cancel any pending timers from previous interactions
    clearTimer();
    
    // Immediately start p1.gif (peek/emerge animation)
    playGif(p1Src, 2000, () => {
      // After p1 completes, check if still hovered and show pause.png
      // Use ref to get current value and avoid stale closure
      if (hoveredRef.current) {
        showPoster(); // This shows pause.png
      }
    });
  };

  const onLeave = () => {
    // Set hovered state immediately
    hoveredRef.current = false;
    
    // Cancel any pending timers from previous interactions
    clearTimer();
    
    // If reduced motion is preferred, just hide immediately
    if (prefersReducedMotion) {
      setIsVisible(false);
      return;
    }
    
    // Immediately start p2.gif (retreat/idle animation) - this replaces whatever was showing
    playGif(p2Src, 600, () => {
      // After p2 completes, hide the agent completely
      setIsVisible(false);
    });
  };

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: "fixed",
        right: offset.right,
        bottom: offset.bottom,
        width: size,
        height: size,
        zIndex: 9999,
        cursor: "pointer",
      }}
      aria-label="EthEd Agent"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="agent"
        width={size}
        height={size}
        style={{ 
          width: "100%", 
          height: "100%", 
          objectFit: "contain", 
          display: "block",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.2s ease-in-out" // Smooth fade in/out
        }}
      />
    </div>
  );
}
