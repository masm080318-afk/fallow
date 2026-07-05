import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.soilifylabs.app",
  appName: "Soilify Labs",
  // Capacitor requires a webDir to exist even when loading a remote URL.
  // Our real app is server-rendered on Vercel, so we point the native
  // shell at the live site below and use /public only as a fallback.
  webDir: "public",
  server: {
    // The native app loads the app experience directly (skipping the
    // marketing homepage). /dashboard redirects to /login when signed
    // out, then shows the real dashboard once authenticated. Update this
    // if the domain changes. For local testing against a dev server,
    // temporarily set url to "http://<your-mac-LAN-ip>:5179/dashboard".
    url: "https://soilifylabs.com/dashboard",
    cleartext: false,
    // Without this, WKWebView sometimes treats same-origin server-side
    // redirects (e.g. /dashboard -> /login) as "external" navigation and
    // kicks the user out to system Safari instead of staying in-app.
    allowNavigation: ["soilifylabs.com", "*.soilifylabs.com"],
  },
  ios: {
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#1A1D17",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
