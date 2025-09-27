"use client";

import { useEffect, useRef, useState } from 'react';

interface InteractiveGridProps {
  gridSize?: number;
  glowSize?: number;
  glowIntensity?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

export default function InteractiveGrid({
  gridSize = 20,
  glowSize = 150,
  glowIntensity = 0.6,
  primaryColor = '#22d3ee', // cyan-400
  secondaryColor = '#10b981', // emerald-500
  className = '',
}: InteractiveGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isVisible) {
        // Create radial gradient for glow effect
        const gradient = ctx.createRadialGradient(
          mousePosition.x, mousePosition.y, 0,
          mousePosition.x, mousePosition.y, glowSize
        );

        // Multi-color gradient with transparency
        gradient.addColorStop(0, `${primaryColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.3, `${secondaryColor}${Math.round(glowIntensity * 0.7 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.6, `${primaryColor}${Math.round(glowIntensity * 0.4 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add sparkle effect at mouse position
        const sparkleGradient = ctx.createRadialGradient(
          mousePosition.x, mousePosition.y, 0,
          mousePosition.x, mousePosition.y, 30
        );
        sparkleGradient.addColorStop(0, `${primaryColor}ff`);
        sparkleGradient.addColorStop(0.5, `${secondaryColor}aa`);
        sparkleGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = sparkleGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePosition, isVisible, glowSize, glowIntensity, primaryColor, secondaryColor]);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Static grid background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${primaryColor}33 1px, transparent 1px),
            linear-gradient(to bottom, ${secondaryColor}33 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
      
      {/* Interactive canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none mix-blend-screen"
        style={{ filter: 'blur(0.5px)' }}
      />
      
      {/* Enhanced grid intersection dots */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at ${gridSize/2}px ${gridSize/2}px, ${primaryColor}66 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
    </div>
  );
}