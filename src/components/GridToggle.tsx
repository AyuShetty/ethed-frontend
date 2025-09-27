"use client";

import { useState } from 'react';

export default function GridToggle() {
  const [isEnabled, setIsEnabled] = useState(true);

  const toggleGrid = () => {
    setIsEnabled(!isEnabled);
    // You can extend this to communicate with the GlobalGrid component
    // or use a context/state management solution
    window.dispatchEvent(new CustomEvent('toggleGrid', { detail: !isEnabled }));
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={toggleGrid}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isEnabled 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600' 
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        {isEnabled ? '✨ Grid On' : '◇ Grid Off'}
      </button>
    </div>
  );
}