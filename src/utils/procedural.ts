import { FrameConfig, Decoration, TextElement, RoseDecoration, MiniPolaroid, CompartmentItem } from '../types';

export function getDefaultQuote(occasion: string, nickname: string): string {
  const occ = (occasion || '').toLowerCase().trim();
  const name = nickname || 'Special One';
  if (occ.includes('birthday')) {
    return 'Cheers to another year of beautiful memories!';
  } else if (occ.includes('anniversary')) {
    return 'Loved you yesterday, love you still, always have, always will.';
  } else if (occ.includes('wedding') || occ.includes('marriage')) {
    return 'Two hearts, one beautiful journey together.';
  } else if (occ.includes('gradu')) {
    return 'The future belongs to those who believe in their dreams.';
  } else if (occ.includes('love') || occ.includes('valentine') || occ.includes('romance')) {
    return 'In your smile, I see something more beautiful than stars.';
  } else if (occ.includes('travel') || occ.includes('trip') || occ.includes('road')) {
    return 'Adventure is worthwhile in itself.';
  } else if (occ.includes('code') || occ.includes('program') || occ.includes('tech')) {
    return 'Dream big, create every day, build the future.';
  }
  return 'A snapshot of pure joy, frozen in time.';
}

export function generateProceduralFrame(
  occasion: string,
  nickname: string,
  likes: string,
  bgColor: string,
  photoBase64: string,
  aspectRatio: number,
  peripheral: string = 'standee',
  layoutStyle: 'editorial' | 'collage' | 'minimalist' | 'bento' = 'editorial',
  quote?: string
): FrameConfig {
  const background = '#ffffff'; // Force white shadowbox background by default as requested
  const parsedLikes = (likes || '').toLowerCase();
  const ledColor = '#ffb347'; // gorgeous warm sunset glow
  
  const miniPolaroids: MiniPolaroid[] = [];
  const roses: RoseDecoration[] = [];
  const compartments: CompartmentItem[] = [];
  const decorations: Decoration[] = [];

  // 1. Establish layout parameters based on selected style
  let photoPosition: [number, number, number] = [0, -0.2, 0.1];
  let photoScale: [number, number, number] = [1.8, 2.2, 1];
  let slots: [number, number, number][] = [
    [-1.4, 0.4, 0.18],  // Slot 1
    [1.4, 0.5, 0.18],   // Slot 2
    [-1.3, -1.0, 0.18], // Slot 3
    [1.3, -0.9, 0.18]   // Slot 4
  ];
  let slotRotations: [number, number, number][] = [
    [0, 0, 0.15],
    [0, 0, -0.1],
    [0, 0, 0.05],
    [0, 0, -0.08]
  ];

  if (layoutStyle === 'collage') {
    // Tilted vintage polaroid-board collage physics layout
    photoPosition = [-0.15, -0.15, 0.12];
    photoScale = [1.7, 2.1, 1];
    slots = [
      [-1.4, 0.8, 0.18],
      [1.4, -0.2, 0.18],
      [-1.2, -1.2, 0.18],
      [1.3, 1.1, 0.18]
    ];
    slotRotations = [
      [0.05, -0.05, 0.25],
      [-0.05, 0.05, -0.15],
      [0.1, 0.0, 0.08],
      [-0.08, -0.08, -0.2]
    ];
    // Always pre-populate some floating mini-polaroids to complete the polaroid board feel!
    miniPolaroids.push(
      { id: 'pol-1', position: [-1.2, 1.45, -0.22], rotation: [0.02, -0.02, -0.14], scale: [0.75, 0.85, 0.05] },
      { id: 'pol-2', position: [1.2, 1.40, -0.22], rotation: [-0.03, 0.03, 0.16], scale: [0.75, 0.85, 0.05] }
    );
  } else if (layoutStyle === 'minimalist') {
    // Fully clean, gallery style with upright photo frame
    photoPosition = [0, 0, 0.12];
    photoScale = [1.9, 2.3, 1];
    slots = [
      [-1.5, 1.5, 0.12],
      [1.5, 1.5, 0.12],
      [-1.5, -1.5, 0.12],
      [1.5, -1.5, 0.12]
    ];
    slotRotations = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
  } else if (layoutStyle === 'bento') {
    // Landscape photo, items positioned inside bottom grid zones
    photoPosition = [0, 0.22, 0.12];
    photoScale = [2.2, 1.75, 1];
    slots = [
      [-1.3, -0.7, 0.18],
      [1.3, -0.7, 0.18],
      [-0.8, -0.8, 0.15],
      [0.8, -0.8, 0.15]
    ];
    slotRotations = [
      [0, 0, 0.05],
      [0, 0, -0.05],
      [0, 0, 0],
      [0, 0, 0]
    ];
    // Always provide compartments at bottom to act as trinket drawers!
    compartments.push(
      { id: 'comp-1', type: 'bear', position: [-1.3, -1.8, 0.15] },
      { id: 'comp-2', type: 'scroll', position: [-0.4, -1.8, 0.15] },
      { id: 'comp-3', type: 'gift', position: [0.4, -1.8, 0.15] },
      { id: 'comp-4', type: 'flower', position: [1.3, -1.8, 0.15] }
    );
  }

  // Super rich keyword-to-emoji mapping dictionary
  const emojiDict: Record<string, { emoji: string; name: string }> = {
    // Travel & Transport
    "bus": { emoji: "🚌", name: "Bus Trip" },
    "car": { emoji: "🚗", name: "Road Trip" },
    "road": { emoji: "🛣️", name: "On The Road" },
    "mountain": { emoji: "🏔️", name: "Mountain" },
    "hill": { emoji: "⛰️", name: "Hills" },
    "bike": { emoji: "🏍️", name: "Motorbike" },
    "bicycle": { emoji: "🚲", name: "Cycling" },
    "train": { emoji: "🚆", name: "Train" },
    "plane": { emoji: "✈️", name: "Aviation" },
    "flight": { emoji: "✈️", name: "Flight" },
    "scooter": { emoji: "🛴", name: "Scooter" },
    "ship": { emoji: "🚢", name: "Cruise Ship" },
    "boat": { emoji: "⛵", name: "Sailboat" },
    "travel": { emoji: "🧳", name: "Traveler" },
    "trip": { emoji: "🎒", name: "Trip" },
    "camp": { emoji: "🏕️", name: "Camping" },
    "hiking": { emoji: "🥾", name: "Hiking" },

    // Tech & Hobbies
    "code": { emoji: "💻", name: "Coder" },
    "coding": { emoji: "💻", name: "Dev Life" },
    "program": { emoji: "👩‍💻", name: "Programmer" },
    "computer": { emoji: "🖥️", name: "Workstation" },
    "tech": { emoji: "🦾", name: "High Tech" },
    "phone": { emoji: "📱", name: "Specialized Tech" },
    "game": { emoji: "🎮", name: "Gamer" },
    "gaming": { emoji: "🎮", name: "Console" },
    "robot": { emoji: "🤖", name: "AI/Robot" },

    // Reading & Art
    "book": { emoji: "📚", name: "Books" },
    "reading": { emoji: "📖", name: "Reading" },
    "write": { emoji: "✍️", name: "Writer" },
    "art": { emoji: "🎨", name: "Artist" },
    "paint": { emoji: "🎨", name: "Painting" },
    "camera": { emoji: "📷", name: "Camera" },
    "photo": { emoji: "📸", name: "Photography" },
    "picture": { emoji: "🖼️", name: "Gallery" },
    "chess": { emoji: "♟️", name: "Chess" },

    // Nature, Flowers & Animals
    "nature": { emoji: "🌿", name: "Nature" },
    "garden": { emoji: "🏡", name: "Garden" },
    "plant": { emoji: "🪴", name: "Houseplant" },
    "tree": { emoji: "🌳", name: "Oak Tree" },
    "leaf": { emoji: "🍃", name: "Leaves" },
    "flower": { emoji: "🌸", name: "Daily Blossom" },
    "rose": { emoji: "🌹", name: "Red Rose" },
    "sun": { emoji: "☀️", name: "Sunshine" },
    "moon": { emoji: "🌙", name: "Moonlight" },
    "star": { emoji: "⭐", name: "Starry" },
    "sky": { emoji: "🌌", name: "Starry Sky" },
    "galaxy": { emoji: "🌀", name: "Galaxy" },
    "space": { emoji: "🚀", name: "Space Tech" },
    "ocean": { emoji: "🌊", name: "Ocean" },
    "sea": { emoji: "🐠", name: "Under the Sea" },
    "beach": { emoji: "🏖️", name: "Beachside" },
    "fish": { emoji: "🐟", name: "Fish" },
    "dolphin": { emoji: "🐬", name: "Dolphin" },
    "dog": { emoji: "🐶", name: "Dog Lover" },
    "cat": { emoji: "🐱", name: "Cat Companion" },
    "pet": { emoji: "🐾", name: "Pet Friendly" },
    "panda": { emoji: "🐼", name: "Cute Panda" },
    "lion": { emoji: "🦁", name: "Lion Pride" },
    "tiger": { emoji: "🐯", name: "Tiger" },
    "monkey": { emoji: "🐒", name: "Monkey" },

    // Food & Celebration
    "food": { emoji: "🍔", name: "Foodie" },
    "burger": { emoji: "🍔", name: "Burgers" },
    "pizza": { emoji: "🍕", name: "Pizzeria" },
    "cake": { emoji: "🎂", name: "Sweet Cake" },
    "chocolate": { emoji: "🍫", name: "Chocolate" },
    "coffee": { emoji: "☕", name: "Coffee Break" },
    "tea": { emoji: "🍵", name: "Hot Tea" },
    "icecream": { emoji: "🍦", name: "Ice Cream" },
    "beer": { emoji: "🍺", name: "Craft Beer" },
    "wine": { emoji: "🍷", name: "Fine Wine" },
    "cocktail": { emoji: "🍹", name: "Specialized Cocktail" },
    "balloon": { emoji: "🎈", name: "Balloon" },
    "party": { emoji: "🎉", name: "Party Time" },
    "celebration": { emoji: "🥳", name: "Celebrate" },
    "gift": { emoji: "🎁", name: "Special Gift" },
    "bear": { emoji: "🧸", name: "Teddy" },

    // Music & Dance
    "music": { emoji: "🎵", name: "Music" },
    "song": { emoji: "🎶", name: "Harmony" },
    "sing": { emoji: "🎤", name: "Vocal" },
    "guitar": { emoji: "🎸", name: "Guitar" },
    "piano": { emoji: "🎹", name: "Piano" },
    "dance": { emoji: "💃", name: "Dance" },

    // Love & Marriage
    "love": { emoji: "💖", name: "Eternal Love" },
    "heart": { emoji: "❤️", name: "Heartfelt" },
    "couple": { emoji: "👩‍❤️‍👨", name: "Together" },
    "wedding": { emoji: "💍", name: "Wedding Day" },
    "marriage": { emoji: "💍", name: "True Marriage" },
    "anniversary": { emoji: "🥂", name: "Anniversary" },
  };

  // Split user's typed 'likes' by non-word delimiters (like commas, spaces, etc.)
  const customWords = parsedLikes
    .split(/[\s,;+]+/)
    .map(w => w.trim())
    .filter(w => w.length > 2);

  const matchedKeys = new Set<string>();
  const customItems: { emoji: string; name: string }[] = [];

  // Exact/substring dictionary match
  for (const word of customWords) {
    let matched = false;
    for (const [key, value] of Object.entries(emojiDict)) {
      if (word === key || word.includes(key) || key.includes(word)) {
        if (!matchedKeys.has(key) && customItems.length < 4) {
          matchedKeys.add(key);
          customItems.push(value);
          matched = true;
          break;
        }
      }
    }
    // Sub-fallback for unmapped typed words directly
    if (!matched && word.length > 2 && customItems.length < 4) {
      const fallbacks = [
        { emoji: "✨", name: word.charAt(0).toUpperCase() + word.slice(1) },
        { emoji: "⭐", name: word.charAt(0).toUpperCase() + word.slice(1) },
        { emoji: "🎁", name: word.charAt(0).toUpperCase() + word.slice(1) },
        { emoji: "❤️", name: word.charAt(0).toUpperCase() + word.slice(1) }
      ];
      customItems.push(fallbacks[customItems.length]);
    }
  }

  // Defunct empty fallback
  if (customItems.length === 0) {
    customItems.push(
      { emoji: "✨", name: "Shiny Sparkle" },
      { emoji: "❤️", name: "Eternal Heart" },
      { emoji: "🎁", name: "Present Box" },
      { emoji: "⭐", name: "Milky Star" }
    );
  }

  // Build decorations from computed slots
  customItems.forEach((item, idx) => {
    if (idx < slots.length) {
      decorations.push({
        id: `dec-${idx + 1}`,
        name: item.name,
        emoji: item.emoji,
        position: slots[idx],
        scale: [0.85, 0.85, 0.85],
        rotation: slotRotations[idx]
      });
    }
  });

  const isNostalgic = parsedLikes.includes('photo') || parsedLikes.includes('polaroid') || parsedLikes.includes('memory') || parsedLikes.includes('camera') || layoutStyle === 'collage';
  if (isNostalgic && miniPolaroids.length === 0) {
    miniPolaroids.push(
      { id: 'pol-1', position: [-1.2, 1.4, -0.2], rotation: [0, 0, 0.08], scale: [0.8, 0.9, 0.05] },
      { id: 'pol-2', position: [-0.4, 1.5, -0.2], rotation: [0, 0, -0.05], scale: [0.8, 0.9, 0.05] },
      { id: 'pol-3', position: [0.4, 1.45, -0.2], rotation: [0, 0, 0.03], scale: [0.8, 0.9, 0.05] },
      { id: 'pol-4', position: [1.2, 1.4, -0.2], rotation: [0, 0, -0.1], scale: [0.8, 0.9, 0.05] }
    );
  }
  
  const wantsRoses = parsedLikes.includes('rose') || parsedLikes.includes('flower') || parsedLikes.includes('bloom') || parsedLikes.includes('nature') || parsedLikes.includes('garden') || parsedLikes.includes('floral') || (occasion && occasion.toLowerCase().includes('anniversary'));
  if (wantsRoses) {
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
  
  const wantsCompartments = parsedLikes.includes('bear') || parsedLikes.includes('gift') || parsedLikes.includes('toy') || parsedLikes.includes('scroll') || parsedLikes.includes('monkey') || parsedLikes.includes('box') || parsedLikes.includes('cabinet') || parsedLikes.includes('shelf') || layoutStyle === 'bento';
  if (wantsCompartments && compartments.length === 0) {
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
    hasLedStrip: false,
    peripheral,
    layoutStyle,
    quote: quote && quote.trim() !== '' ? quote.trim() : getDefaultQuote(occasion, nickname)
  };
}
