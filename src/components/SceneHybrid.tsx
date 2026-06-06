import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Eye, Cpu, HelpCircle, Activity, Sparkles, Sliders } from 'lucide-react';
import { FrameConfig } from '../types';
import Scene2D from './Scene2D';

const Scene3D = React.lazy(() => import('./Scene3D'));

interface SceneHybridProps {
  photoDataUrl: string;
  config: FrameConfig;
}

export default function SceneHybrid({ photoDataUrl, config }: SceneHybridProps) {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>(() => {
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('shadowbox_viewport_pref');
      if (savedPreference === '2d' || savedPreference === '3d') {
        return savedPreference;
      }
      // Guarantee the high-end 3D WebGL diorama is active by default on load
      return '3d';
    }
    return '3d';
  });
  const [deviceDetails, setDeviceDetails] = useState({ isMobile: false, isSlow: false });

  useEffect(() => {
    // 1. Detect actual mobile operating systems without classifying small desktop window/iframes as mobile
    const ua = navigator.userAgent || '';
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    // 2. Detect slow 4G or data-saver modes
    let isSlowConn = false;
    const conn = (navigator as any).connection;
    if (conn) {
      if (conn.saveData || ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) {
        isSlowConn = true;
      }
    }

    setDeviceDetails({ isMobile: isMobileDevice, isSlow: isSlowConn });
  }, []);

  const handleModeChange = (mode: '2d' | '3d') => {
    setViewMode(mode);
    localStorage.setItem('shadowbox_viewport_pref', mode);
  };

  return (
    <div className="space-y-4">
      {/* Smart Render Mode Selector Toggle Panel */}
      <div className="bg-white px-4 py-3.5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-3 text-left">
          <div className="w-9 h-9 rounded-xl bg-zinc-900/5 flex items-center justify-center text-zinc-800">
            {viewMode === '2d' ? <Cpu className="w-4 h-4 text-amber-600 animate-pulse" /> : <Sparkles className="w-4 h-4 text-indigo-600" />}
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              Viewport Engine Options
              {deviceDetails.isMobile && (
                <span className="text-[9px] bg-amber-500/10 text-amber-600 font-semibold px-1 rounded">MOBILE SYSTEM DETECTED</span>
              )}
            </h4>
            <p className="text-[11px] text-zinc-500">
              {viewMode === '2d' 
                ? "Low-Lag Lite Mode is active: 0% CPU strain, best for mobile." 
                : "3D Viewport is active: Real-time shadow tracking and camera orbits."}
            </p>
          </div>
        </div>

        {/* Double mechanical pill buttons for mode selection */}
        <div className="p-0.5 bg-zinc-100 rounded-xl flex items-center w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleModeChange('2d')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
              viewMode === '2d'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2D Lite Mode (No-Lag)</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('3d')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
              viewMode === '3d'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D WebGL Mode</span>
          </button>
        </div>
      </div>

      {/* Render selected viewport view */}
      {viewMode === '2d' ? (
        <Scene2D photoDataUrl={photoDataUrl} config={config} />
      ) : (
        <Suspense fallback={
          <div className="w-full h-[75vh] bg-zinc-100 rounded-2xl flex items-center justify-center border border-zinc-200/50 shadow-inner animate-pulse">
            <div className="flex flex-col items-center space-y-4 text-center p-6">
              <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-zinc-900 font-bold text-sm tracking-tight">Initializing standard 3D rendering elements...</p>
              <p className="text-zinc-500 text-xs max-w-xs leading-normal">
                Downloading WebGL shaders and physical mapping modules (~3MB). Please wait. Let's switch back to <strong>2D Lite Mode</strong> if it continues to load slowly.
              </p>
              <button
                type="button"
                onClick={() => handleModeChange('2d')}
                className="mt-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Switch to 2D Lite Mode
              </button>
            </div>
          </div>
        }>
          <Scene3D photoDataUrl={photoDataUrl} config={config} />
        </Suspense>
      )}
    </div>
  );
}
