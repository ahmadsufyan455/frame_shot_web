/**
 * Film Border Frame Painter
 *
 * Style: Film strip edges, warm tones, Kodak-inspired typography.
 *
 * Layout:
 *  ┌──┬──────────────────────┬──┐  ← film strip perforations
 *  │░░│                      │░░│
 *  │░░│       Photo          │░░│  ← warm cream/sepia border
 *  │░░│                      │░░│
 *  ├──┴──────────────────────┴──┤
 *  │   KODAK   f/1.8  1/500  800│  ← warm bottom bar
 *  └─────────────────────────────┘
 *
 * TODO: Implement full painter:
 *   1. Fill background with warm cream (#f5edd6) or dark film (#1a1208)
 *   2. Draw film strip perforations on left and right edges
 *   3. Draw photo in the center with slight inner shadow
 *   4. Render Kodak-inspired typography for EXIF fields
 *   5. Add subtle grain/texture overlay (optional canvas noise)
 */

import type { FramePainter } from "../renderer";

export const paint: FramePainter = (canvas, image, exifData) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // TODO: Replace with full Film Border implementation
  ctx.fillStyle = "#1a1208";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const stripWidth = Math.floor(canvas.width * 0.06);
  ctx.drawImage(
    image,
    stripWidth,
    stripWidth,
    canvas.width - stripWidth * 2,
    canvas.height - stripWidth * 3
  );

  ctx.fillStyle = "#f5edd6";
  ctx.font = `${Math.floor(stripWidth * 0.8)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText(
    `${exifData.aperture ?? ""} · ${exifData.shutterSpeed ?? ""} · ${exifData.iso ?? ""}`,
    canvas.width / 2,
    canvas.height - Math.floor(stripWidth * 0.6)
  );
};
