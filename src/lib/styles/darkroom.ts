/**
 * Darkroom Frame Painter
 *
 * Style: Black frame, light text, monospace font, film-inspired layout.
 *
 * Layout:
 *  ┌─────────────────────────────┐  ← black border (top + sides)
 *  │                             │
 *  │          Photo              │
 *  │                             │
 *  ├─────────────────────────────┤
 *  │  CAMERA · LENS · SETTINGS  │  ← black bar, monospace, light text
 *  └─────────────────────────────┘
 *
 * TODO: Implement full painter:
 *   1. Fill canvas black
 *   2. Draw photo with uniform black border (padding ~5% each side)
 *   3. Render EXIF data in monospace font (Courier / system-ui mono)
 *   4. Add film-strip perforation decorations on left/right edges
 */

import type { FramePainter } from "../renderer";

export const paint: FramePainter = (canvas, image, exifData) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // TODO: Replace with full Darkroom implementation
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const padding = Math.floor(canvas.width * 0.04);
  const barHeight = Math.floor(canvas.height * 0.12);
  const photoHeight = canvas.height - barHeight - padding;

  ctx.drawImage(image, padding, padding, canvas.width - padding * 2, photoHeight - padding);

  ctx.fillStyle = "#cccccc";
  ctx.font = `${Math.floor(barHeight * 0.3)}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(
    `${exifData.model ?? "—"} | ${exifData.aperture ?? "—"} | ${exifData.shutterSpeed ?? "—"} | ${exifData.iso ?? "—"}`,
    canvas.width / 2,
    canvas.height - barHeight / 2 + 6
  );
};
