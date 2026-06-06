import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Maximize2, Minimize2, Eye, Cpu, EyeOff, Sparkles, Sliders } from 'lucide-react';
import { FrameConfig, Decoration, RoseDecoration, MiniPolaroid, CompartmentItem } from '../types';

interface Scene2DProps {
  photoDataUrl: string;
  config: FrameConfig;
}

export default function Scene2D({ photoDataUrl, config }: Scene2DProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 6, y: -12 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentRot = useRef({ x: 6, y: -12 });

  // Handle Drag/Touch orbiting simulations
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    
    // We update rotation values within realistic ranges for premium presentation
    const nextX = Math.max(-20, Math.min(20, currentRot.current.x - dy * 0.45));
    const nextY = currentRot.current.y + dx * 0.45;
    
    setRotation({ x: nextX, y: nextY });
  };

  const handleEnd = () => {
    setIsDragging(false);
    currentRot.current = { x: rotation.x, y: rotation.y };
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isDragging) {
        handleEnd();
      }
    };
    window.addEventListener('mouseup', handleMouseUpGlobal);
    window.addEventListener('touchend', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('touchend', handleMouseUpGlobal);
    };
  }, [isDragging, rotation]);

  // Dimensions mapped from Scene3D
  const outerW = 3.6;
  const outerH = 4.8;

  // Convert exact 3D coordinates to responsive percentages
  const getPercentPosition = (pos?: [number, number, number]) => {
    if (!pos) return { left: '50%', top: '50%' };
    // Mapped percentage calculation
    const left = 50 + (pos[0] / outerW) * 85; 
    const top = 50 - (pos[1] / outerH) * 85;
    return {
      left: `${Math.max(5, Math.min(95, left))}%`,
      top: `${Math.max(5, Math.min(95, top))}%`
    };
  };

  // Frame outer border classes based on style preference
  const frameBorderClass = useMemo(() => {
    switch (config.frameStyle) {
      case 'black':
        return 'border-[20px] border-zinc-900 bg-zinc-950 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1),_0_20px_50px_rgba(0,0,0,0.6)]';
      case 'wood':
        return 'border-[20px] border-[#573d26] bg-[#3e2b1b] shadow-[inset_0_2px_10px_rgba(255,255,255,0.15),_0_25px_55px_rgba(0,0,0,0.5),_0_5px_15px_rgba(0,0,0,0.3)]';
      case 'white':
      default:
        return 'border-[20px] border-zinc-100 bg-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.05),_0_20px_50px_rgba(0,0,0,0.4)]';
    }
  }, [config.frameStyle]);

  // Occasion/Celebration Mapping
  const celebrationHeader = useMemo(() => {
    const raw = (config.occasion || '').trim();
    if (!raw) return '';
    const lower = raw.toLowerCase();
    
    if (lower.includes('birthday')) return 'HAPPY BIRTHDAY! 🎉';
    if (lower.includes('anniversary')) return 'HAPPY ANNIVERSARY! 💖';
    if (lower.includes('wedding')) return 'HAPPY WEDDING! 💍';
    if (lower.includes('marriage')) return 'HAPPY WEDDING DAY! 💍';
    if (lower.includes('love') || lower.includes('couple') || lower.includes('romance') || lower.includes('valentine')) return 'FOREVER TOGETHER 🌹';
    if (lower.includes('christmas')) return 'MERRY CHRISTMAS! 🎄';
    if (lower.includes('gradu')) return 'HAPPY GRADUATION! 🎓';
    if (lower.includes('congrat')) return 'CONGRATULATIONS! ✨';
    
    return raw.toUpperCase();
  }, [config.occasion]);

  // Check if we should render roses
  const showRoses = useMemo(() => {
    if (!config.likes) return false;
    const parsedLikes = config.likes.toLowerCase();
    const parsedOccasion = (config.occasion || '').toLowerCase();
    return (
      parsedLikes.includes('rose') || 
      parsedLikes.includes('flower') || 
      parsedLikes.includes('bloom') || 
      parsedLikes.includes('nature') || 
      parsedLikes.includes('garden') || 
      parsedLikes.includes('floral') ||
      parsedOccasion.includes('rose') ||
      parsedOccasion.includes('flower') ||
      parsedOccasion.includes('bloom')
    );
  }, [config.likes, config.occasion]);

  // Inset LED Background Lighting Glow Style
  const ledBackglowStyle = useMemo(() => {
    const color = config.ledColor || '#ffb347';
    if (!config.hasLedStrip && config.peripheral !== 'led-strip') return {};
    return {
      boxShadow: `inset 0 0 50px ${color}, inset 0 0 100px ${color}55, 0 0 30px ${color}33`,
    };
  }, [config.ledColor, config.hasLedStrip, config.peripheral]);

  return (
    <div className={
      isFullscreen 
        ? "fixed inset-0 z-50 bg-zinc-950 overflow-hidden flex flex-col h-screen w-screen justify-center items-center p-4 select-none touch-none"
        : "w-full h-[75vh] bg-[radial-gradient(circle_at_50%_35%,_#fbf9f6_0%,_#e6e1d6_60%,_#c2bbb0_100%)] rounded-3xl overflow-hidden shadow-2xl relative flex items-center justify-center border border-zinc-200/40 p-4 select-none"
    }>
      
      {/* Viewport Control Buttons */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-white/95 backdrop-blur-md hover:bg-white active:scale-95 text-zinc-900 px-4 py-2.5 rounded-2xl border border-zinc-200 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex items-center justify-center gap-2 font-medium text-xs transition-all cursor-pointer pointer-events-auto select-none"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}</span>
        </button>
      </div>

      {/* Specifications Overlay Badge */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-zinc-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col pointer-events-none z-20">
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1.5">MAPPED LITE LAYER</span>
        <span className="text-sm font-semibold text-zinc-950 tracking-tight capitalize">{config.frameStyle} Shadowbox (2D)</span>
        <span className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1.5 font-mono font-semibold">
          <span className="w-2 h-2 rounded-full inline-block animate-pulse bg-emerald-500"></span>
          60FPS NO-LAG ENGINE
        </span>
      </div>

      {/* Draggable Active Input Panel covering entire stage */}
      <div 
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
      />

      {/* 2D Shadowbox Container with Live CSS 3D perspectives */}
      <div 
        style={{
          transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.1, 0.8, 0.2, 1)',
        }}
        className={`w-full max-w-[340px] xs:max-w-[360px] aspect-[3.6/4.8] rounded-md relative flex items-center justify-center transition-transform duration-200 ease-out transform-gpu pointer-events-none z-20 ${frameBorderClass}`}
      >
        {/* Fabric Backboard inside frame */}
        <div 
          style={{
            backgroundColor: config.backgroundColor || '#fdf6e2',
            ...ledBackglowStyle
          }}
          className="absolute inset-0 rounded-sm overflow-hidden flex flex-col justify-between p-4 transition-colors duration-300"
        >
          {/* Subtle Fairy Lights Array on internal margins */}
          {(config.hasLedStrip || config.peripheral === 'led-strip') && (
            <div className="absolute inset-2 border border-dashed border-yellow-400/35 pointer-events-none rounded opacity-80 flex flex-wrap gap-x-8 gap-y-16 justify-around content-around pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <span 
                  key={i} 
                  style={{ backgroundColor: config.ledColor || '#ffb347', boxShadow: `0 0 12px ${config.ledColor || '#ffb347'}, 0 0 6px white` }}
                  className="w-1.5 h-1.5 rounded-full animate-pulse" 
                />
              ))}
            </div>
          )}

          {/* Central Layer Card - holding central Photo frame */}
          <div 
            style={{
              transform: 'translateZ(20px)',
              filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.18))'
            }}
            className="w-4/5 aspect-[3.2/3.8] bg-[#faf6f0] border border-zinc-200/30 rounded-lg mx-auto my-auto flex flex-col items-center justify-start p-3.5 relative shadow-md transform-gpu"
          >
            {/* Celebration Header on top mount bar */}
            {celebrationHeader && (
              <div 
                style={{ fontFamily: 'Georgia, serif', color: '#cca43b', textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.1)' }}
                className="text-[10px] sm:text-xs font-bold tracking-wider leading-none text-center mb-2 uppercase select-none"
              >
                {celebrationHeader}
              </div>
            )}

            {/* Photographic Plate crop window */}
            <div className="w-full flex-1 rounded overflow-hidden bg-zinc-100 shadow-inner flex items-center justify-center border border-zinc-200/50 relative">
              {photoDataUrl ? (
                <img 
                  src={photoDataUrl} 
                  alt="Diorama center" 
                  className="w-full h-full object-cover select-none pointer-events-none" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-zinc-400 text-xs text-center font-mono py-10">NO PHOTO</div>
              )}
            </div>

            {/* Bottom mounted details */}
            <div className="w-full mt-2 space-y-1.5 flex flex-col items-center">
              {/* Occasion Plaque */}
              {config.occasion && (
                <div 
                  style={{
                    background: 'linear-gradient(135deg, #dfba6b, #b58d3d, #dfba6b)',
                    fontFamily: 'serif',
                    color: '#161005',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15)'
                  }}
                  className="px-4 py-1.5 rounded border border-[#9b7625] text-[9px] font-bold text-center uppercase tracking-widest w-11/12 overflow-hidden truncate"
                >
                  {config.occasion}
                </div>
              )}

              {/* Nickname Plaque */}
              {config.nickname && (
                <div 
                  style={{
                    fontFamily: 'sans-serif',
                    color: '#e6bf5c',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8), 0 0 1px black'
                  }}
                  className="px-2 font-black text-xs text-center uppercase tracking-wider overflow-hidden truncate"
                >
                  {config.nickname}
                </div>
              )}
            </div>
          </div>

          {/* Floating Acrylic Ornament Tokens */}
          {config.decorations && config.decorations.map((dec) => {
            const pos = getPercentPosition(dec.position);
            return (
              <div
                key={dec.id}
                style={{
                  position: 'absolute',
                  left: pos.left,
                  top: pos.top,
                  transform: 'translate(-50%, -50%) translateZ(40px)',
                  filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.22))'
                }}
                className="w-12 h-12 bg-white/25 rounded-xl border border-white/45 backdrop-blur-[5px] flex flex-col items-center justify-center p-1 shadow-md hover:scale-110 active:scale-95 transition-all transform-gpu"
              >
                <span className="text-2xl leading-none">{dec.emoji}</span>
                <span className="text-[7px] font-bold text-zinc-950 font-sans tracking-wide uppercase leading-none mt-1 truncate max-w-full px-0.5">
                  {dec.name}
                </span>
              </div>
            );
          })}

          {/* Strict Corners Roses Rendering */}
          {showRoses && config.roses && (
            <>
              {/* Top-Left Cluster */}
              <div 
                style={{ transform: 'translateZ(10px)' }}
                className="absolute top-1 left-1 flex gap-0.5 transform-gpu"
              >
                <span className="text-2xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] animate-bounce duration-1000">🌹</span>
                <span className="text-xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] -translate-x-1.5 translate-y-1">🌸</span>
              </div>
              {/* Bottom-Right Cluster */}
              <div 
                style={{ transform: 'translateZ(10px)' }}
                className="absolute bottom-1 right-1 flex gap-0.5 flex-row-reverse transform-gpu"
              >
                <span className="text-2xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]">🌹</span>
                <span className="text-xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] translate-x-1.5 -translate-y-1">🌸</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Guide label */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-20">
        <div className="bg-zinc-950/95 text-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-[11px] shadow-[0_8px_24px_rgba(0,0,0,0.2)] font-medium border border-white/10 tracking-wider flex items-center gap-2">
          <span>DRAG OR ORBIT LITE FRAME IN REAL-TIME</span>
        </div>
      </div>
    </div>
  );
}
