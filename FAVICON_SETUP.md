# Favicon Setup

The app expects these favicon files in the `public/` directory, all based on the circular logo part:

## Required Files

1. **favicon.ico** (32×32 or 64×64)
   - Browser tab icon
   - Create from `logo-icon.png`
   - Can use any ICO converter tool

2. **apple-touch-icon.png** (180×180)
   - iOS home screen icon
   - Transparent background or solid green (#5c9e2a)
   - Create from `logo-icon.png`

3. **icon-192.png** (192×192)
   - Android PWA home screen icon
   - Referenced in `manifest.json`

4. **icon-512.png** (512×512)
   - Android PWA splash screen icon
   - Referenced in `manifest.json`

## How to Create

1. Save your circle logo as **`public/logo-icon.png`** (transparent PNG)
2. Use an image editor or online converter to resize/export:
   - 32×32 → `favicon.ico`
   - 180×180 → `apple-touch-icon.png`
   - 192×192 → `icon-192.png`
   - 512×512 → `icon-512.png`

Recommended tools:
- **Free online**: favicon.io, icoconvert.com, pixlr.com
- **Local**: GIMP, Photoshop, or ImageMagick

## Quick Command (if using ImageMagick)

```bash
# From logo-icon.png, create all sizes
convert public/logo-icon.png -define icon:auto-resize=192,512,64,32 public/favicon.ico
convert public/logo-icon.png -resize 192x192 public/icon-192.png
convert public/logo-icon.png -resize 512x512 public/icon-512.png
convert public/logo-icon.png -resize 180x180 public/apple-touch-icon.png
```

Once all files are in `public/`, Vercel will deploy them automatically.
