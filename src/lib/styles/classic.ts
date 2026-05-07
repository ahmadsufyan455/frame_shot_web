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

  // TODO: Replace with full Classic implementation
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Placeholder bottom bar
  const barHeight = Math.floor(canvas.height * 0.1);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

  ctx.fillStyle = "#111111";
  ctx.font = `${Math.floor(barHeight * 0.35)}px sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText(
    `${exifData.model ?? ""} · ${exifData.aperture ?? ""} · ${exifData.shutterSpeed ?? ""} · ${exifData.iso ?? ""}`,
    canvas.width - 16,
    canvas.height - barHeight / 2 + 6
  );
};
