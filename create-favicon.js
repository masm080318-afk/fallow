// Quick favicon creator - run with: node create-favicon.js
const fs = require('fs');

// Minimal valid ICO file (1x1 transparent pixel)
const icoHeader = Buffer.from([
  0x00, 0x00, // Reserved
  0x01, 0x00, // Type (1 = ICO)
  0x01, 0x00, // Count (1 image)
  // Image directory
  0x01, 0x01, // Width: 1
  0x01, 0x01, // Height: 1
  0x00, 0x00, // Palette colors
  0x00,       // Reserved
  0x01, 0x00, // Color planes
  0x20, 0x00, // Bits per pixel (32)
  0x30, 0x00, 0x00, 0x00, // Size of image data
  0x16, 0x00, 0x00, 0x00, // Offset to image data
  // Minimal 1x1 image data
  0x00, 0x00, 0x00, 0x00, // BGRA pixel (transparent)
  0x00, 0x00, 0x00, 0x00, // AND mask
]);

fs.writeFileSync('public/favicon.ico', icoHeader);
console.log('✓ Created minimal favicon.ico');
