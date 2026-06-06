export interface Decoration {
  id: string;
  name: string;
  emoji: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
}

export interface TextElement {
  id: string;
  text: string;
  fontFamily: string;
  position: [number, number, number];
  scale: number;
  color: string;
  rotation: [number, number, number];
}

export interface RoseDecoration {
  id: string;
  color: string;
  position: [number, number, number];
  scale: number;
}

export interface MiniPolaroid {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface CompartmentItem {
  id: string;
  type: 'bear' | 'scroll' | 'flower' | 'gift' | 'text' | 'monkey';
  label?: string;
  position: [number, number, number];
}

export interface FrameConfig {
  id: string;
  occasion: string;
  nickname: string;
  backgroundColor: string;
  ledColor: string;
  frameStyle: 'white' | 'black' | 'wood';
  photoPosition: [number, number, number];
  photoScale: [number, number, number];
  decorations: Decoration[];
  textElements: TextElement[];
  photoBase64?: string;
  photoAspect?: number;
  likes?: string;
  roses?: RoseDecoration[];
  miniPolaroids?: MiniPolaroid[];
  compartments?: CompartmentItem[];
  hasLedStrip?: boolean;
  whatsappPhone?: string;
  peripheral?: string;
  layoutStyle?: 'editorial' | 'collage' | 'minimalist' | 'bento';
  quote?: string;
  photoRotation?: number;
  photoFlipV?: boolean;
  photoFlipH?: boolean;
  photoBrightness?: number;
}
