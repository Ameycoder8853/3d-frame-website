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

  // Placements coordinates
  const slots: [number, number, number][] = [
    [-1.4, 0.4, 0.18],  // Slot 1
    [1.4, 0.5, 0.18],   // Slot 2
    [-1.3, -1.0, 0.18], // Slot 3
    [1.3, -0.9, 0.18]   // Slot 4
  ];

  const slotRotations: [number, number, number][] = [
    [0, 0, 0.15],
    [0, 0, -0.1],
    [0, 0, 0.05],
    [0, 0, -0.08]
  ];

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
