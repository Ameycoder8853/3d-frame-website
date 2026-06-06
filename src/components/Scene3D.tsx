import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Maximize2, Minimize2, Camera, Check } from 'lucide-react';
import { FrameConfig, MiniPolaroid, RoseDecoration, CompartmentItem } from '../types';

interface Scene3DProps {
  photoDataUrl: string;
  config: FrameConfig;
}

// Basis Universal style off-thread texture decompressor preventing main-thread freezes on 4G connections
function useSafeTexture(url: string | null) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) return;
    let active = true;
    const abortController = new AbortController();

    async function loadCompressedTextureOffline() {
      try {
        let response: Response;
        
        // 1. Fetch image binary blocks as BLOB over 4G to start pipeline
        if (url.startsWith('data:')) {
          response = await fetch(url, { signal: abortController.signal });
        } else {
          // Standard CORS settings for outer images
          response = await fetch(url, { 
            signal: abortController.signal,
            mode: 'cors',
            credentials: 'omit'
          });
        }
        
        const blob = await response.blob();
        if (!active) return;

        // 2. Transcode/Decompress the JPEG/PNG off-thread using native WebGL Basis-equivalent decompressor (createImageBitmap).
        // To emulate Basis/KTX2 power-of-two block layout and prevent huge memory footprint,
        // we downsample the texture dimension bounds to dynamic optimized limits.
        const connection = (navigator as any).connection;
        const isSlowConn = connection && (connection.saveData || ['slow-2g', '2g', '3g'].includes(connection.effectiveType));
        const limitSize = isSlowConn ? 512 : 1024;

        let bitmap: ImageBitmap;
        // Check browser support for resize configuration
        try {
          bitmap = await createImageBitmap(blob, {
            resizeWidth: limitSize,
            resizeQuality: 'high'
          });
        } catch (bitmapResizeErr) {
          // Fallback to standard decode if resize option fails in some browser variants
          bitmap = await createImageBitmap(blob);
        }

        if (!active) {
          bitmap.close();
          return;
        }

        // 3. Generate high-performance WebGL Texture directly from decompressed ImageBitmap
        const tex = new THREE.Texture(bitmap);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.flipY = false; // Set to false to correctly orient ImageBitmap uploaded photos (preventing them from being upside-down by default)
        
        // Skip heavy synchronous CPU-bound mipmap calculations to achieve instant load
        tex.generateMipmaps = false; 
        tex.needsUpdate = true;

        if (active) {
          setTexture(tex);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn("Main thread fallback triggered. Falling back safely to progressive TextureLoader:", err);

        // Fallback gracefully to classic loader if fetch/ImageBitmap is restricted
        const loader = new THREE.TextureLoader();
        if (!url.startsWith('data:')) {
          loader.setCrossOrigin('anonymous');
        }

        loader.load(
          url,
          (tex) => {
            if (active) {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.minFilter = THREE.LinearFilter;
              tex.magFilter = THREE.LinearFilter;
              tex.needsUpdate = true;
              setTexture(tex);
            }
          },
          undefined,
          () => {
            if (!active) return;
            // Complete absolute recovery procedural backup canvas texture
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const grad = ctx.createLinearGradient(0, 0, 256, 256);
              grad.addColorStop(0, '#f5ebe0');
              grad.addColorStop(1, '#e3d5ca');
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, 256, 256);
              
              ctx.font = 'bold 16px sans-serif';
              ctx.fillStyle = '#655b4a';
              ctx.textAlign = 'center';
              ctx.fillText('DIORAMA ACTIVE', 128, 128);
            }
            const fallbackTex = new THREE.CanvasTexture(canvas);
            setTexture(fallbackTex);
          }
        );
      }
    }

    loadCompressedTextureOffline();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [url]);

  return texture;
}

// Biological micro-tremor and breathing posture float animation
function HandheldFloat({ children, speed = 1, rotationIntensity = 1, floatIntensity = 1, ...props }: any) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // 1. Posture micro-sway (simulates biological breathing/stabilizing)
    const breedHz = 0.52;
    const breatheAngleX = Math.sin(t * breedHz) * 0.045 * rotationIntensity;
    const breatheAngleY = Math.cos(t * breedHz * 0.85) * 0.04 * rotationIntensity;
    const breatheY = Math.sin(t * breedHz) * 0.04 * floatIntensity;

    // 2. Nervous muscle tremor (high frequency micro biological jitter)
    const tremorAngleX = Math.sin(t * 16.2) * 0.0022;
    const tremorAngleY = Math.cos(t * 14.4) * 0.0022;

    ref.current.rotation.x = breatheAngleX + tremorAngleX;
    ref.current.rotation.y = breatheAngleY + tremorAngleY;
    ref.current.position.y = breatheY + Math.sin(t * 12) * 0.0012;
    ref.current.position.x = Math.cos(t * breedHz * 0.4) * 0.015 + Math.sin(t * 15) * 0.0012;
  });
  return <group ref={ref} {...props}>{children}</group>;
}

// Deep white, black or timber shadowbox walls
function WoodenBoxFrame({ outerW, outerH, rimThickness, rimDepth, style }: { outerW: number, outerH: number, rimThickness: number, rimDepth: number, style: string }) {
  const color = style === 'white' ? '#ffffff' : style === 'black' ? '#141416' : '#573d26';
  const roughness = style === 'wood' ? 0.85 : 0.22;
  
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: style === 'black' ? 0.2 : 0.02,
  }), [color, roughness, style]);

  return (
    <group>
      {/* Top Wall */}
      <mesh castShadow receiveShadow position={[0, (outerH + rimThickness) / 2, 0]}>
        <boxGeometry args={[outerW + rimThickness * 2, rimThickness, rimDepth]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Bottom Wall */}
      <mesh castShadow receiveShadow position={[0, -(outerH + rimThickness) / 2, 0]}>
        <boxGeometry args={[outerW + rimThickness * 2, rimThickness, rimDepth]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Left Wall */}
      <mesh castShadow receiveShadow position={[-(outerW + rimThickness) / 2, 0, 0]}>
        <boxGeometry args={[rimThickness, outerH, rimDepth]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Right Wall */}
      <mesh castShadow receiveShadow position={[(outerW + rimThickness) / 2, 0, 0]}>
        <boxGeometry args={[rimThickness, outerH, rimDepth]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

// High-gloss double-layered custom acrylic token representing user's specific inputs
function AcrylicToken3D({ name, emoji, position, scale, rotation, isMobile, isInitialized }: any) {
  const normPosition = useMemo(() => {
    if (!position) return [0, 0, 0.1];
    return [position[0] * 0.9, position[1] * 0.9, Math.max(0.12, Math.min(position[2], 0.35))];
  }, [position]);

  const normScale = useMemo(() => {
    if (!scale) return [0.7, 0.7, 0.7];
    if (Array.isArray(scale)) return [scale[0] * 0.12, scale[1] * 0.12, 0.12];
    return [scale * 0.12, scale * 0.12, 0.12];
  }, [scale]);

  const normRotation = useMemo(() => {
    if (!rotation) return [0, 0, 0];
    return rotation;
  }, [rotation]);

  const useHighFidelity = isInitialized && !isMobile;

  const tokenBackMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: useHighFidelity ? 0.1 : 0.4,
    metalness: useHighFidelity ? 0.05 : 0.0
  }), [useHighFidelity]);

  const shinyGoldBorderMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#cca43b', // luxurious shiny golden border trim
    roughness: useHighFidelity ? 0.1 : 0.35,
    metalness: useHighFidelity ? 0.85 : 0.5
  }), [useHighFidelity]);

  const tokenGlassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: useHighFidelity ? 0.16 : 0.12,
      roughness: useHighFidelity ? 0.05 : 0.2,
      metalness: useHighFidelity ? 0.25 : 0.0,
      depthWrite: !useHighFidelity,
    });
  }, [useHighFidelity]);

  const textTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw solid crisp white background to prevent under-glare overlay bugs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 512);

      // Gold frame outer trim
      ctx.strokeStyle = '#cca43b';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 498, 498);

      // Draw Emoji
      ctx.font = '220px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji || '', 256, 180);
      
      // Draw Name label
      ctx.font = 'bold 38px "Inter", "Helvetica", "Arial", sans-serif';
      ctx.fillStyle = '#222222';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((name || '').toUpperCase(), 256, 380);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [name, emoji]);

  return (
    <group position={normPosition as [number, number, number]} rotation={normRotation as [number, number, number]} scale={normScale as [number, number, number]}>
      {/* Elegant shiny gold base border trim frame */}
      <mesh position={[0, 0, -0.012]} castShadow>
        <boxGeometry args={[3.4, 3.4, 0.08]} />
        <primitive object={shinyGoldBorderMaterial} attach="material" />
      </mesh>

      {/* 3D Acrylic backing sheet */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 3.2, 0.2]} />
        <primitive object={tokenBackMaterial} attach="material" />
      </mesh>

      {/* High-resolution printed custom graphics plate - elevated safely to prevent flat surface Z-fighting */}
      <mesh position={[0, 0, 0.12]} castShadow receiveShadow>
        <planeGeometry args={[3.1, 3.1]} />
        <meshBasicMaterial map={textTexture} transparent={false} />
      </mesh>
      
      {/* Clear reflective glass panel overlay */}
      <mesh position={[0, 0, 0.13]}>
        <boxGeometry args={[3.25, 3.25, 0.05]} />
        <primitive object={tokenGlassMaterial} attach="material" />
      </mesh>
    </group>
  );
}

// Highly realistic premium engraved brass plaque for frame events / occasions
function LuxuryOccasionPlaque({ text, y, displayW, isMobile, isInitialized }: { text: string; y: number; displayW: number; isMobile: boolean; isInitialized: boolean }) {
  const isLong = text.length > 20;
  const plaqueW = isLong 
    ? Math.max(3.8, Math.min(4.8, text.length * 0.08 + 1.2))
    : Math.max(2.4, Math.min(3.6, text.length * 0.15 + 0.6));
  const useHighFidelity = isInitialized && !isMobile;

  // 1. Brushed brass background texture
  const brassBgTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 512, 128);
      grad.addColorStop(0, '#cca43b');
      grad.addColorStop(0.2, '#f5e4a3');
      grad.addColorStop(0.5, '#dfba6b');
      grad.addColorStop(0.8, '#f5e4a3');
      grad.addColorStop(1, '#cca43b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, []);

  const brassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: brassBgTexture,
      roughness: useHighFidelity ? 0.16 : 0.35,
      metalness: useHighFidelity ? 0.88 : 0.6,
    });
  }, [brassBgTexture, useHighFidelity]);

  const backingMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1a1008',
      roughness: useHighFidelity ? 0.85 : 0.95,
      metalness: useHighFidelity ? 0.05 : 0.0
    });
  }, [useHighFidelity]);

  // 2. High-contrast transparent text texture (to be rendered with MeshBasicMaterial for lighting independence)
  const plaqueTextTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 1024, 256);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Elegantly engraved crisp dark inner border
      ctx.strokeStyle = '#3d2b07';
      ctx.lineWidth = 14;
      ctx.strokeRect(18, 18, 988, 220);

      // Choose font style and draw premium elegant serif text
      ctx.fillStyle = '#110c03'; // Deep charcoal/black for outstanding contrast
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Embossed physical raised highlight shadow (pre-baked)
      ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 1;

      if (isLong) {
        ctx.font = 'italic 52px Georgia, "Playfair Display", "Times New Roman", serif';
        // Auto wrap into two lines if it's very long (e.g. > 40 characters)
        if (text.length > 35) {
          ctx.font = 'italic 44px Georgia, "Playfair Display", "Times New Roman", serif';
          const words = text.split(' ');
          let line1 = '';
          let line2 = '';
          let mid = Math.floor(words.length / 2);
          for (let i = 0; i < words.length; i++) {
            if (i < mid) {
              line1 += (line1 ? ' ' : '') + words[i];
            } else {
              line2 += (line2 ? ' ' : '') + words[i];
            }
          }
          ctx.fillText(line1, 512, 94);
          ctx.fillText(line2, 512, 162);
        } else {
          ctx.fillText(text, 512, 128);
        }
      } else {
        ctx.font = 'bold 90px Georgia, "Playfair Display", "Times New Roman", serif';
        ctx.fillText(text.toUpperCase(), 512, 128);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [text, isLong]);

  return (
    <group position={[0, y, 0.14]}>
      {/* Real dark wooden beveled backing trim behind brass plaque for stunning tactile layering */}
      <mesh position={[0, 0, -0.012]} castShadow>
        <boxGeometry args={[plaqueW + 0.14, 0.40, 0.04]} />
        <primitive object={backingMaterial} attach="material" />
      </mesh>

      {/* Main Solid Polished Brass Engraving Plate */}
      <mesh position={[0, 0, 0.012]} castShadow receiveShadow>
        <boxGeometry args={[plaqueW, 0.32, 0.024]} />
        <primitive object={brassMaterial} attach="material" />
      </mesh>

      {/* Independent crisp text rendering overlay using MeshBasicMaterial to make it lighting-independent */}
      <mesh position={[0, 0, 0.026]} castShadow={false} receiveShadow={false}>
        <planeGeometry args={[plaqueW - 0.04, 0.28]} />
        <meshBasicMaterial map={plaqueTextTexture} transparent={true} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Highly realistic premium gold embossed lettering for nicknames - matches 2D text styling
function LuxuryNicknamePlaque({ text, y }: { text: string; y: number }) {
  const plaqueW = Math.max(1.8, Math.min(3.2, text.length * 0.12 + 0.6));

  const nicknameTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128; // aspect ratio 8:1
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 1024, 128);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Elegant sans-serif/Inter font matching 2D perfectly
      ctx.font = 'bold 84px "Inter", "Helvetica", sans-serif';
      ctx.fillStyle = '#e6bf5c'; // premium gold leaf look
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Drop pop/highlight raised shadows
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.shadowBlur = 4;

      // Draw crisp dark outline to pop out on light backgrounds
      ctx.strokeStyle = 'rgba(10, 10, 11, 0.85)';
      ctx.lineWidth = 4;
      ctx.strokeText(text.toUpperCase(), 512, 64);

      ctx.fillText(text.toUpperCase(), 512, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [text]);

  return (
    // Positioned at Z = 0.021 to sit perfectly on top of the white mount frame (Z = 0.005)
    <mesh position={[0, y, 0.021]} castShadow={false} receiveShadow={false}>
      <planeGeometry args={[plaqueW, 0.28]} />
      <meshBasicMaterial 
        map={nicknameTexture} 
        transparent={true} 
        depthWrite={false} 
      />
    </mesh>
  );
}

// Brilliant fairy lights strip lining top and sides inside the shadowbox
function FairyLightsChain({ outerW, outerH, rimDepth, ledColor, isMobile }: { outerW: number, outerH: number, rimDepth: number, ledColor: string, isMobile: boolean }) {
  const points = useMemo(() => {
    const list: [number, number, number][] = [];
    // Lower point count dynamically on mobile viewport to save drawing cycle load
    const step = isMobile ? 0.48 : 0.24; 
    const z = rimDepth / 2 - 0.18; 
    const yTop = outerH / 2 - 0.12;
    const xBorder = outerW / 2 - 0.14;

    for (let y = -yTop; y <= yTop; y += step) {
      list.push([-xBorder, y, z]);
    }
    for (let x = -xBorder + step; x < xBorder; x += step) {
      list.push([x, yTop, z]);
    }
    for (let y = yTop; y >= -yTop; y -= step) {
      list.push([xBorder, y, z]);
    }
    return list;
  }, [outerW, outerH, rimDepth, isMobile]);

  return (
    <group>
      {points.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.022, isMobile ? 4 : 8, isMobile ? 4 : 8]} />
            <meshStandardMaterial 
              color={ledColor} 
              emissive={ledColor} 
              emissiveIntensity={0.8} // Dimmed emissive for a subtle, natural bioluminescent or neon vibe
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Elegant 3D Rose component
function Rose3D({ color, position, scale, isMobile }: { color: string, position: [number, number, number], scale: number, isMobile: boolean }) {
  const roseMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05,
  }), [color]);

  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2d5a27',
    roughness: 0.85,
  }), []);

  // Reduce vertex segments dynamically on mobile viewports for smooth interactions
  const sphereSegments = isMobile ? 4 : 10;
  const coneSegments = isMobile ? 3 : 4;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[-0.14, -0.09, -0.05]} rotation={[0.1, 0.2, 0.5]}>
        <coneGeometry args={[0.07, 0.24, coneSegments]} />
        <primitive object={leafMaterial} attach="material" />
      </mesh>
      <mesh position={[0.14, 0.09, -0.05]} rotation={[-0.1, -0.2, -0.5]}>
        <coneGeometry args={[0.07, 0.24, coneSegments]} />
        <primitive object={leafMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <sphereGeometry args={[0.11, sphereSegments, sphereSegments]} />
        <primitive object={roseMaterial} attach="material" />
      </mesh>
    </group>
  );
}

// Border light maala draping string lights along the inner borders
function BorderLightMaala() {
  const beads = useMemo(() => {
    const list: [number, number, number][] = [];
    const w = 1.68; // inner width boundary
    const h = 2.18; // inner height boundary
    const z = 0.28; // set forward in the box depth
    
    // Top border (left to right) - draped with sine wave
    const topCount = 11;
    for (let i = 0; i <= topCount; i++) {
      const t = i / topCount;
      const x = -w + t * (w * 2);
      const y = h - 0.04 - 0.08 * Math.sin(t * Math.PI);
      list.push([x, y, z]);
    }
    
    // Right border (top to bottom) - draped with sine wave
    const rightCount = 13;
    for (let i = 1; i <= rightCount; i++) {
      const t = i / rightCount;
      const y = h - t * (h * 2);
      const x = w - 0.04 - 0.08 * Math.sin(t * Math.PI);
      list.push([x, y, z]);
    }
    
    // Bottom border (right to left) - draped with sine wave
    const bottomCount = 11;
    for (let i = 1; i <= bottomCount; i++) {
      const t = i / bottomCount;
      const x = w - t * (w * 2);
      const y = -h + 0.04 + 0.08 * Math.sin(t * Math.PI);
      list.push([x, y, z]);
    }
    
    // Left border (bottom to top) - draped with sine wave
    const leftCount = 12;
    for (let i = 1; i < leftCount; i++) {
      const t = i / leftCount;
      const y = -h + t * (h * 2);
      const x = -w + 0.04 + 0.08 * Math.sin(t * Math.PI);
      list.push([x, y, z]);
    }
    
    return list;
  }, []);

  return (
    <group>
      {/* Small warm local pointlights around corner regions to illuminate frame elegantly */}
      <pointLight position={[-1.3, 1.8, 0.4]} intensity={0.12} distance={2.0} decay={2.0} color="#ffb347" />
      <pointLight position={[1.3, 1.8, 0.4]} intensity={0.12} distance={2.0} decay={2.0} color="#ffb347" />
      <pointLight position={[-1.3, -1.8, 0.4]} intensity={0.12} distance={2.0} decay={2.0} color="#ffb347" />
      <pointLight position={[1.3, -1.8, 0.4]} intensity={0.12} distance={2.0} decay={2.0} color="#ffb347" />
      
      {/* Render actual miniature glowing beads */}
      {beads.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.038, 8, 8]} />
          <meshStandardMaterial 
            color="#ffeab3" 
            emissive="#ff9400" 
            emissiveIntensity={4.5}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// Double-layered glass frame elements
function Frame3D({ photoDataUrl, config, isMobile, isInitialized }: { photoDataUrl: string, config: FrameConfig, isMobile: boolean, isInitialized: boolean }) {
  const photoTexture = useSafeTexture(photoDataUrl);

  useEffect(() => {
    if (photoTexture) {
      photoTexture.center.set(0.5, 0.5);
      const rot = config.photoRotation ?? 0;
      photoTexture.rotation = (rot * Math.PI) / 90;
      
      const scaleX = config.photoFlipH ? -1 : 1;
      const scaleY = config.photoFlipV ? -1 : 1;
      photoTexture.repeat.set(scaleX, scaleY);
      
      photoTexture.wrapS = THREE.RepeatWrapping;
      photoTexture.wrapT = THREE.RepeatWrapping;
      photoTexture.needsUpdate = true;
    }
  }, [photoTexture, config.photoRotation, config.photoFlipV, config.photoFlipH]);

  const outerW = 4.0;
  const outerH = 5.0; 
  const rimDepth = 1.1;
  const rimThickness = 0.22;

  const useHighFidelity = isInitialized && !isMobile;

  const backingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.backgroundColor || '#faf7ec', 
    roughness: useHighFidelity ? 0.95 : 0.8,
    metalness: useHighFidelity ? 0.02 : 0.0,
  }), [config.backgroundColor, useHighFidelity]);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: useHighFidelity ? 0.05 : 0.2,
      metalness: useHighFidelity ? 0.15 : 0.0,
      transparent: true,
      opacity: useHighFidelity ? 0.06 : 0.08,
      depthWrite: !useHighFidelity,
    });
  }, [useHighFidelity]);

  const luxuryPlasterMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', 
    roughness: useHighFidelity ? 0.45 : 0.6,
    metalness: useHighFidelity ? 0.02 : 0.0,
  }), [useHighFidelity]);

  const brassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#cca43b', // golden brass
    roughness: useHighFidelity ? 0.15 : 0.35,
    metalness: useHighFidelity ? 0.9 : 0.5,
  }), [useHighFidelity]);

  const matteBlackAcrylicBaseMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#121213', 
    roughness: useHighFidelity ? 0.25 : 0.4,
    metalness: useHighFidelity ? 0.4 : 0.1,
  }), [useHighFidelity]);

  const displayW = useMemo(() => {
    const aspect = config.photoAspect || 1;
    if (aspect > 1) {
      return 2.5; 
    } else {
      return Math.min(2.1, 2.3 * aspect);
    }
  }, [config.photoAspect]);

  const displayH = useMemo(() => {
    const aspect = config.photoAspect || 1;
    if (aspect > 1) {
      return Math.min(2.1, 2.5 / aspect);
    } else {
      return 2.2;
    }
  }, [config.photoAspect]);

  // Evaluated constraint checks: ONLY show roses, niches, or folders if the user explicitly typed related words
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

  // Exquisite dynamic golden celebration header phrase mapping
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

  // Dynamic Canvas-based texture for celebration header
  const celebrationTexture = useMemo(() => {
    if (!celebrationHeader) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 1024, 128);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Beautiful elegant classic font styling - larger for excellent readability!
      ctx.font = 'bold 80px Georgia, "Playfair Display", serif';
      ctx.fillStyle = '#cca43b'; // luxury gold leaf color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Embossed physical raised drop shadow to pop out on the white plaster card background
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.shadowBlur = 4;

      // Draw subtle elegant dark outline for crisp readability
      ctx.strokeStyle = 'rgba(16, 12, 5, 0.9)';
      ctx.lineWidth = 4;
      ctx.strokeText(celebrationHeader, 512, 64);

      ctx.fillText(celebrationHeader, 512, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [celebrationHeader]);

  // Low Polygon segments variables
  const loopTorusArgs = isMobile ? [0.08, 0.02, 4, 8] : [0.08, 0.02, 8, 24];
  const cylinderArgs = isMobile ? [0.015, 0.015, 0.95, 5] : [0.015, 0.015, 0.95, 12];
  const hookCylinderArgs = isMobile ? [0.08, 0.08, 0.05, 12] : [0.08, 0.08, 0.05, 32];
  const hookSphereArgs = isMobile ? [0.08, 6, 6] : [0.08, 16, 16];

  return (
    <group>
      {/* Outer Protective wooden shadowbox frame */}
      <WoodenBoxFrame outerW={outerW} outerH={outerH} rimThickness={rimThickness} rimDepth={rimDepth} style={config.frameStyle} />

      {/* Textured Fabric Backboard Inside */}
      <mesh receiveShadow position={[0, 0, -rimDepth / 2 + 0.015]}>
        <boxGeometry args={[outerW, outerH, 0.02]} />
        <primitive object={backingMaterial} attach="material" />
      </mesh>

      {/* Hidden ambient fairy lights (removed) */}

      {/* 3D Acrylic Standee Base Peripheral holding the frame */}
      {config.peripheral === 'standee' && (
        <group position={[0, -outerH / 2 - rimThickness / 2, 0]}>
          {/* Main solid desk stand cradle */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[outerW * 0.72, 0.12, 1.3]} />
            <primitive object={matteBlackAcrylicBaseMaterial} attach="material" />
          </mesh>
          {/* Back support ledge */}
          <mesh position={[0, 0.15, -0.45]} castShadow>
            <boxGeometry args={[outerW * 0.72, 0.22, 0.2]} />
            <primitive object={matteBlackAcrylicBaseMaterial} attach="material" />
          </mesh>
          {/* Front support lips to cradle the frame */}
          <mesh position={[0, 0.1, 0.45]} castShadow>
            <boxGeometry args={[outerW * 0.72, 0.1, 0.15]} />
            <primitive object={matteBlackAcrylicBaseMaterial} attach="material" />
          </mesh>
        </group>
      )}

      {/* Vintage Golden Brass Hanger Chain Peripheral */}
      {config.peripheral === 'hanging-chain' && (
        <group position={[0, outerH / 2 + rimThickness / 2, 0]}>
          {/* Top bracket anchor loops on left and right sides of top rim */}
          <mesh position={[-outerW * 0.35, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={loopTorusArgs as any} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
          <mesh position={[outerW * 0.35, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={loopTorusArgs as any} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
          
          {/* Hanger golden chains linking to the wall hook */}
          {/* Left string chain */}
          <mesh position={[-outerW * 0.18, 0.45, -0.2]} rotation={[0, 0, -0.45]} castShadow>
            <cylinderGeometry args={cylinderArgs as any} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
          {/* Right string chain */}
          <mesh position={[outerW * 0.18, 0.45, -0.2]} rotation={[0, 0, 0.45]} castShadow>
            <cylinderGeometry args={cylinderArgs as any} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
          
          {/* Hanging wall bracket - luxurious seamless polished golden brass wall mount button cap */}
          <mesh position={[0, 0.85, -0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={hookCylinderArgs as any} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.85, -0.355]} castShadow>
            <sphereGeometry args={hookSphereArgs as any} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
        </group>
      )}

      {/* Main Single Photo Card - Massive centered focal print, beautifully mounted */}
      <group position={[0, -0.06, 0.1]} rotation={[0, 0, 0]}>
        {/* Ivory bevel mount backdrop frame - larger to serve as a gorgeous passe-partout border */}
        <mesh position={[0, 0, -0.015]} castShadow>
          <boxGeometry args={[displayW + 0.38, displayH + 1.25, 0.04]} />
          <primitive object={ luxuryPlasterMaterial } attach="material" />
        </mesh>
        
        {/* Photographic plate - positioned slightly up in the matte frame for a high-end designer layout */}
        <mesh key={photoTexture ? photoTexture.uuid : 'loading'} castShadow receiveShadow position={[0, 0.15, 0.035]}>
          <planeGeometry args={[displayW, displayH]} />
          {photoTexture ? (
            <meshStandardMaterial map={photoTexture} toneMapped={true} roughness={0.35} side={THREE.DoubleSide} />
          ) : (
            <meshStandardMaterial color="#faf6f0" roughness={0.5} side={THREE.DoubleSide} />
          )}
        </mesh>

        {/* Dynamic Photo Frame Integrated Typography - HAPPY BIRTHDAY / HAPPY ANNIVERSARY celebration text embossed on top border of frame */}
        {celebrationHeader && celebrationTexture && (
          <mesh position={[0, displayH / 2 + 0.38, 0.022]} castShadow={false} receiveShadow={false}>
            <planeGeometry args={[displayW + 0.3, 0.28]} />
            <meshBasicMaterial 
              map={celebrationTexture} 
              transparent={true} 
              depthWrite={false} 
            />
          </mesh>
        )}

        {/* INTEGRATED CUSTOM QUOTE ENGRAVED BRASS PLAQUE MOUNTED DIRECTLY ON THE BOTTOM BORDER */}
        {(config.quote || config.occasion) && (config.quote || config.occasion).trim() !== '' && (
          <LuxuryOccasionPlaque text={config.quote || config.occasion} y={0.15 - displayH / 2 - 0.24} displayW={displayW} isMobile={isMobile} isInitialized={isInitialized} />
        )}

        {/* INTEGRATED NICKNAME PLAQUE MOUNTED DIRECTLY ON THE BOTTOM OF THE MAIN PHOTO FRAME */}
        {config.nickname && config.nickname.trim() !== '' && (
          <LuxuryNicknamePlaque text={config.nickname} y={0.15 - displayH / 2 - 0.56} />
        )}
      </group>

      {/* EXQUISITE STRICT CUSTOM INPUT RENDERING: Render actual acrylic decor tokens based directly on user's like fields */}
      {config.decorations && config.decorations.map((dec) => (
        <AcrylicToken3D 
          key={dec.id} 
          name={dec.name} 
          emoji={dec.emoji} 
          position={dec.position} 
          scale={dec.scale} 
          rotation={dec.rotation} 
          isMobile={isMobile}
          isInitialized={isInitialized}
        />
      ))}

      {/* Strictly requested roses ONLY if they directly typed blooms/roses, no unsolicited flowers */}
      {showRoses && config.roses && config.roses.map((rose) => (
         <Rose3D key={rose.id} color={rose.color} position={rose.position} scale={rose.scale} isMobile={isMobile} />
      ))}

      {/* Always-On Elegant Ambient Indian Border Light Maala Series */}
      <BorderLightMaala />

      {/* Glass pane finish layer to catch elegant glares */}
      <mesh position={[0, 0, rimDepth / 2 - 0.015]}>
        <boxGeometry args={[outerW, outerH, 0.012]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
    </group>
  );
}

export default function Scene3D({ photoDataUrl, config }: Scene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'success'>('idle');

  useEffect(() => {
    const handleResize = () => {
      // Keep isMobile false always to disable the viewport optimizations that degraded rendering quality
      // (like turning off antialiasing, reducing shader precision to mediump, and disabling shadows)
      setIsMobile(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Dynamic initialization window: starts in simple proxy mode or low-density geometries,
    // then promotes to high-fidelity materials once the WebGL context is warm
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleCaptureSnapshot = () => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.querySelector('canvas');
    if (!canvas) return;

    setCaptureStatus('capturing');

    // Small delay to let the UI update and draw beautifully before extraction
    setTimeout(() => {
      try {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        const occasionName = config.occasion ? config.occasion.toLowerCase().replace(/[^a-z0-9_-]/g, '_') : 'custom';
        link.download = `shadowbox_${occasionName}_snapshot.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setCaptureStatus('success');
        setTimeout(() => {
          setCaptureStatus('idle');
        }, 1800);
      } catch (err) {
        console.error("Failed to capture 2D snapshot:", err);
        setCaptureStatus('idle');
      }
    }, 350);
  };

  return (
    <div 
      ref={containerRef}
      className={
        isFullscreen 
          ? "fixed inset-0 z-50 bg-zinc-950 overflow-hidden cursor-grab active:cursor-grabbing flex flex-col h-screen w-screen"
          : "w-full h-[75vh] bg-white rounded-3xl overflow-hidden shadow-2xl relative cursor-grab active:cursor-grabbing border border-zinc-200/40"
      }
    >
      
      {/* Viewport Control Buttons */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={handleCaptureSnapshot}
          disabled={captureStatus === 'capturing'}
          className={`${
            captureStatus === 'success'
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500'
              : 'bg-white/95 text-zinc-900 border-zinc-200 hover:bg-white active:scale-95'
          } backdrop-blur-md px-4 py-2.5 rounded-2xl border shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex items-center justify-center gap-2 font-medium text-xs transition-all cursor-pointer pointer-events-auto select-none`}
        >
          {captureStatus === 'capturing' && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {captureStatus === 'idle' && <Camera className="w-4 h-4 text-zinc-700" />}
          {captureStatus === 'success' && <Check className="w-4 h-4 text-white" />}
          
          <span>
            {captureStatus === 'capturing' 
              ? "Capturing..." 
              : captureStatus === 'success' 
                ? "Snapshot Saved!" 
                : "Capture 2D Snapshot"
            }
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-white/95 backdrop-blur-md hover:bg-white active:scale-95 text-zinc-900 px-4 py-2.5 rounded-2xl border border-zinc-200 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex items-center justify-center gap-2 font-medium text-xs transition-all cursor-pointer pointer-events-auto select-none"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}</span>
        </button>
      </div>

      <Canvas 
        shadows={!isMobile} 
        camera={{ position: [0, 0, 5.0], fov: 48 }} 
               gl={{ 
          antialias: !isMobile, 
          precision: isMobile ? 'mediump' : 'highp',
          toneMapping: THREE.ACESFilmicToneMapping, 
          toneMappingExposure: 0.16, // Lowered exposure significantly to reduce over-brightness
          alpha: true,
          preserveDrawingBuffer: true
        }}
        className="z-10 relative"
      >
        {/* Direct Ambient baseline lighting fill */}
        <ambientLight intensity={0.015} /> {/* Reduced from 0.03 for standard dark-room elegance */}
        
        {/* Gallery Spotlighting casting elegant hard shadows */}
        <directionalLight 
          castShadow={!isMobile} 
          position={[3.0, 4.5, 3.5]} 
          intensity={0.06} // Reduced intensity from 0.20 to prevent washed-out look
          shadow-mapSize={isMobile ? [512, 512] : [2048, 2048]}
          shadow-bias={-0.00015}
        />
        
        {/* Beautiful subtle filling flash from bottom-left room bounces */}
        <directionalLight 
          position={[-3, -3, 2]} 
          intensity={0.01} // Softened back/bounce light
        />

        {/* Front-facing head-on soft key fill light specifically to keep text elements, titles, and nickname plates illuminated at any angle */}
        <directionalLight 
          position={[0, 0, 5.0]} 
          intensity={0.015} // Low key fill instead of harsh highlight
          castShadow={false}
        />

        <OrbitControls 
          makeDefault 
          enableZoom={true} 
          enablePan={false} 
          minDistance={3.5} 
          maxDistance={8} 
        />

        <Suspense fallback={null}>
          {/* Static HDRI environment lookup to achieve extremely elegant, crisp physical lighting */}
          <Environment preset="apartment" environmentIntensity={0.15} />
        </Suspense>

        {/* Tactile real physical exhibition background wall receiving the soft drop-shadow of the sway and orbit */}
        <mesh position={[0, 0, -1.8]} receiveShadow={!isMobile}>
          <planeGeometry args={[18, 14]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.03} />
        </mesh>

        {/* Stable 3D placement at a classy starting angle */}
        <group rotation={[0, 0, 0]}>
          <Frame3D 
            photoDataUrl={photoDataUrl} 
            config={config} 
            isMobile={isMobile} 
            isInitialized={isInitialized} 
          />
        </group>

        {/* Soft elegant floor placements shadow simulating hands hover distance - optimized layout for mobile devices */}
        {!isMobile && (
          <ContactShadows 
            position={[0, -2.55, 0]} 
            opacity={0.4} 
            scale={8.5} 
            blur={2.8} 
            far={5} 
            resolution={256} 
          />
        )}

        {/* Cinematic high-end Bloom post-processing to make sunset fairylights warm and atmospheric */}
        <EffectComposer enableNormalPass={false}>
          <Bloom 
            luminanceThreshold={0.95} 
            luminanceSmoothing={0.85} 
            intensity={0.08} // Subdued bloom to let colors look highly saturated and not washed out
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
      
      {/* Specifications Overlay Badge */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-zinc-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col pointer-events-none z-20">
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1.5 font-mono">Exhibition Specification</span>
        <span className="text-sm font-semibold text-zinc-950 tracking-tight capitalize">{config.frameStyle} Shadowbox</span>
        <span className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5 font-mono">
          <span className={`w-2 h-2 rounded-full inline-block ${!isInitialized ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
          {!isInitialized 
            ? "Initializing proxy model..." 
            : isMobile 
              ? "Mobilized viewport optimization active" 
              : "High-fidelity virtual diorama ready"
          }
        </span>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-20">
        <div className="bg-zinc-950/95 text-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-[11px] shadow-[0_8px_24px_rgba(0,0,0,0.2)] font-medium border border-white/10 tracking-wider flex items-center gap-2">
          <span>INTERACTIVE 360° 3D PREVIEW (DRAG TO ROTATE)</span>
        </div>
      </div>
    </div>
  );
}
