/**
 * Minimal Line Frame Painter
 *
 * Style: Hairline border, bottom-center metadata, no icons.
 *
 * Layout:
 *  ┌─────────────────────────────┐  ← 1px hairline border
 *  │                             │
 *  │          Photo              │
 *  │                             │
 *  └─────────────────────────────┘
 *        f/1.8 · 1/500s · ISO 800    ← text below image, centered
 *          Sony ILCE-7CM2 · 35mm
 *
 * TODO: Implement full painter:
 *   1. Draw photo filling canvas
 *   2. Draw 1px border around the entire frame (color: #e0e0e0 or #333)
 *   3. Render minimal text block below image, centered
 *   4. Two lines: settings on top, camera+lens on bottom
 *   5. No camera logo, no icons — typography only
 */

import type { FramePainter } from "../renderer";

export const paint: FramePainter = (canvas, image, exifData) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // TODO: Replace with full Minimal Line implementation
  const barHeight = Math.floor(canvas.height * 0.09);
  const photoHeight = canvas.height - barHeight;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, photoHeight);

  // Hairline border
  ctx.strokeStyle = "#cccccc";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

  ctx.fillStyle = "#333333";
  ctx.font = `${Math.floor(barHeight * 0.35)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(
    `${exifData.aperture ?? ""} · ${exifData.shutterSpeed ?? ""} · ${exifData.iso ?? ""}`,
    canvas.width / 2,
    photoHeight + barHeight * 0.5
  );
};
