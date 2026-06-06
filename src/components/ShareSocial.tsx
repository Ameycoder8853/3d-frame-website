import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, Clock, MessageSquare, Twitter, Send, Facebook, Globe } from 'lucide-react';
import { FrameConfig } from '../types';

interface ShareSocialProps {
  config: FrameConfig;
  onLog?: (type: 'system' | 'whatsapp' | 'trigger', text: string) => void;
}

export default function ShareSocial({ config, onLog }: ShareSocialProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [showNotification, setShowNotification] = useState(false);

  // Generate the active deep link
  const shareUrl = `${window.location.origin}${window.location.pathname}?restore=${config.id}`;

  // Countdown timer for simulated 24 hour link expiration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShowNotification(true);
      if (onLog) {
        onLog('system', `Generated & copied temporary deep link to clipboard: ${shareUrl}`);
      }
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Predefined social shares
  const encUrl = encodeURIComponent(shareUrl);
  const textTitle = `Check out this gorgeous interactive 3D Shadowbox for a ${config.occasion || 'custom special style'}! 🔮✨`;
  const encText = encodeURIComponent(textTitle);

  const socialPlatforms = [
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80 border-emerald-100',
      href: `https://api.whatsapp.com/send?text=${encText}%20${encUrl}`,
      logText: 'Shared design parameters via WhatsApp share handler',
    },
    {
      name: 'Twitter / X',
      icon: Twitter,
      color: 'bg-zinc-50 text-zinc-950 hover:bg-zinc-100 border-zinc-200',
      href: `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`,
      logText: 'Shared design parameters via Twitter / X feed intent',
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-50 text-sky-600 hover:bg-sky-100/80 border-sky-100',
      href: `https://t.me/share/url?url=${encUrl}&text=${encText}`,
      logText: 'Shared design parameters via Telegram channels',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100/80 border-blue-100',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
      logText: 'Initiated Facebook sharer intent portal',
    },
  ];

  const handleSocialClick = (name: string, logText: string) => {
    if (onLog) {
      onLog('whatsapp', `[Social Share: ${name}] ${logText}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-zinc-800" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Share to Social</h3>
        </div>
        <div className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-600 border border-amber-500/10 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold">
          <Clock className="w-3 h-3 animate-spin duration-1000" />
          <span>EXPIRING LINK</span>
        </div>
      </div>

      <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="font-medium">Deep Link Status:</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
            ACTIVE TEMPORARY
          </span>
        </div>
        <div className="text-xs text-zinc-500 space-y-1">
          <div className="flex justify-between font-mono text-[10px] bg-white border border-zinc-100 rounded p-1.5">
            <span className="text-zinc-400">Expires in:</span>
            <span className="text-zinc-800 font-bold">
              {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>
      </div>

      {/* Manual Link Input with Copy Action */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Frame Deep Link</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-600 select-all truncate">
            {shareUrl}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center p-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all w-10 h-10"
            title="Copy to Clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 animate-bounce" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Social Button Grid */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Share Destination</span>
        <div className="grid grid-cols-2 gap-2">
          {socialPlatforms.map((platform) => {
            const IconComponent = platform.icon;
            return (
              <a
                key={platform.name}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSocialClick(platform.name, platform.logText)}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all active:scale-[0.98] ${platform.color}`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span>{platform.name}</span>
              </a>
            );
          })}
        </div>
      </div>

      {showNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950 text-white px-4 py-2.5 rounded-full text-xs font-mono shadow-2xl flex items-center space-x-2 z-50 animate-bounce">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Temporary deep link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}
