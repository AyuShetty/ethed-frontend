"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  posterSrc: string;      // "/pause.png" or "/media/poster.png"
  p1Src: string;          // "/p1.gif" (3s peek/emerge animation)
  p2Src: string;          // "/p2.gif" (2s retreat/idle animation)
  p3Src?: string;         // "/p3.gif" (2.2s click animation)
  pause2Src?: string;     // "/pause 2.png" (clicked state)
  size?: number;          // px 
  offset?: { right: number; bottom: number };
};

export default function AgentHover({
  posterSrc,
  p1Src,
  p2Src,
  p3Src = "/p3.gif",
  pause2Src = "/pause 2.png",
  size = 128,
  offset = { right: 16, bottom: 16 },
}: Props) {
  const [src, setSrc] = useState(posterSrc);
  const [isVisible, setIsVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cacheBust = useRef(0);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const hoveredRef = useRef(false);
  const isPlayingP3Ref = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  useEffect(() => {
    return () => { 
      if (timer.current) clearTimeout(timer.current); 
    };
  }, []);

  // Handle click outside to close dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDialog && event.target) {
        const target = event.target as Element;
        
        // Check if click is inside dialog or agent
        const dialogElement = document.querySelector('[data-agent-dialog="true"]');
        const agentElement = document.querySelector('[data-agent-container="true"]');
        
        const isInsideDialog = dialogElement?.contains(target);
        const isInsideAgent = agentElement?.contains(target);
        
        // Only close if clicked outside both dialog and agent
        if (!isInsideDialog && !isInsideAgent) {
          closeDialog();
        }
      }
    };

    if (showDialog) {
      document.addEventListener('click', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [showDialog]);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const showPoster = () => {
    setSrc(isClicked ? pause2Src : posterSrc);
  };

  const onClick = () => {
    if (prefersReducedMotion) {
      setIsClicked(true);
      setShowDialog(true);
      showPoster();
      return;
    }

    setIsClicked(true);
    isPlayingP3Ref.current = true;
    clearTimer();
    
    // Play p3.gif for 2.2 seconds (22 * 0.1s)
    playGif(p3Src, 2200, () => {
      // After p3 completes, ALWAYS show pause2.png and dialog regardless of hover state
      isPlayingP3Ref.current = false;
      setSrc(pause2Src);
      setShowDialog(true);
      // Agent stays visible and dialog remains open until user clicks elsewhere
    });
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
    if (prefersReducedMotion) {
      setIsVisible(true);
      showPoster();
      return;
    }

    hoveredRef.current = true;
    setIsVisible(true);
    clearTimer();
    
    // Start p1.gif briefly, then switch to pause1
    playGif(p1Src, 1800, () => {
      // After brief p1 animation, show pause1 image while hovering
      if (hoveredRef.current) {
        setSrc(posterSrc); // Show pause1.png (posterSrc)
      }
    });
  };

  const onLeave = () => {
    hoveredRef.current = false;
    
    // If clicked (either dialog is open or p3 is playing), don't hide on mouse leave
    if (isClicked) {
      return; // Stay visible when clicked, regardless of dialog state
    }
    
    // If p3 is currently playing, let it complete first
    if (isPlayingP3Ref.current) {
      return; // Don't interrupt p3 animation
    }
    
    clearTimer();
    
    if (prefersReducedMotion) {
      setIsVisible(false);
      return;
    }
    
     playGif(p2Src, 600, () => {
      setIsVisible(false);
    });
  };

  const closeDialog = () => {
    setShowDialog(false);
    setIsClicked(false);
    isPlayingP3Ref.current = false;
    setSrc(posterSrc); // Back to pause1
  };

  return (
    <>
      <div
        data-agent-container="true"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
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

      {/* Enhanced Dialog/Chat Bubble */}
      {showDialog && (
        <div
          data-agent-dialog="true"
          style={{
            position: "fixed",
            right: offset.right + size + 20,
            bottom: offset.bottom + size - 30,
            zIndex: 10000,
          }}
          className="animate-in slide-in-from-right-2 fade-in-0 duration-300"
          onClick={(e) => e.stopPropagation()} // Prevent click outside from closing
        >
          <div className="relative max-w-xs">
            {/* Compact Glassmorphism Chat Bubble */}
            <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-blue-950/80 via-slate-900/70 to-emerald-950/90 border border-cyan-300/20 dark:border-emerald-500/30 shadow-[0_8px_32px_rgba(18,185,214,0.15)] p-3">
              
              {/* Glassmorphic overlay */}
              <div className="absolute inset-0 rounded-xl pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_60%)]" />
              
              {/* Arrow pointing to agent */}
              <div className="absolute -right-2 bottom-6">
                <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[10px] border-t-transparent border-b-transparent border-l-cyan-300/20" />
                <div className="absolute -right-[9px] bottom-0 w-0 h-0 border-t-[7px] border-b-[7px] border-l-[8px] border-t-transparent border-b-transparent border-l-slate-900/80" />
              </div>
              
              {/* Dialog Content */}
              <div className="relative z-10 space-y-2">
                {/* Compact Header */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-400/10 to-emerald-400/10 border border-cyan-300/20">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full animate-pulse" />
                    <p className="text-xs font-medium bg-gradient-to-r from-cyan-300/90 to-emerald-300/90 bg-clip-text text-transparent">
                      EthEd Assistant
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-medium text-center">
                  How can I help?
                </p>
                
                {/* Compact Action Buttons */}
                <div className="space-y-1">
                  <button
                    className="group w-full text-left p-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-emerald-500/10 border border-transparent hover:border-cyan-300/20"
                    onClick={() => {
                      // TODO: Connect to backend
                      console.log("Mint Founding Learner NFT clicked");
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-sm">🎯</div>
                      <div className="text-xs font-medium text-cyan-200 group-hover:text-cyan-100">
                        Mint Founding Learner NFT
                      </div>
                    </div>
                  </button>
                  
                  <button
                    className="group w-full text-left p-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-blue-500/10 border border-transparent hover:border-emerald-300/20"
                    onClick={() => {
                      // TODO: Connect to backend
                      console.log("Learn about EthEd clicked");
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-sm">📚</div>
                      <div className="text-xs font-medium text-emerald-200 group-hover:text-emerald-100">
                        Learn about EthEd
                      </div>
                    </div>
                  </button>
                  
                  <button
                    className="group w-full text-left p-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 border border-transparent hover:border-blue-300/20"
                    onClick={() => {
                      // TODO: Connect to backend
                      console.log("Get started clicked");
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-sm">🚀</div>
                      <div className="text-xs font-medium text-blue-200 group-hover:text-blue-100">
                        Start Learning Journey
                      </div>
                    </div>
                  </button>
                  
                  <button
                    className="group w-full text-left p-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 border border-transparent hover:border-purple-300/20"
                    onClick={() => {
                      // TODO: Connect to backend
                      console.log("Ask a question clicked");
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-sm">💬</div>
                      <div className="text-xs font-medium text-purple-200 group-hover:text-purple-100">
                        Ask me anything
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Compact Close button */}
              <button
                onClick={closeDialog}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/80 hover:to-slate-700/80 border border-slate-500/30 hover:border-slate-400/40 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 shadow-lg backdrop-blur-sm"
                aria-label="Close dialog"
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
