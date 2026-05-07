/**
 * Fujifilm Sim Frame Painter
 *
 * Style: Teal and cream palette, square crop option, print receipt aesthetic.
 *
 * Layout:
 *  ┌─────────────────────────────┐  ← cream (#f0ece3) background
 *  │                             │
 *  │          Photo              │  ← optional square 1:1 crop
 *  │                             │
 *  ├─────────────────────────────┤
 *  │ FUJIFILM X-T5  CLASSIC CHROME│  ← teal accent, receipt typography
 *  │ f/2.0 · 1/250s · ISO 400    │
 *  └─────────────────────────────┘
 *
 * TODO: Implement full painter:
 *   1. Fill background with cream (#f0ece3)
 *   2. Handle optional 1:1 square crop (letterbox with cream bars)
 *   3. Render Fujifilm-style bottom info panel (teal accent line on top)
 *   4. Use condensed / receipt-style typography
 *   5. Display Film Simulation name if available (e.g. "CLASSIC CHROME")
 */

import type { FramePainter } from "../renderer";

export const paint: FramePainter = (canvas, image, exifData) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // TODO: Replace with full Fujifilm Sim implementation
  const barHeight = Math.floor(canvas.height * 0.15);
  const photoHeight = canvas.height - barHeight;

  ctx.fillStyle = "#f0ece3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, photoHeight);

  // Teal accent line
  ctx.fillStyle = "#2a9d8f";
  ctx.fillRect(0, photoHeight, canvas.width, 3);

  ctx.fillStyle = "#333333";
  ctx.font = `bold ${Math.floor(barHeight * 0.3)}px monospace`;
  ctx.textAlign = "left";
  ctx.fillText(
    `${exifData.make ?? ""} ${exifData.model ?? ""}`,
    16,
    photoHeight + barHeight * 0.45
  );
  ctx.font = `${Math.floor(barHeight * 0.25)}px monospace`;
  ctx.fillText(
    `${exifData.aperture ?? ""} · ${exifData.shutterSpeed ?? ""} · ${exifData.iso ?? ""}`,
    16,
    photoHeight + barHeight * 0.78
  );
};
