import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function generateProceduralFrame(occasion: string, nickname: string, likes: string, bgColor: string, photoBase64: string, aspectRatio: number, peripheral: string = 'standee') {
  const background = bgColor || '#fdf6e2'; // warm gold/ivory parchment
  const parsedLikes = (likes || '').toLowerCase();
  const ledColor = '#ffb347'; // gorgeous warm sunset glow
  
  const photoPosition: [number, number, number] = [0, -0.2, 0.1];
  const photoScale: [number, number, number] = [1.8, 2.2, 1];
  
  const miniPolaroids: any[] = [];
  const roses: any[] = [];
  const compartments: any[] = [];
  const decorations: any[] = [];

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

  // Parse custom likes components (Polaroids, Roses, Compartments)
  if (parsedLikes.includes('photo') || parsedLikes.includes('polaroid') || parsedLikes.includes('memory') || parsedLikes.includes('camera')) {
    miniPolaroids.push(
      { id: 'pol-1', position: [-1.2, 1.4, -0.2], rotation: [0, 0, 0.08], scale: [0.8, 0.9, 0.05] as [number, number, number] },
      { id: 'pol-2', position: [-0.4, 1.5, -0.2], rotation: [0, 0, -0.05], scale: [0.8, 0.9, 0.05] as [number, number, number] },
      { id: 'pol-3', position: [0.4, 1.45, -0.2], rotation: [0, 0, 0.03], scale: [0.8, 0.9, 0.05] as [number, number, number] },
      { id: 'pol-4', position: [1.2, 1.4, -0.2], rotation: [0, 0, -0.1], scale: [0.8, 0.9, 0.05] as [number, number, number] }
    );
  }
  
  if (parsedLikes.includes('rose') || parsedLikes.includes('flower') || parsedLikes.includes('bloom') || parsedLikes.includes('nature') || parsedLikes.includes('garden') || parsedLikes.includes('floral')) {
    roses.push(
      // Top-left cluster
      { id: 'rose-tl1', color: '#ff3b5c', position: [-1.5, 1.9, 0.2] as [number, number, number], scale: 0.3 },
      { id: 'rose-tl2', color: '#ff7fa2', position: [-1.2, 1.8, 0.25] as [number, number, number], scale: 0.24 },
      { id: 'rose-tl3', color: '#ffffff', position: [-1.6, 1.5, 0.2] as [number, number, number], scale: 0.26 },
      { id: 'rose-tl4', color: '#ffb5c5', position: [-1.1, 2.0, 0.22] as [number, number, number], scale: 0.2 },
      // Bottom-right cluster
      { id: 'rose-br1', color: '#ff3b5c', position: [1.5, -0.8, 0.2] as [number, number, number], scale: 0.28 },
      { id: 'rose-br2', color: '#ffccd5', position: [1.2, -0.9, 0.25] as [number, number, number], scale: 0.22 },
      { id: 'rose-br3', color: '#ffffff', position: [1.6, -1.1, 0.2] as [number, number, number], scale: 0.25 }
    );
  }
  
  if (parsedLikes.includes('bear') || parsedLikes.includes('gift') || parsedLikes.includes('toy') || parsedLikes.includes('scroll') || parsedLikes.includes('monkey') || parsedLikes.includes('box') || parsedLikes.includes('cabinet') || parsedLikes.includes('shelf')) {
    compartments.push(
      { id: 'comp-1', type: 'bear' as const, position: [-1.3, -1.8, 0.15] as [number, number, number] },
      { id: 'comp-2', type: 'scroll' as const, position: [-0.4, -1.8, 0.15] as [number, number, number] },
      { id: 'comp-3', type: 'gift' as const, position: [0.4, -1.8, 0.15] as [number, number, number] }
    );
    if (parsedLikes.includes('monkey')) {
      compartments.push({ id: 'comp-4', type: 'monkey' as const, position: [1.3, -1.8, 0.15] as [number, number, number] });
    } else {
      compartments.push({ id: 'comp-4', type: 'flower' as const, position: [1.3, -1.8, 0.15] as [number, number, number] });
    }
  }

  const textElements = [];
  if (occasion && occasion.trim()) {
    textElements.push({
      id: 'txt-occasion',
      text: occasion.trim().toUpperCase(),
      fontFamily: 'Playfair Display',
      position: [0, 1.8, 0.3] as [number, number, number], // Position at the top, safely clear of the center photo
      scale: 0.32,
      color: '#d4af37', // metallic gold lettering
      rotation: [0, 0, 0] as [number, number, number]
    });
  }
  if (nickname && nickname.trim()) {
    textElements.push({
      id: 'txt-nickname',
      text: nickname.trim(),
      fontFamily: 'Space Grotesk',
      position: [0, -1.6, 0.3] as [number, number, number], // Position at the bottom, safely clear of the center photo
      scale: 0.45,
      color: '#ff3b5c', // matching contrast accent color
      rotation: [0, 0, 0] as [number, number, number]
    });
  }

  return {
    id: `frame-${Date.now()}`,
    occasion: occasion || '',
    nickname: nickname || '',
    backgroundColor: background,
    ledColor,
    frameStyle: 'white' as const,
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.post('/api/generate-frame', async (req, res) => {
    const { occasion, nickname, likes, bgColor, photoBase64, aspectRatio, peripheral } = req.body;
    try {
      const prompt = `
        You are a master 3D shadowbox and diorama designer.
        A customer wants to make a custom 3D shadowbox frame gift.
        Here is the customer's request:
        - Occasion: ${occasion || 'None provided'}
        - Nickname/Text: ${nickname || 'None provided'}
        - Likes/Themes: ${likes || 'None provided'}
        - Preferred Background Color: ${bgColor || '#fdf6e2'}
        
        Generate a cohesive, premium 3D composition for a shadowbox frame (dimensions width: 10, height: 12, depth: 3).
        The shadowbox contains the user's uploaded photo at the center. You must arrange decorative elements in 3D space around it.
        
        CRITICAL DESIGN REQUIREMENT (Only what is requested):
        1. If the user's 'Likes/Themes' is empty or has 'None provided', the 'decorations' array MUST be empty. Do NOT add any decorative elements.
        2. If 'Likes/Themes' mentions specific objects, ONLY generate decorative items that directly relate to those specified likes. No generic rose arches or teddy bears or boxes unless those specific terms were provided.
        3. If there is no 'Occasion' text provided, do NOT include any text element representing the occasion.
        4. If there is no 'Nickname/Text' provided, do NOT include any text element representing the nickname.
        5. Arrange positions as follows to prevent any visual overlapping:
           - The photo is centered at [0, -0.06, 0.12] and occupies vertical Y space from -1.2 to 1.1.
           - Text related to Occasion must be positioned near the top of the box: position format [0, 1.8, 0.3], fontFamily "Playfair Display", scale 0.32.
           - Text related to Nickname/Name must be positioned near the bottom of the box: position format [0, -1.6, 0.3], fontFamily "Space Grotesk", scale 0.45.
           - Decorative emoji tokens must be placed elegantly around the border (X between -1.6 and 1.6, Y between -2.0 and 2.0, Z between -1.0 and 1.0), avoiding the center photo.

        Provide the output in JSON format matching this schema:
        - backgroundColor: A hex color code matching the user's preferred color.
        - ledColor: A hex color code for the light strip (usually soft warm white #fff3e0 or a subtle complementary shade).
        - frameStyle: "white", "black", or "wood"
        - photoPosition: [x,y,z] for the main photo. (Usually around [0, 0, 0.25])
        - photoScale: [x,y,z] represent size.
        - decorations: A list of objects for the user's specified likes. Represent each with an appropriate emoji, a clean name label, position [x,y,z], scale [x,y,z], and rotation [rx,ry,rz].
        - textElements: A list of text elements if needed.
      `;

      const parts: any[] = [{ text: prompt }];

      if (photoBase64) {
        const mimeMatch = photoBase64.match(/^data:(image\/[a-zA-Z]*);base64,/);
        if (mimeMatch) {
          const mimeType = mimeMatch[1];
          const data = photoBase64.replace(/^data:image\/[a-zA-Z]*;base64,/, "");
          parts.push({
            inlineData: {
              data,
              mimeType
            }
          });
          parts.push({text: "Analyze the uploaded photo to suggest colors and themes that complement it."})
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              backgroundColor: { type: Type.STRING },
              ledColor: { type: Type.STRING },
              frameStyle: { type: Type.STRING, enum: ["white", "black", "wood"] },
              photoPosition: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              photoScale: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              decorations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    emoji: { type: Type.STRING },
                    position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    scale: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    rotation: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                  },
                  required: ["name", "emoji", "position", "scale", "rotation"]
                }
              },
              textElements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    fontFamily: { type: Type.STRING },
                    position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    scale: { type: Type.NUMBER },
                    color: { type: Type.STRING },
                    rotation: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                  },
                  required: ["text", "fontFamily", "position", "scale", "color", "rotation"]
                }
              }
            },
            required: ["backgroundColor", "ledColor", "frameStyle", "photoPosition", "photoScale", "decorations", "textElements"]
          }
        }
      });

      const configStr = response.text || "{}";
      const frameConfig = JSON.parse(configStr);

      // give unique ids to elements
      frameConfig.decorations = frameConfig.decorations.map((d: any, i: number) => ({ ...d, id: `dec-${i}` }));
      frameConfig.textElements = frameConfig.textElements.map((t: any, i: number) => ({ ...t, id: `txt-${i}` }));
      frameConfig.id = `frame-${Date.now()}`;
      frameConfig.photoBase64 = photoBase64;
      frameConfig.photoAspect = req.body.aspectRatio || 1;
      frameConfig.likes = likes || '';
      frameConfig.whatsappPhone = '';
      frameConfig.peripheral = peripheral || 'standee';
      
      // Inject fallback diorama items even if Gemini is active to enrich the graphic depth
      const computedFallback = generateProceduralFrame(occasion, nickname, likes, bgColor, photoBase64, req.body.aspectRatio || 1, peripheral || 'standee');
      frameConfig.roses = computedFallback.roses;
      frameConfig.miniPolaroids = computedFallback.miniPolaroids;
      frameConfig.compartments = computedFallback.compartments;
      frameConfig.hasLedStrip = true;

      res.json(frameConfig);
    } catch (error: any) {
      console.warn("Gemini execution failed or reported leak, falling back to procedural physical frame structure:", error.message || error);
      // Perfect fallback to ensure amazing user experience instantly
      const fallbackConfig = generateProceduralFrame(occasion, nickname, likes, bgColor, photoBase64, aspectRatio || 1, peripheral || 'standee');
      res.json(fallbackConfig);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
