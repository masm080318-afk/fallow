import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.soilifylabs.app",
  appName: "Soilify Labs",
  // Capacitor requires a webDir to exist even when loading a remote URL.
  // Our real app is server-rendered on Vercel, so we point the native
  // shell at the live site below and use /public only as a fallback.
  webDir: "public",
  server: {
    // The native app loads the deployed site directly. Update this if the
    // domain changes. For local testing against a dev server, temporarily
    // set url to "http://<your-mac-LAN-ip>:5179".
    url: "https://soilifylabs.com",
    cleartext: false,
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
