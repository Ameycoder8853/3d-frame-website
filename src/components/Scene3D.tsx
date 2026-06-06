import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Maximize2, Minimize2 } from 'lucide-react';
import { FrameConfig, MiniPolaroid, RoseDecoration, CompartmentItem } from '../types';

interface Scene3DProps {
  photoDataUrl: string;
  config: FrameConfig;
}

// Robust texture loader with elegant fallback backup canvas texture
function useSafeTexture(url: string | null) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) return;
    let active = true;

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
      (err) => {
        console.warn("Could not load image texture, using elegant procedural backup canvas:", err);
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
        if (active) setTexture(fallbackTex);
      }
    );

    return () => {
      active = false;
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
  const color = style === 'white' ? '#fbfbfa' : style === 'black' ? '#141416' : '#573d26';
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
function AcrylicToken3D({ name, emoji, position, scale, rotation }: any) {
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

  const tokenBackMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.1,
    metalness: 0.05
  }), []);

  const shinyGoldBorderMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#cca43b', // luxurious shiny golden border trim
    roughness: 0.1,
    metalness: 0.85
  }), []);

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
        <meshStandardMaterial map={textTexture} transparent={false} roughness={0.15} metalness={0.05} />
      </mesh>
      
      {/* Clear reflective glass panel overlay */}
      <mesh position={[0, 0, 0.13]}>
        <boxGeometry args={[3.25, 3.25, 0.05]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          transparent={true}
          opacity={0.15}
          roughness={0.05}
        />
      </mesh>
    </group>
  );
}

// Highly realistic premium engraved brass plaque for frame events / occasions
function LuxuryOccasionPlaque({ text, y, displayW }: { text: string; y: number; displayW: number }) {
  const plaqueW = Math.max(2.4, Math.min(3.6, text.length * 0.15 + 0.6));

  const plaqueTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 1. Draw rich brushed brass/gold solid background gradient
      const grad = ctx.createLinearGradient(0, 0, 1024, 256);
      grad.addColorStop(0, '#cca43b');
      grad.addColorStop(0.2, '#f5e4a3');
      grad.addColorStop(0.5, '#dfba6b');
      grad.addColorStop(0.8, '#f5e4a3');
      grad.addColorStop(1, '#cca43b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 256);

      // 2. Elegantly engraved crisp dark inner border
      ctx.strokeStyle = '#4e370a';
      ctx.lineWidth = 12;
      ctx.strokeRect(20, 20, 984, 216);

      // 3. Draw premium elegant serif text
      ctx.font = 'bold 96px Georgia, "Playfair Display", "Times New Roman", serif';
      ctx.fillStyle = '#161005'; // Oxidation deep charcoal
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Embossed highlight engraving shadow
      ctx.shadowColor = '#ffffff';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 1;

      ctx.fillText(text.toUpperCase(), 512, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [text]);

  return (
    <group position={[0, y, 0.14]}>
      {/* Real dark wooden beveled backing trim behind brass plaque for stunning tactile layering */}
      <mesh position={[0, 0, -0.012]} castShadow>
        <boxGeometry args={[plaqueW + 0.14, 0.40, 0.04]} />
        <meshStandardMaterial color="#1a1008" roughness={0.85} />
      </mesh>

      {/* Main Solid Polished Brass Engraving Plate with integrated sharp vector text overlay */}
      <mesh position={[0, 0, 0.012]} castShadow receiveShadow>
        <boxGeometry args={[plaqueW, 0.32, 0.024]} />
        <meshStandardMaterial map={plaqueTexture} roughness={0.16} metalness={0.88} />
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
    <mesh position={[0, y, 0.021]} castShadow receiveShadow>
      <planeGeometry args={[plaqueW, 0.28]} />
      <meshStandardMaterial map={nicknameTexture} transparent={true} roughness={0.15} metalness={0.8} />
    </mesh>
  );
}

// Brilliant fairy lights strip lining top and sides inside the shadowbox
function FairyLightsChain({ outerW, outerH, rimDepth, ledColor }: { outerW: number, outerH: number, rimDepth: number, ledColor: string }) {
  const points = useMemo(() => {
    const list: [number, number, number][] = [];
    const step = 0.24; 
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
  }, [outerW, outerH, rimDepth]);

  return (
    <group>
      {points.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial color={ledColor} />
          </mesh>
          {i % 4 === 0 && (
            <pointLight
              color={ledColor}
              intensity={0.6}
              distance={1.4}
              decay={2}
              castShadow={false}
            />
          )}
        </group>
      ))}
    </group>
  );
}

// Elegant 3D Rose component
function Rose3D({ color, position, scale }: { color: string, position: [number, number, number], scale: number }) {
  const roseMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05,
  }), [color]);

  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2d5a27',
    roughness: 0.85,
  }), []);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[-0.14, -0.09, -0.05]} rotation={[0.1, 0.2, 0.5]}>
        <coneGeometry args={[0.07, 0.24, 4]} />
        <primitive object={leafMaterial} attach="material" />
      </mesh>
      <mesh position={[0.14, 0.09, -0.05]} rotation={[-0.1, -0.2, -0.5]}>
        <coneGeometry args={[0.07, 0.24, 4]} />
        <primitive object={leafMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <sphereGeometry args={[0.11, 10, 10]} />
        <primitive object={roseMaterial} attach="material" />
      </mesh>
    </group>
  );
}

// Double-layered glass frame elements
function Frame3D({ photoDataUrl, config }: { photoDataUrl: string, config: FrameConfig }) {
  const photoTexture = useSafeTexture(photoDataUrl);

  const outerW = 4.0;
  const outerH = 5.0; 
  const rimDepth = 1.1;
  const rimThickness = 0.22;

  const backingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.backgroundColor || '#faf7ec', 
    roughness: 0.95,
    metalness: 0.02,
  }), [config.backgroundColor]);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.99,
    transparent: true,
    opacity: 0.04, 
    ior: 1.1,
  }), []);

  const luxuryPlasterMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', 
    roughness: 0.45,
    metalness: 0.02,
  }), []);

  const brassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#cca43b', // golden brass
    roughness: 0.15,
    metalness: 0.9,
  }), []);

  const matteBlackAcrylicBaseMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#121213', 
    roughness: 0.25,
    metalness: 0.4,
  }), []);

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
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 4;

      ctx.fillText(celebrationHeader, 512, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [celebrationHeader]);

  return (
    <group>
      {/* Outer Protective wooden shadowbox frame */}
      <WoodenBoxFrame outerW={outerW} outerH={outerH} rimThickness={rimThickness} rimDepth={rimDepth} style={config.frameStyle} />

      {/* Textured Fabric Backboard Inside */}
      <mesh receiveShadow position={[0, 0, -rimDepth / 2 + 0.015]}>
        <boxGeometry args={[outerW, outerH, 0.02]} />
        <primitive object={backingMaterial} attach="material" />
      </mesh>

      {/* Fairy Lights looping the inside borders */}
      {(config.hasLedStrip || config.peripheral === 'led-strip') && (
        <FairyLightsChain outerW={outerW} outerH={outerH} rimDepth={rimDepth} ledColor={config.ledColor || '#ff9900'} />
      )}

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
            <torusGeometry args={[0.08, 0.02, 8, 24]} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
          <mesh position={[outerW * 0.35, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.08, 0.02, 8, 24]} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
          
          {/* Hanger golden chains linking to the wall hook */}
          {/* Left string chain */}
          <mesh position={[-outerW * 0.18, 0.45, -0.2]} rotation={[0, 0, -0.45]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.95]} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
          {/* Right string chain */}
          <mesh position={[outerW * 0.18, 0.45, -0.2]} rotation={[0, 0, 0.45]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.95]} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
          
          {/* Hanging wall bracket - luxurious seamless polished golden brass wall mount button cap */}
          <mesh position={[0, 0.85, -0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.85, -0.355]} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
        </group>
      )}

      {/* Main Single Photo Card - Massive centered focal print, beautifully mounted */}
      <group position={[0, -0.06, 0.1]} rotation={[0, -0.03, 0.01]}>
        {/* Ivory bevel mount backdrop frame - larger to serve as a gorgeous passe-partout border */}
        <mesh position={[0, 0, -0.015]} castShadow>
          <boxGeometry args={[displayW + 0.38, displayH + 1.25, 0.04]} />
          <primitive object={ luxuryPlasterMaterial } attach="material" />
        </mesh>
        
        {/* Photographic plate - positioned slightly up in the matte frame for a high-end designer layout */}
        <mesh key={photoTexture ? photoTexture.uuid : 'loading'} castShadow receiveShadow position={[0, 0.15, 0.035]}>
          <planeGeometry args={[displayW, displayH]} />
          {photoTexture ? (
            <meshStandardMaterial map={photoTexture} toneMapped={false} roughness={0.35} side={THREE.DoubleSide} />
          ) : (
            <meshStandardMaterial color="#faf6f0" roughness={0.5} side={THREE.DoubleSide} />
          )}
        </mesh>

        {/* Dynamic Photo Frame Integrated Typography - HAPPY BIRTHDAY / HAPPY ANNIVERSARY celebration text embossed on top border of frame */}
        {celebrationHeader && celebrationTexture && (
          <mesh position={[0, displayH / 2 + 0.38, 0.022]} castShadow receiveShadow>
            <planeGeometry args={[displayW + 0.3, 0.28]} />
            <meshStandardMaterial map={celebrationTexture} transparent={true} roughness={0.4} metalness={0.1} />
          </mesh>
        )}

        {/* INTEGRATED OCCASION BRASS PLAQUE MOUNTED DIRECTLY ON THE PHOTO FRAME BOTTOM BORDER */}
        {config.occasion && config.occasion.trim() !== '' && (
          <LuxuryOccasionPlaque text={config.occasion} y={0.15 - displayH / 2 - 0.24} displayW={displayW} />
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
        />
      ))}

      {/* Strictly requested roses ONLY if they directly typed blooms/roses, no unsolicited flowers */}
      {showRoses && config.roses && config.roses.map((rose) => (
         <Rose3D key={rose.id} color={rose.color} position={rose.position} scale={rose.scale} />
      ))}

      {/* Glass pane finish layer to catch elegant glares */}
      <mesh position={[0, 0, rimDepth / 2 - 0.015]}>
        <boxGeometry args={[outerW, outerH, 0.012]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
    </group>
  );
}

export default function Scene3D({ photoDataUrl, config }: Scene3DProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={
      isFullscreen 
        ? "fixed inset-0 z-50 bg-zinc-950 overflow-hidden cursor-grab active:cursor-grabbing flex flex-col h-screen w-screen"
        : "w-full h-[75vh] bg-[radial-gradient(circle_at_50%_35%,_#fbf9f6_0%,_#e6e1d6_60%,_#c2bbb0_100%)] rounded-3xl overflow-hidden shadow-2xl relative cursor-grab active:cursor-grabbing border border-zinc-200/40"
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

      <Canvas 
        shadows 
        camera={{ position: [0, 0, 5.0], fov: 48 }} 
        gl={{ 
          antialias: true, 
          toneMapping: THREE.ACESFilmicToneMapping, 
          toneMappingExposure: 1.1,
          alpha: true 
        }}
        className="z-10 relative"
      >
        {/* Direct Ambient baseline lighting fill */}
        <ambientLight intensity={0.4} />
        
        {/* Gallery Spotlighting casting elegant hard shadows */}
        <directionalLight 
          castShadow 
          position={[3.0, 4.5, 3.5]} 
          intensity={1.25} 
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.00015}
        />
        
        {/* Beautiful subtle filling flash from bottom-left room bounces */}
        <directionalLight 
          position={[-3, -3, 2]} 
          intensity={0.25} 
        />

        <OrbitControls 
          makeDefault 
          enableZoom={true} 
          enablePan={false} 
          minDistance={3.5} 
          maxDistance={8} 
        />

        <Suspense fallback={null}>
          <Environment preset="apartment" />
        </Suspense>

        {/* Tactile real physical exhibition background wall receiving the soft drop-shadow of the sway and orbit */}
        <mesh position={[0, 0, -1.8]} receiveShadow>
          <planeGeometry args={[18, 14]} />
          <meshStandardMaterial color="#f4f1e8" roughness={0.9} metalness={0.03} />
        </mesh>

        {/* Stable 3D placement at a classy starting angle */}
        <group rotation={[0.08, -0.22, 0]}>
          <Frame3D photoDataUrl={photoDataUrl} config={config} />
        </group>

        {/* Soft elegant floor placements shadow simulating hands hover distance */}
        <ContactShadows 
          position={[0, -2.55, 0]} 
          opacity={0.4} 
          scale={8.5} 
          blur={2.8} 
          far={5} 
          resolution={512} 
        />
      </Canvas>
      
      {/* Specifications Overlay Badge */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-zinc-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col pointer-events-none z-20">
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1.5">Exhibition Specification</span>
        <span className="text-sm font-semibold text-zinc-950 tracking-tight capitalize">{config.frameStyle} Shadowbox</span>
        <span className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full inline-block animate-pulse bg-emerald-500"></span>
          Warm lighting active
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
