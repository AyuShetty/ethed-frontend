"use client";

import { useState } from 'react';
import CreativeGrid from '@/components/CreativeGrid';

export default function GridDemo() {
  const [adaptiveMode, setAdaptiveMode] = useState(true);

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden">
      {/* Grid Background */}
      <CreativeGrid 
        adaptiveGlow={adaptiveMode}
        contentSelectors={[
          'h1', 'h2', 'h3', 'p', 'button', 
          '.demo-text', '.demo-content',
          '[data-text-content]'
        ]}
      />
      
      {/* Demo Content */}
      <div className="relative z-10 p-8 space-y-8">
        {/* Control */}
        <div className="text-center">
          <button
            onClick={() => setAdaptiveMode(!adaptiveMode)}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            {adaptiveMode ? 'Disable' : 'Enable'} Adaptive Glow
          </button>
        </div>

        {/* Background Area - Bright Glow */}
        <div className="text-center py-12">
          <h2 className="text-2xl text-cyan-300 mb-4">Background Area</h2>
          <p className="text-slate-400">Move your mouse here - bright glow in empty areas</p>
        </div>

        {/* Text Content Area - Dark Glow */}
        <div className="max-w-2xl mx-auto demo-content" data-text-content>
          <h1 className="text-4xl font-bold text-white mb-6 demo-text">
            Smart Grid Effect
          </h1>
          <p className="text-lg text-slate-300 mb-4 demo-text">
            This text area uses darker glow when you hover over it to preserve readability. 
            The effect automatically detects content areas and reduces glow intensity.
          </p>
          <p className="text-slate-400 demo-text">
            Notice how the glow smoothly transitions between bright (in empty areas) 
            and subtle (over text content) as you move your mouse around.
          </p>
          
          <div className="mt-6 space-x-4">
            <button className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-900 rounded-lg font-semibold">
              Button with Adaptive Glow
            </button>
            <button className="px-6 py-3 border border-cyan-400 text-cyan-300 rounded-lg">
              Another Button
            </button>
          </div>
        </div>

        {/* More Background Area */}
        <div className="text-center py-12">
          <h3 className="text-xl text-emerald-300 mb-4">More Background Space</h3>
          <p className="text-slate-500">Full intensity glow returns here</p>
        </div>

        {/* Feature Explanation */}
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8" data-text-content>
          <div className="demo-content">
            <h3 className="text-xl font-semibold text-cyan-300 mb-3">🌟 Smart Detection</h3>
            <p className="text-slate-400">
              Automatically detects text, buttons, and content areas using CSS selectors 
              and DOM analysis.
            </p>
          </div>
          <div className="demo-content">
            <h3 className="text-xl font-semibold text-emerald-300 mb-3">🎯 Smooth Transitions</h3>
            <p className="text-slate-400">
              Seamless interpolation between bright and subtle glow modes 
              for natural user experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}