import React, { useState, Suspense, useEffect } from 'react';
import CreateFrame from './components/CreateFrame';
import ShareSocial from './components/ShareSocial';
import { FrameConfig } from './types';
import { saveFrameConfig, loadFrameConfig } from './firebase';
import { generateProceduralFrame } from './utils/procedural';
import SceneHybrid from './components/SceneHybrid';

interface WebLog {
  id: string;
  time: string;
  type: 'system' | 'whatsapp' | 'trigger';
  text: string;
}

export default function App() {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [frameConfig, setFrameConfig] = useState<FrameConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<WebLog[]>([]);

  const addLog = (type: 'system' | 'whatsapp' | 'trigger', text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [{ id: Math.random().toString(), time, type, text }, ...prev]);
  };

  useEffect(() => {
    // Check if we are restoring from a link
    const searchParams = new URLSearchParams(window.location.search);
    const restoreId = searchParams.get('restore');
    if (restoreId) {
       setIsGenerating(true);
       loadFrameConfig(restoreId).then((config) => {
         if (config) {
           setFrameConfig(config);
           setPhotoDataUrl(config.photoBase64 || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='%23eee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif'>Please re-upload photo</text></svg>");
           addLog('system', `Restored existing custom diorama configuration ${restoreId}`);
         }
       }).finally(() => setIsGenerating(false));
    }
  }, []);

  useEffect(() => {
    if (frameConfig && photoDataUrl) {
      addLog('system', '3D Shadowbox initialized successfully.');
      addLog('system', 'Interactive 3D viewport active. Drag element to orbit 360 degrees.');
    }
  }, [frameConfig, photoDataUrl]);

  const handleGenerate = async (formData: any) => {
    setIsGenerating(true);
    setPhotoDataUrl(formData.photoBase64);
    addLog('system', 'Analyzing uploaded image and custom style variables...');
    
    try {
      let config: FrameConfig;
      try {
        const response = await fetch('/api/generate-frame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Local backend response is offline or failed");
        }

        config = await response.json();
        addLog('system', 'Successfully synthesized custom 3D diorama parameters via AI.');
      } catch (backendError) {
        addLog('system', 'Server offline or unconfigured. Compiling pristine 3D diorama parameters directly on the client...');
        config = generateProceduralFrame(
          formData.occasion || '',
          formData.nickname || '',
          formData.likes || '',
          formData.bgColor || '#fdf6e2',
          formData.photoBase64,
          formData.aspectRatio || 1,
          formData.peripheral || 'standee',
          formData.layoutStyle || 'editorial',
          formData.quote || ''
        );
      }
      
      // Save it automatically to Firestore, catch any permission / config errors gracefully
      await saveFrameConfig(config).catch((dbError) => {
        console.warn('Firestore autosave bypassed:', dbError);
        addLog('system', 'Personal database offline. Initializing design in transient local memory.');
      });
      
      setFrameConfig(config);
      
      // Update URL so it can be copied or reloaded
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('restore', config.id);
      window.history.pushState({}, '', newUrl);

      addLog('system', 'Successfully synthesized custom 3D diorama parameters.');

    } catch (error: any) {
      console.error(error);
      alert(`Error generating frame design: ${error.message}`);
      setPhotoDataUrl(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <header className="py-5 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 flex justify-between items-center max-w-6xl">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-serif text-sm font-bold">
              🔮
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">3D Frame Website</h2>
          </div>
          <span className="text-[10px] bg-indigo-500/15 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-semibold tracking-wide uppercase">
            360° Realism Ready
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {!frameConfig ? (
          <CreateFrame onGenerate={handleGenerate} isLoading={isGenerating} />
        ) : (
          <div className="mx-auto flex flex-col items-center">
             <div className="w-full text-center mb-8">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none bg-indigo-50 px-2.5 py-1 rounded-full">
                  Handcrafted Gift Model
                </span>
                <h1 className="text-3xl font-light tracking-tight text-zinc-900 mt-2.5 mb-2">
                  {frameConfig.occasion || 'Custom Frame'}
                </h1>
                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                  A high-fidelity 3D diorama. Customize physical parameters, checkout, or leave to test WhatsApp abandoned recovery.
                </p>
             </div>

             <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               {/* 3D Model Display Column (2/3 width) */}
               <div className="lg:col-span-2 space-y-6">
                 <Suspense fallback={
                   <div className="w-full h-[75vh] bg-zinc-100 rounded-2xl flex items-center justify-center border border-zinc-200/50 shadow-inner animate-pulse">
                     <div className="flex flex-col items-center space-y-4">
                       <span className="text-3xl">🔮</span>
                       <p className="text-zinc-500 text-sm font-medium">Constructing 3D Scene...</p>
                     </div>
                   </div>
                 }>
                   <SceneHybrid photoDataUrl={photoDataUrl!} config={frameConfig} />
                 </Suspense>

                 {/* Real Automations Log Panel to display instant feedback */}
                 <div className="bg-zinc-900 text-zinc-300 p-5 rounded-2xl shadow-xl font-mono text-xs border border-zinc-800">
                   <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-3">
                     <span className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                       Webhook Automation Logs
                     </span>
                     <span className="text-[10px] text-zinc-500">NodeJS Express Listener</span>
                   </div>
                   <div className="space-y-2 max-h-36 overflow-y-auto">
                     {logs.length === 0 ? (
                       <p className="text-zinc-500 italic">Waiting for events to trigger...</p>
                     ) : (
                       logs.map((log) => (
                         <div key={log.id} className="flex items-start space-x-2.5">
                           <span className="text-zinc-500">{log.time}</span>
                           <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold leading-none ${
                             log.type === 'trigger' 
                               ? 'bg-amber-500/10 text-amber-500' 
                               : log.type === 'whatsapp' 
                               ? 'bg-emerald-500/10 text-emerald-400' 
                               : 'bg-indigo-500/10 text-indigo-400'
                           }`}>
                             {log.type}
                           </span>
                           <span className="text-zinc-200 flex-1">{log.text}</span>
                         </div>
                       ))
                     )}
                   </div>
                 </div>
               </div>

                {/* Configuration details and action checklist column */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Order Summary</h3>
                    
                    <div className="space-y-3 font-mono text-xs border-b border-zinc-100 pb-5 text-zinc-600">
                      <div className="flex justify-between">
                        <span>Occasion:</span>
                        <span className="font-bold text-zinc-950">{frameConfig.occasion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nickname Element:</span>
                        <span className="font-bold text-zinc-950">{frameConfig.nickname}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Layout Aesthetic:</span>
                        <span className="font-bold text-zinc-950 uppercase">{frameConfig.layoutStyle || 'editorial'}</span>
                      </div>
                      {frameConfig.quote && (
                        <div className="flex flex-col gap-1 pt-1 border-t border-dashed border-zinc-100">
                          <span className="text-zinc-400">Plaque Quote:</span>
                          <span className="font-sans italic text-zinc-850 font-medium bg-zinc-50 p-2 rounded border border-zinc-100 block max-h-20 overflow-y-auto">
                            "{frameConfig.quote}"
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1">
                        <span>Color theme:</span>
                        <span className="font-bold text-zinc-950 uppercase">{frameConfig.backgroundColor}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-zinc-500 text-xs">
                        Includes premium bespoke elements:
                      </div>
                      <ul className="text-xs space-y-1.5 text-zinc-700 font-medium">
                        <li className="flex items-center gap-2">✨ Real-time physics orbiting controls</li>
                        <li className="flex items-center gap-2">🖼️ High-fidelity floating central photo</li>
                        <li className="flex items-center gap-2">💡 Sunset ambient fairylights active</li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 space-y-3">
                      <button 
                        onClick={() => alert('Your design "' + frameConfig.nickname + '" has been submitted successfully to checkout!')}
                        className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-sm rounded-xl transition-all shadow-md active:scale-[0.98]"
                      >
                        Proceed to Checkout (9.90)
                      </button>
                      
                      <button 
                        onClick={() => {
                          setFrameConfig(null);
                          setPhotoDataUrl(null);
                          const newUrl = new URL(window.location.href);
                          newUrl.searchParams.delete('restore');
                          window.history.pushState({}, '', newUrl);
                        }}
                        className="w-full py-3 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
                      >
                        Discard & Generate New Design
                      </button>
                    </div>
                  </div>

                  <ShareSocial config={frameConfig} onLog={addLog} />
                </div>
              </div>
           </div>
         )}
       </main>
     </div>
  );
}