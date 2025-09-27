"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface CreativeGridProps {
  className?: string;
  contentSelectors?: string[]; // CSS selectors for content areas that need darker glow
  adaptiveGlow?: boolean; // Enable intelligent glow adaptation
}

export default function CreativeGrid({ 
  className = '', 
  contentSelectors = ['h1', 'h2', 'h3', 'p', '.text-content', 'button', '[data-text-content]'],
  adaptiveGlow = true 
}: CreativeGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const glowIntensityRef = useRef(1.0); // Dynamic glow intensity

  // Detect if mouse is over content areas
  const detectContentArea = useCallback((clientX: number, clientY: number) => {
    if (!adaptiveGlow) return false;
    
    const elementsUnderMouse = document.elementsFromPoint(clientX, clientY);
    
    for (const element of elementsUnderMouse) {
      // Check if element matches any content selector
      for (const selector of contentSelectors) {
        if (element.matches?.(selector) || element.closest?.(selector)) {
          return true;
        }
      }
      
      // Additional checks for text content
      if (element.textContent && element.textContent.trim().length > 10) {
        const computedStyle = window.getComputedStyle(element);
        const hasVisibleText = computedStyle.color !== 'rgba(0, 0, 0, 0)' && 
                              computedStyle.opacity !== '0' &&
                              computedStyle.visibility !== 'hidden';
        if (hasVisibleText) return true;
      }
    }
    
    return false;
  }, [adaptiveGlow, contentSelectors]);

  // Smooth mouse tracking with intelligent glow adaptation
  const updateMousePosition = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;

    mouseRef.current.prevX = mouseRef.current.x;
    mouseRef.current.prevY = mouseRef.current.y;
    mouseRef.current.x = newX;
    mouseRef.current.y = newY;

    // Detect content areas and adjust glow intensity
    const isOverContent = detectContentArea(e.clientX, e.clientY);
    const targetIntensity = isOverContent ? 0.25 : 1.0; // Much darker over content
    
    // Smooth transition between intensities
    glowIntensityRef.current = glowIntensityRef.current + (targetIntensity - glowIntensityRef.current) * 0.1;

    // Create particles on mouse movement
    const speed = Math.sqrt(
      Math.pow(newX - mouseRef.current.prevX, 2) + 
      Math.pow(newY - mouseRef.current.prevY, 2)
    );

    if (speed > 2 && particlesRef.current.length < 50) {
      for (let i = 0; i < Math.min(3, Math.ceil(speed / 10)); i++) {
        particlesRef.current.push({
          x: newX + (Math.random() - 0.5) * 20,
          y: newY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 0,
          maxLife: 30 + Math.random() * 30,
          size: 1 + Math.random() * 2,
        });
      }
    }
  }, [detectContentArea]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Event handlers
    const handleMouseMove = (e: MouseEvent) => {
      updateMousePosition(e);
      if (!isActive) setIsActive(true);
    };

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => {
      setIsActive(false);
      particlesRef.current = [];
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (isActive) {
        const mouse = mouseRef.current;
        const intensity = glowIntensityRef.current;

        // Adaptive glow effect with multiple layers
        ctx.save();
        
        // Outer glow - adapts to content
        const outerGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 200
        );
        outerGradient.addColorStop(0, `rgba(34, 211, 238, ${0.15 * intensity})`); // cyan-400
        outerGradient.addColorStop(0.3, `rgba(16, 185, 129, ${0.1 * intensity})`); // emerald-500
        outerGradient.addColorStop(0.6, `rgba(59, 130, 246, ${0.05 * intensity})`); // blue-500
        outerGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = outerGradient;
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Inner intense glow - more dramatic adaptation
        const innerGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 80
        );
        innerGradient.addColorStop(0, `rgba(34, 211, 238, ${0.4 * intensity})`);
        innerGradient.addColorStop(0.5, `rgba(16, 185, 129, ${0.2 * intensity})`);
        innerGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = innerGradient;
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Core bright spot - subtle over content
        const coreIntensity = Math.max(0.1, intensity); // Always keep some core visibility
        const coreGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 25
        );
        coreGradient.addColorStop(0, `rgba(255, 255, 255, ${0.3 * coreIntensity})`);
        coreGradient.addColorStop(0.3, `rgba(34, 211, 238, ${0.6 * coreIntensity})`);
        coreGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = coreGradient;
        ctx.fillRect(0, 0, rect.width, rect.height);

        ctx.restore();

        // Update and draw particles
        particlesRef.current = particlesRef.current.filter(particle => {
          particle.life += deltaTime / 16.67; // Normalize to ~60fps
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.98; // Slight drag
          particle.vy *= 0.98;

          if (particle.life >= particle.maxLife) return false;

          // Draw particle with adaptive intensity
          const alpha = Math.max(0, 1 - particle.life / particle.maxLife) * intensity;
          const size = particle.size * (1 - particle.life / particle.maxLife * 0.5);
          
          ctx.save();
          ctx.globalAlpha = alpha;
          
          const particleGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, size * 2
          );
          particleGradient.addColorStop(0, `rgba(34, 211, 238, ${0.8 * intensity})`);
          particleGradient.addColorStop(0.5, `rgba(16, 185, 129, ${0.4 * intensity})`);
          particleGradient.addColorStop(1, 'transparent');

          ctx.fillStyle = particleGradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
          return true;
        });

        // Grid intersection highlights
        const gridSize = 20;
        const glowRadius = 120;
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        for (let x = 0; x < rect.width; x += gridSize) {
          for (let y = 0; y < rect.height; y += gridSize) {
            const distance = Math.sqrt(
              Math.pow(x - mouse.x, 2) + Math.pow(y - mouse.y, 2)
            );
            
            if (distance < glowRadius) {
              const gridIntensity = Math.max(0, 1 - distance / glowRadius);
              const alpha = gridIntensity * 0.6 * glowIntensityRef.current; // Apply adaptive intensity
              
              if (alpha > 0.02) {
                ctx.save();
                ctx.globalAlpha = alpha;
                
                const dotGradient = ctx.createRadialGradient(
                  x, y, 0, x, y, 3 + gridIntensity * 2
                );
                dotGradient.addColorStop(0, 'rgba(34, 211, 238, 1)');
                dotGradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.8)');
                dotGradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = dotGradient;
                ctx.beginPath();
                ctx.arc(x, y, 2 + gridIntensity * 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            }
          }
        }
        
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, updateMousePosition]);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Static grid base */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3bc2f922_1px,transparent_1px),linear-gradient(to_bottom,#10b98122_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
      
      {/* Interactive canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          mixBlendMode: 'screen',
          filter: 'blur(0.3px)',
        }}
      />
      
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
    </div>
  );
}