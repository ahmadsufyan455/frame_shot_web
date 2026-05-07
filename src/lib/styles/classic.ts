/**
 * Classic Frame Painter
 *
 * Style: White bottom bar, metadata on the right, clean and minimal.
 *
 * Layout:
 *  ┌─────────────────────────────┐
 *  │                             │
 *  │          Photo              │
 *  │                             │
 *  ├─────────────────────────────┤
 *  │  [Camera logo]  f/1.8 · 1/500s · ISO 800  │  ← white bar
 *  │                Sony ILCE-7CM2 · 35mm       │
 *  └─────────────────────────────┘
 *
 * TODO: Implement full painter:
 *   1. Draw photo onto canvas (respecting aspect ratio)
 *   2. Draw white bottom bar (height: ~10% of canvas height)
 *   3. Render camera brand logo (from /public/logos/ SVG)
 *   4. Render EXIF text fields aligned right
 */

import type { FramePainter } from "../renderer";

export const paint: FramePainter = (canvas, image, exifData) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Fill background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Calculate padding based on width to keep it proportional
  const paddingX = Math.floor(width * 0.08); 
  const paddingYTop = Math.floor(width * 0.08);
  const paddingYBottom = Math.floor(width * 0.20); 

  // Calculate inner image dimensions
  const imgAreaW = width - (paddingX * 2);
  const imgAreaH = height - (paddingYTop + paddingYBottom);

  // Maintain image aspect ratio within the allowed area
  const imgAspect = image.width / image.height;
  const areaAspect = imgAreaW / imgAreaH;

  let drawW = imgAreaW;
  let drawH = imgAreaH;
  
  if (imgAspect > areaAspect) {
    // Image is wider than area
    drawH = imgAreaW / imgAspect;
  } else {
    // Image is taller than area
    drawW = imgAreaH * imgAspect;
  }

  // Center image in the area
  const drawX = paddingX + (imgAreaW - drawW) / 2;
  const drawY = paddingYTop + (imgAreaH - drawH) / 2;

  // Add subtle shadow to image
  ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
  ctx.shadowBlur = Math.floor(width * 0.03);
  ctx.shadowOffsetY = Math.floor(width * 0.015);
  
  // Draw image
  ctx.drawImage(image, drawX, drawY, drawW, drawH);
  
  // Reset shadow for text
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Draw Text in the bottom padding area
  const textY = height - (paddingYBottom * 0.45);
  const fontSize = Math.floor(width * 0.022);
  
  // Left Side: Camera info
  ctx.fillStyle = "#111111";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
  
  const make = (exifData.make || "").toUpperCase();
  const model = exifData.model || "Unknown Camera";
  const cameraText = make ? `${make} ${model}` : model;
  ctx.fillText(cameraText, paddingX, textY);

  // Draw Lens info just below the camera text
  ctx.fillStyle = "#737373";
  ctx.font = `500 ${fontSize * 0.75}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
  const lensText = exifData.lensModel || "Unknown Lens";
  ctx.fillText(lensText, paddingX, textY + fontSize * 1.6);

  // Right Side: Settings
  ctx.fillStyle = "#111111";
  ctx.textAlign = "right";
  ctx.font = `600 ${fontSize * 0.9}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
  
  const focalLength = exifData.focalLength ? `${exifData.focalLength}` : "";
  const aperture = exifData.aperture ? `f/${exifData.aperture}` : "";
  const shutter = exifData.shutterSpeed ? `${exifData.shutterSpeed}s` : "";
  const iso = exifData.iso ? `ISO ${exifData.iso}` : "";

  const settingsText = [focalLength, aperture, shutter, iso].filter(Boolean).join("   ");
  ctx.fillText(settingsText, width - paddingX, textY);
};
