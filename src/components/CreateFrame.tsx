import React, { useState } from 'react';
import PhotoUploader from './PhotoUploader';

interface CreateFrameProps {
  onGenerate: (data: any) => void;
  isLoading: boolean;
}

export default function CreateFrame({ onGenerate, isLoading }: CreateFrameProps) {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [occasion, setOccasion] = useState('');
  const [nickname, setNickname] = useState('');
  const [likes, setLikes] = useState('');
  const [peripheral, setPeripheral] = useState('standee');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [layoutStyle, setLayoutStyle] = useState<'editorial' | 'collage' | 'minimalist' | 'bento'>('editorial');
  const [quote, setQuote] = useState('');

  const handlePhotoUpload = (dataUrl: string, aspect: number) => {
    setPhotoDataUrl(dataUrl);
    setAspectRatio(aspect);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl) return;
    onGenerate({
      photoBase64: photoDataUrl,
      aspectRatio,
      occasion,
      nickname,
      likes,
      peripheral,
      bgColor,
      layoutStyle,
      quote,
    });
  };

  if (!photoDataUrl) {
    return <PhotoUploader onPhotoUpload={handlePhotoUpload} />;
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-zinc-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light text-zinc-900 mb-2 tracking-tight">Customize Your Frame</h2>
        <p className="text-zinc-500 text-sm">Tell us about the person to generate a unique design.</p>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="w-32 h-32 rounded-xl overflow-hidden border border-zinc-200 shadow-sm relative">
          <img src={photoDataUrl} alt="Uploaded" className="w-full h-full object-cover" />
          <button 
            type="button"
            onClick={() => setPhotoDataUrl(null)}
            className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-xs font-medium shadow-sm"
          >
            Change
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Occasion</label>
          <input
            type="text"
            required
            placeholder="e.g. Anniversary, Birthday, Graduation"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400 font-sans text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Nickname or Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Alex, Sam"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400 font-sans text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Likes & Themes</label>
          <input
            type="text"
            required
            placeholder="e.g. Space, Ocean, Vintage"
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400 font-sans text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Diorama Layout Style</label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'editorial', label: 'Classic Editorial', desc: 'Symmetrical floating tokens' },
              { id: 'collage', label: 'Vintage Collage', desc: 'Tilted frame with polaroids' },
              { id: 'minimalist', label: 'Gallery Minimalist', desc: 'Clean, upright art focus' },
              { id: 'bento', label: 'Bento Shelf', desc: 'Horizontal frame with shelves' }
            ].map((st) => (
              <button
                type="button"
                key={st.id}
                onClick={() => setLayoutStyle(st.id as any)}
                className={`text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-0.5 ${
                  layoutStyle === st.id
                    ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <span className="font-semibold text-zinc-900">{st.label}</span>
                <span className="text-zinc-500 font-normal leading-tight">{st.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Event Name/Date</label>
          <input
            type="text"
            placeholder="e.g. Oct 12, 1999 or 25th Wedding Anniversary"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400 font-sans text-sm"
          />
          <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
            This event name, year, or date will be custom-engraved onto the brass plaque at the bottom of the frame instead of a citation quote.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Frame Peripheral Attachment</label>
          <select
            value={peripheral}
            onChange={(e) => setPeripheral(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all font-sans text-sm"
          >
            <option value="standee">Premium Matte Black Acrylic Standee Base</option>
            <option value="hanging-chain">Vintage Golden Brass Hanger Chain</option>
            <option value="none">Flat Minimalist (Desktop Standing / Floating)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Preferred Background Color</label>
          <div className="flex space-x-3">
             <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-10 w-14 rounded-lg cursor-pointer bg-transparent border-0 p-0"
            />
            <div className="flex-1 px-4 py-2 border border-zinc-300 rounded-xl bg-zinc-50 text-zinc-600 font-mono text-sm uppercase flex items-center">
               {bgColor}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 px-6 py-3 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>AI Generating...</span>
            </>
          ) : (
            <span>Generate Unique Design</span>
          )}
        </button>
      </form>
    </div>
  );
}
