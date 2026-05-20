import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/Activity-Tracker-App/sw.js').catch(console.error);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!installEvent || dismissed) return null;

  const handleInstall = async () => {
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setInstallEvent(null);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-lg w-[calc(100%-2rem)] max-w-sm">
      <Download size={20} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">Install Activity Tracker</p>
        <p className="text-xs text-indigo-200 leading-tight">Add to your home screen</p>
      </div>
      <button
        onClick={handleInstall}
        className="bg-white text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-xl shrink-0 hover:bg-indigo-50 transition-colors"
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-indigo-200 hover:text-white transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
