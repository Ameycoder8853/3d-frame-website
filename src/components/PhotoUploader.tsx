import React, { useState, useCallback, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface PhotoUploaderProps {
  onPhotoUpload: (dataUrl: string, aspectRatio: number) => void;
}

export default function PhotoUploader({ onPhotoUpload }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        // Downscale to max 800px width/height to save database space
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const scaledDataUrl = canvas.toDataURL('image/jpeg', 0.85); // Compress it
          const aspect = width / height;
          onPhotoUpload(scaledDataUrl, aspect);
        } else {
          onPhotoUpload(dataUrl, img.width / img.height);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto p-6 flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light text-zinc-900 mb-2 font-sans tracking-tight">Frame Your Memories</h1>
        <p className="text-zinc-500 font-sans">Upload a photo to see it in a 360° interactive 3D frame.</p>
      </div>
      
      <div 
        className={`w-full h-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-zinc-800 bg-zinc-100' : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Upload className="w-6 h-6 text-zinc-800" />
        </div>
        <p className="text-zinc-600 font-medium mb-1">Click to upload or drag and drop</p>
        <p className="text-zinc-400 text-sm">JPG, PNG, WEBP</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />
      </div>
      
      <div className="mt-8 flex items-center space-x-2 text-sm text-zinc-500">
        <ImageIcon className="w-4 h-4" />
        <span>Optimized for fast loading</span>
      </div>
    </div>
  );
}
