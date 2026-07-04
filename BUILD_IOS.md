# Building the Soilify iOS app

The Capacitor iOS project is already set up. The native app loads the live
site (https://soilifylabs.com) inside a real iOS shell, plus native camera,
push notifications, splash screen, and status bar.

Everything below runs **on your Mac**.

## 0. One-time setup on the Mac
1. Install **Xcode** from the Mac App Store (large download).
2. Open Xcode once and let it install the command-line tools.
3. Install CocoaPods dependencies tooling (Capacitor 8 uses Swift Package
   Manager, so you usually don't need CocoaPods — skip unless Xcode asks).
4. Install Node (same as your PC) if not present: https://nodejs.org

## 1. Get the project onto the Mac
```bash
git clone https://github.com/masm080318-afk/fallow.git
cd fallow
npm install
```

## 2. Sync the native project
```bash
npx cap sync ios
```
This pulls the plugins into the Xcode project.

## 3. Open in Xcode
```bash
npx cap open ios
```

## 4. Configure signing (first time only)
In Xcode:
1. Click the **App** target → **Signing & Capabilities** tab.
2. Check **Automatically manage signing**.
3. Set **Team** to your Apple Developer account (add it under
   Xcode → Settings → Accounts if it's not listed).
4. The bundle id is already `com.soilifylabs.app` — if Apple says it's
   taken, change it to something unique like `com.<yourname>.soilify`.

## 5. Add the Push Notifications capability (for approval + alerts)
Still in **Signing & Capabilities**:
1. Click **+ Capability** → add **Push Notifications**.
2. Click **+ Capability** → add **Background Modes** → check
   **Remote notifications**.
(You can ship without these, but push is what makes Apple treat this as a
real app and not a rejected "web wrapper.")

## 6. App icon
1. In Xcode, open `App/Assets.xcassets` → `AppIcon`.
2. Drag in a 1024×1024 PNG of the Soilify logo (no transparency).
   You can generate all sizes from one image with https://icon.kitchen

## 7. Run it
1. Pick a simulator (e.g. iPhone 15) or plug in your iPhone.
2. Press the ▶ **Run** button. The app launches and loads soilifylabs.com.

## 8. Submit to the App Store
1. In Xcode top bar, set the device target to **Any iOS Device (arm64)**.
2. Menu → **Product → Archive**.
3. When the Organizer opens → **Distribute App → App Store Connect → Upload**.
4. Go to https://appstoreconnect.apple.com → **My Apps → +** → create the app
   listing (name, category, description — use the pamphlet text, price, and
   screenshots taken from the simulator with Cmd+S).
5. Attach the uploaded build → **Submit for Review**. Approval is ~1–3 days.

## Notes
- To point the app at a local dev server instead of production while testing,
  edit `capacitor.config.ts` → `server.url` to
  `http://<your-mac-LAN-ip>:5179`, set `cleartext: true`, then `npx cap sync ios`.
- After changing `capacitor.config.ts` or updating plugins, always re-run
  `npx cap sync ios`.
- Permission prompt text lives in `ios/App/App/Info.plist` (already filled in
  for camera, photos, and location).
