import { FrameConfig, Decoration, TextElement, RoseDecoration, MiniPolaroid, CompartmentItem } from '../types';

export function generateProceduralFrame(
  occasion: string,
  nickname: string,
  likes: string,
  bgColor: string,
  photoBase64: string,
  aspectRatio: number,
  peripheral: string = 'standee'
): FrameConfig {
  const background = bgColor || '#fdf6e2'; // warm gold/ivory parchment
  const parsedLikes = (likes || '').toLowerCase();
  const ledColor = '#ffb347'; // gorgeous warm sunset glow
  
  const photoPosition: [number, number, number] = [0, -0.2, 0.1];
  const photoScale: [number, number, number] = [1.8, 2.2, 1];
  
  const miniPolaroids: MiniPolaroid[] = [];
  const roses: RoseDecoration[] = [];
  const compartments: CompartmentItem[] = [];
  const decorations: Decoration[] = [];

  // Parse custom interactive likes themes and populate amazing 3D design tokens
  if (parsedLikes.includes('space') || parsedLikes.includes('star') || parsedLikes.includes('sky') || parsedLikes.includes('galaxy') || parsedLikes.includes('cosmo')) {
    decorations.push(
      { id: 'dec-p1', name: 'Retro Rocket', emoji: '🚀', position: [-1.4, 0.4, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, 0.25] },
      { id: 'dec-p2', name: 'Saturn Plate', emoji: '🪐', position: [1.4, 0.5, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, -0.15] },
      { id: 'dec-p3', name: 'North Star', emoji: '🌟', position: [-1.3, -1.0, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, 0.1] },
      { id: 'dec-p4', name: 'Cosmo Cadet', emoji: '🧑‍🚀', position: [1.3, -0.9, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, -0.05] }
    );
  } else if (parsedLikes.includes('ocean') || parsedLikes.includes('sea') || parsedLikes.includes('beach') || parsedLikes.includes('water') || parsedLikes.includes('fish') || parsedLikes.includes('marine')) {
    decorations.push(
      { id: 'dec-p1', name: 'Conch Shell', emoji: '🐚', position: [-1.4, 0.4, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, 0.15] },
      { id: 'dec-p2', name: 'Sailboat', emoji: '⛵', position: [1.4, 0.5, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, -0.1] },
      { id: 'dec-p3', name: 'Dolphin Badge', emoji: '🐬', position: [-1.3, -1.0, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, 0.05] },
      { id: 'dec-p4', name: 'Wave Charm', emoji: '🌊', position: [1.3, -0.9, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, -0.08] }
    );
  } else if (parsedLikes.includes('vintage') || parsedLikes.includes('classic') || parsedLikes.includes('retro') || parsedLikes.includes('old') || parsedLikes.includes('antique') || parsedLikes.includes('camera')) {
    decorations.push(
      { id: 'dec-p1', name: 'Retro Radio', emoji: '📻', position: [-1.4, 0.4, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, 0.2] },
      { id: 'dec-p2', name: 'Classic Camera', emoji: '📷', position: [1.4, 0.5, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, -0.1] },
      { id: 'dec-p3', name: 'Hourglass', emoji: '⏳', position: [-1.3, -1.0, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, 0] },
      { id: 'dec-p4', name: 'Gold Key', emoji: '🔑', position: [1.3, -0.9, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, -0.15] }
    );
  } else if (parsedLikes.includes('music') || parsedLikes.includes('song') || parsedLikes.includes('melody') || parsedLikes.includes('sing') || parsedLikes.includes('tune') || parsedLikes.includes('concert') || parsedLikes.includes('band')) {
    decorations.push(
      { id: 'dec-p1', name: 'Vinyl Disk', emoji: '🎚️', position: [-1.4, 0.4, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, 0.1] },
      { id: 'dec-p2', name: 'Golden Mic', emoji: '🎙️', position: [1.4, 0.5, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, -0.2] },
      { id: 'dec-p3', name: 'Treble Clef', emoji: '🎵', position: [-1.3, -1.0, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, 0.15] },
      { id: 'dec-p4', name: 'Headset Pin', emoji: '🎧', position: [1.3, -0.9, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, -0.05] }
    );
  } else if (parsedLikes.includes('nature') || parsedLikes.includes('garden') || parsedLikes.includes('plant') || parsedLikes.includes('tree') || parsedLikes.includes('leaf') || parsedLikes.includes('floral') || parsedLikes.includes('wood')) {
    decorations.push(
      { id: 'dec-p1', name: 'Leaf Vine', emoji: '🌿', position: [-1.4, 0.4, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, 0.3] },
      { id: 'dec-p2', name: 'Lotus Badge', emoji: '🪷', position: [1.4, 0.5, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, -0.1] },
      { id: 'dec-p3', name: 'Magic Shroom', emoji: '🍄', position: [-1.3, -1.0, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, 0.2] },
      { id: 'dec-p4', name: 'Clover Shield', emoji: '🍀', position: [1.3, -0.9, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, -0.15] }
    );
  } else if (parsedLikes.includes('love') || parsedLikes.includes('couple') || parsedLikes.includes('romance') || parsedLikes.includes('heart') || parsedLikes.includes('together') || parsedLikes.includes('anniversary')) {
    decorations.push(
      { id: 'dec-p1', name: 'Hearts Union', emoji: '💖', position: [-1.4, 0.4, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, 0.1] },
      { id: 'dec-p2', name: 'Love Letter', emoji: '💌', position: [1.4, 0.5, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, -0.15] },
      { id: 'dec-p3', name: 'Gem Ring', emoji: '💍', position: [-1.3, -1.0, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, 0.05] },
      { id: 'dec-p4', name: 'Fluffy Bear', emoji: '🧸', position: [1.3, -0.9, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, -0.1] }
    );
  } else {
    // Dynamic elegant general theme decors
    decorations.push(
      { id: 'dec-p1', name: 'Shiny Sparkle', emoji: '✨', position: [-1.4, 0.5, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, 0.1] },
      { id: 'dec-p2', name: 'Eternal Heart', emoji: '❤️', position: [1.4, 0.4, 0.18], scale: [0.85, 0.85, 0.85], rotation: [0, 0, -0.15] },
      { id: 'dec-p3', name: 'Present Box', emoji: '🎁', position: [-1.3, -1.0, 0.18], scale: [0.8, 0.8, 0.8], rotation: [0, 0, 0.05] }
    );
  }
  
  if (parsedLikes.includes('photo') || parsedLikes.includes('polaroid') || parsedLikes.includes('memory') || parsedLikes.includes('camera')) {
    miniPolaroids.push(
      { id: 'pol-1', position: [-1.2, 1.4, -0.2], rotation: [0, 0, 0.08], scale: [0.8, 0.9, 0.05] },
      { id: 'pol-2', position: [-0.4, 1.5, -0.2], rotation: [0, 0, -0.05], scale: [0.8, 0.9, 0.05] },
      { id: 'pol-3', position: [0.4, 1.45, -0.2], rotation: [0, 0, 0.03], scale: [0.8, 0.9, 0.05] },
      { id: 'pol-4', position: [1.2, 1.4, -0.2], rotation: [0, 0, -0.1], scale: [0.8, 0.9, 0.05] }
    );
  }
  
  if (parsedLikes.includes('rose') || parsedLikes.includes('flower') || parsedLikes.includes('bloom') || parsedLikes.includes('nature') || parsedLikes.includes('garden') || parsedLikes.includes('floral')) {
    roses.push(
      { id: 'rose-tl1', color: '#ff3b5c', position: [-1.5, 1.9, 0.2], scale: 0.3 },
      { id: 'rose-tl2', color: '#ff7fa2', position: [-1.2, 1.8, 0.25], scale: 0.24 },
      { id: 'rose-tl3', color: '#ffffff', position: [-1.6, 1.5, 0.2], scale: 0.26 },
      { id: 'rose-tl4', color: '#ffb5c5', position: [-1.1, 2.0, 0.22], scale: 0.2 },
      { id: 'rose-br1', color: '#ff3b5c', position: [1.5, -0.8, 0.2], scale: 0.28 },
      { id: 'rose-br2', color: '#ffccd5', position: [1.2, -0.9, 0.25], scale: 0.22 },
      { id: 'rose-br3', color: '#ffffff', position: [1.6, -1.1, 0.2], scale: 0.25 }
    );
  }
  
  if (parsedLikes.includes('bear') || parsedLikes.includes('gift') || parsedLikes.includes('toy') || parsedLikes.includes('scroll') || parsedLikes.includes('monkey') || parsedLikes.includes('box') || parsedLikes.includes('cabinet') || parsedLikes.includes('shelf')) {
    compartments.push(
      { id: 'comp-1', type: 'bear', position: [-1.3, -1.8, 0.15] },
      { id: 'comp-2', type: 'scroll', position: [-0.4, -1.8, 0.15] },
      { id: 'comp-3', type: 'gift', position: [0.4, -1.8, 0.15] }
    );
    if (parsedLikes.includes('monkey')) {
      compartments.push({ id: 'comp-4', type: 'monkey', position: [1.3, -1.8, 0.15] });
    } else {
      compartments.push({ id: 'comp-4', type: 'flower', position: [1.3, -1.8, 0.15] });
    }
  }

  const textElements: TextElement[] = [];
  if (occasion && occasion.trim()) {
    textElements.push({
      id: 'txt-occasion',
      text: occasion.trim().toUpperCase(),
      fontFamily: 'Playfair Display',
      position: [0, 1.8, 0.3],
      scale: 0.32,
      color: '#d4af37',
      rotation: [0, 0, 0]
    });
  }
  if (nickname && nickname.trim()) {
    textElements.push({
      id: 'txt-nickname',
      text: nickname.trim(),
      fontFamily: 'Space Grotesk',
      position: [0, -1.6, 0.3],
      scale: 0.45,
      color: '#ff3b5c',
      rotation: [0, 0, 0]
    });
  }

  return {
    id: `frame-${Date.now()}`,
    occasion: occasion || '',
    nickname: nickname || '',
    backgroundColor: background,
    ledColor,
    frameStyle: 'white',
    photoPosition,
    photoScale,
    decorations,
    textElements,
    photoBase64,
    photoAspect: aspectRatio,
    likes,
    roses,
    miniPolaroids,
    compartments,
    hasLedStrip: true,
    peripheral,
  };
}
