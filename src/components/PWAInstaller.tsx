'use client';

import React, { useEffect, useState } from 'react';
import { Download, Share, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('PWA ServiceWorker registration failed:', error);
          });
      });
    }

    // 2. Check if already installed in standalone mode
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // Check if iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
      setIsIOS(isApple);

      // Listen for Chrome/Edge/Android install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
        setShowBanner(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Listen for installed event
      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setShowBanner(false);
        setDeferredPrompt(null);
        console.log('PWA installed successfully');
      });

      // Listen for custom trigger from Header navbar
      const handleCustomTrigger = () => {
        if (deferredPrompt) {
          triggerInstall();
        } else if (isApple) {
          setShowIOSModal(true);
        } else {
          setShowBanner(true);
        }
      };
      window.addEventListener('trigger-pwa-install', handleCustomTrigger);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('trigger-pwa-install', handleCustomTrigger);
      };
    }
  }, [deferredPrompt]);

  const triggerInstall = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSModal(true);
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install prompt failed:', err);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Install Banner (Mobile & Desktop) */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-bounce-subtle">
          <div className="bg-slate-900/95 backdrop-blur-md text-white border border-cyan-500/40 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-md">
                <Smartphone className="w-6 h-6 text-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-cyan-200 truncate">
                  Install KV Dryfish App
                </div>
                <div className="text-xs text-slate-400 truncate">
                  Fast offline access & home screen app
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={triggerInstall}
                className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Smartphone className="w-5 h-5" />
                Install on iPhone / iPad
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Install <strong>KV Dryfish Accounts</strong> directly to your home screen with zero app store downloads:
            </p>

            <div className="space-y-2.5 text-xs text-slate-200 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <span>
                  Tap the Safari <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> at the bottom.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <span>Tap <strong>Add</strong> in the top right corner.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 text-slate-950 font-bold text-xs rounded-xl"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
