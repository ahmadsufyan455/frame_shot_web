/**
 * Minimal Line Frame Painter
 *
 * Style: White background, photo with thin inset border overlay,
 * pill-shaped metadata badge centered at the bottom edge of the photo.
 *
 * Layout (based on Figma design):
 *  ┌──────────────────────────────────┐
 *  │  padding                         │
 *  │  ┌────────────────────────────┐  │
 *  │  │  ┌──────────────────────┐  │  │
 *  │  │  │  thin white border   │  │  │
 *  │  │  │                      │  │  │
 *  │  │  │       Photo          │  │  │
 *  │  │  │                      │  │  │
 *  │  │  └──────────────────────┘  │  │
 *  │  │     ┌──────────────┐       │  │
 *  │  │     │ ILCE • 35mm  │       │  │
 *  │  │     └──────────────┘       │  │
 *  │  └────────────────────────────┘  │
 *  └──────────────────────────────────┘
 *
 * Proportions (relative to canvas width):
 *  - Outer padding: ~5.4% of width
 *  - Inset border offset: ~3.6% of width
 *  - Border stroke: 0.5px (scaled)
 *  - Pill badge: centered at bottom of photo, overlapping edge
 */

import type { FramePainter } from "../renderer";

export const paint: FramePainter = (canvas, image, exifData, options) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const showMetadata = options?.showMetadata ?? true;
  const weight = options?.borderWeight ?? 1;
  const bgColor = options?.backgroundColor ?? "#ffffff";

  const outerPadding = Math.round(width * 0.054 * weight);

  const imgAreaW = width - outerPadding * 2;
  const imgAspect = options?.aspectRatio ?? image.naturalWidth / image.naturalHeight;
  const imgAreaH = Math.round(imgAreaW / imgAspect);

  const totalHeight = outerPadding + imgAreaH + outerPadding;

  canvas.width = width;
  canvas.height = totalHeight;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, totalHeight);

  const imgX = outerPadding;
  const imgY = outerPadding;
  drawImageCover(ctx, image, imgX, imgY, imgAreaW, imgAreaH);

  // Inset border overlay on the photo
  const borderInset = Math.round(width * 0.036);
  const borderX = imgX + borderInset;
  const borderY = imgY + borderInset;
  const borderW = imgAreaW - borderInset * 2;
  const borderH = imgAreaH - borderInset * 2;
  const borderStroke = Math.max(0.5, width * 0.001);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = borderStroke;
  ctx.strokeRect(borderX, borderY, borderW, borderH);

  if (!showMetadata) return;

  const parts = [
    exifData.model,
    exifData.focalLength,
    exifData.aperture,
  ].filter(Boolean);

  if (parts.length === 0) return;

  const pillText = parts.join(" \u2022 ").toUpperCase();

  const fontSize = Math.round(width * 0.016);
  const letterSpacing = fontSize * 0.13;
  const pillPaddingX = Math.round(width * 0.027);
  const pillPaddingY = Math.round(fontSize * 0.6);
  const pillRadius = Math.round(width * 0.02);

  ctx.font = `600 ${fontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const baseTextWidth = ctx.measureText(pillText).width;
  const textWidth = baseTextWidth + letterSpacing * (pillText.length - 1);

  const pillW = textWidth + pillPaddingX * 2;
  const pillH = fontSize + pillPaddingY * 2;
  const pillX = width / 2 - pillW / 2;
  const pillBottomMargin = Math.round(borderInset * 0.6);
  const pillY = borderY + borderH - pillH - pillBottomMargin;

  // Pill background with shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
  ctx.shadowBlur = Math.round(width * 0.006);
  ctx.shadowOffsetY = Math.round(width * 0.002);

  ctx.beginPath();
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillRadius);
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fill();
  ctx.restore();

  // Pill text with letter-spacing
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.font = `600 ${fontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  drawLetterSpacedText(ctx, pillText, width / 2, pillY + pillH / 2, letterSpacing);
};

function drawLetterSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  spacing: number
) {
  let totalWidth = 0;
  for (let i = 0; i < text.length; i++) {
    totalWidth += ctx.measureText(text[i]).width;
    if (i < text.length - 1) totalWidth += spacing;
  }

  let x = centerX - totalWidth / 2;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x, centerY);
    x += ctx.measureText(text[i]).width + spacing;
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const imgAspect = image.naturalWidth / image.naturalHeight;
  const areaAspect = dw / dh;

  let sx = 0,
    sy = 0,
    sw = image.naturalWidth,
    sh = image.naturalHeight;

  if (imgAspect > areaAspect) {
    sw = image.naturalHeight * areaAspect;
    sx = (image.naturalWidth - sw) / 2;
  } else {
    sh = image.naturalWidth / areaAspect;
    sy = (image.naturalHeight - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}
