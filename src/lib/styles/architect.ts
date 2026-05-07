/**
 * Architect Frame Painter
 *
 * Style: Grid lines, technical layout, viewfinder-inspired.
 *
 * Layout:
 *  ┌──┬──────────────────────┬──┐
 *  │  │  ···············     │  │  ← corner brackets + grid overlay
 *  │  │      Photo           │  │
 *  │  │  ···············     │  │
 *  └──┴──────────────────────┴──┘
 *   f/1.8  1/500s  ISO800  35mm    ← technical text, monospace, white
 *
 * TODO: Implement full painter:
 *   1. Fill background dark (#111111)
 *   2. Draw photo with viewfinder corner brackets (L-shaped)
 *   3. Overlay a subtle rule-of-thirds grid (low opacity lines)
 *   4. Render EXIF data in monospace technical font
 *   5. Add crosshair / reticle decoration in center (optional)
 */

import type { FramePainter } from "../renderer";

export const paint: FramePainter = (canvas, image, exifData) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // TODO: Replace with full Architect implementation
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const padding = Math.floor(canvas.width * 0.03);
  const barHeight = Math.floor(canvas.height * 0.1);
  const photoHeight = canvas.height - barHeight - padding * 2;

  ctx.drawImage(image, padding, padding, canvas.width - padding * 2, photoHeight);

  // Corner brackets (viewfinder aesthetic)
  const bLen = 20;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  // Top-left
  ctx.beginPath(); ctx.moveTo(padding, padding + bLen); ctx.lineTo(padding, padding); ctx.lineTo(padding + bLen, padding); ctx.stroke();
  // Top-right
  ctx.beginPath(); ctx.moveTo(canvas.width - padding - bLen, padding); ctx.lineTo(canvas.width - padding, padding); ctx.lineTo(canvas.width - padding, padding + bLen); ctx.stroke();
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(padding, padding + photoHeight - bLen); ctx.lineTo(padding, padding + photoHeight); ctx.lineTo(padding + bLen, padding + photoHeight); ctx.stroke();
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(canvas.width - padding - bLen, padding + photoHeight); ctx.lineTo(canvas.width - padding, padding + photoHeight); ctx.lineTo(canvas.width - padding, padding + photoHeight - bLen); ctx.stroke();

  ctx.fillStyle = "#aaaaaa";
  ctx.font = `${Math.floor(barHeight * 0.35)}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(
    `${exifData.aperture ?? "—"}  ${exifData.shutterSpeed ?? "—"}  ${exifData.iso ?? "—"}  ${exifData.focalLength ?? "—"}`,
    canvas.width / 2,
    canvas.height - Math.floor(barHeight * 0.3)
  );
};
