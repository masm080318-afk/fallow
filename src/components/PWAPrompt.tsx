"use client";

import { useEffect, useState } from "react";
import { Download, X, WifiOff } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Register service worker.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      const seen =
        typeof localStorage !== "undefined" &&
        localStorage.getItem("soilify_pwa_dismissed");
      if (!seen) setInstallEvent(evt);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const updateOnline = () => setOffline(!navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "dismissed") {
      localStorage.setItem("soilify_pwa_dismissed", "1");
    }
    setInstallEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem("soilify_pwa_dismissed", "1");
    setDismissed(true);
  };

  return (
    <>
      {offline && (
        <div className="card border-yellow/30 bg-yellow/10 flex items-center gap-2 text-sm">
          <WifiOff size={16} className="text-yellow" />
          <span>Offline — showing last known data.</span>
        </div>
      )}
      {installEvent && !dismissed && (
        <div className="card flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Download className="text-green" size={20} />
            <div>
              <div className="font-medium text-sm">Add Soilify Labs to home screen</div>
              <div className="text-xs text-muted">
                Quick access, offline-ready.
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={install} className="btn-primary !py-1.5 !px-3 text-sm">
              Install
            </button>
            <button
              onClick={dismiss}
              className="text-muted hover:text-foreground !min-h-0"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
