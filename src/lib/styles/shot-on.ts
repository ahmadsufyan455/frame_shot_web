/**
 * Shot On Frame Painter
 *
 * Style: White background, full-bleed photo (no rounded corners),
 * centered bottom bar with camera icon, "Shot on [Camera]" text,
 * and lens model below in secondary color.
 *
 * Layout (based on Figma design):
 *  ┌──────────────────────────────────┐
 *  │  padding                         │
 *  │  ┌────────────────────────────┐  │
 *  │  │                            │  │
 *  │  │     Photo (no radius)      │  │
 *  │  │                            │  │
 *  │  └────────────────────────────┘  │
 *  │                                  │
 *  │            [◉]                   │
 *  │     Shot on Sony ILCE-7CM2       │
 *  │         FE 35MM F1.8            │
 *  └──────────────────────────────────┘
 *
 * Proportions (relative to canvas width):
 *  - Padding: ~3.6% of width
 *  - Bottom bar height: ~20% of width
 *  - Icon circle: ~8% of width
 */

import type { FramePainter, SourceImage } from "../renderer";

const iw = (img: SourceImage) => "naturalWidth" in img ? img.naturalWidth : img.width;
const ih = (img: SourceImage) => "naturalHeight" in img ? img.naturalHeight : img.height;

export const paint: FramePainter = (canvas, image, exifData, options) => {
  const ctx = (canvas as unknown as HTMLCanvasElement).getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const showMetadata = options?.showMetadata ?? true;
  const showLogo = options?.showLogo ?? true;
  const weight = options?.borderWeight ?? 1;
  const bgColor = options?.backgroundColor ?? "#ffffff";
  const textScale = clamp(options?.metadataTextScale ?? 1, 0.5, 2);

  const basePadding = Math.round(width * 0.036);
  const padding = Math.round(basePadding * weight);

  const imgAreaW = width - padding * 2;
  const imageRadius = Math.round(width * 0.018);

  const iconSize = Math.round(width * 0.08);
  const iconTopGap = Math.round(width * 0.035);
  const textGapFromIcon = Math.round(width * 0.02);
  const modelFontSize = Math.round(width * 0.035 * textScale);
  const lensFontSize = Math.round(width * 0.026 * textScale);
  const lensGap = Math.round(modelFontSize * 0.6);
  const bottomPadding = Math.round(padding * 0.8);

  const hasModel = Boolean(exifData.model);
  const hasLens = Boolean(exifData.lensModel);
  const hasAnyText = hasModel || hasLens;

  let bottomBarHeight: number;
  if (!showMetadata) {
    bottomBarHeight = Math.round(padding * 0.5);
  } else if (!hasAnyText && !showLogo) {
    bottomBarHeight = Math.round(padding * 0.5);
  } else {
    bottomBarHeight = iconTopGap;
    if (showLogo) bottomBarHeight += iconSize + textGapFromIcon;
    else if (hasAnyText) bottomBarHeight += textGapFromIcon;
    if (hasModel) bottomBarHeight += modelFontSize;
    if (hasModel && hasLens) bottomBarHeight += lensGap;
    if (hasLens) bottomBarHeight += lensFontSize;
    bottomBarHeight += bottomPadding;
  }

  let totalHeight: number;
  let imgAreaH: number;

  if (options?.aspectRatio) {
    totalHeight = Math.round(width / options.aspectRatio);
    imgAreaH = Math.max(1, totalHeight - padding - bottomBarHeight);
  } else {
    const imgAspect = iw(image) / ih(image);
    imgAreaH = Math.round(imgAreaW / imgAspect);
    totalHeight = padding + imgAreaH + bottomBarHeight;
  }

  canvas.width = width;
  canvas.height = totalHeight;

  // --- Background ---
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, totalHeight);

  const imgX = padding;
  const imgY = padding;

  ctx.save();
  drawRoundedRect(ctx, imgX, imgY, imgAreaW, imgAreaH, imageRadius);
  ctx.clip();
  drawImageCover(ctx, image, imgX, imgY, imgAreaW, imgAreaH);
  ctx.restore();

  if (!showMetadata) return;

  // --- Bottom bar (centered content) ---
  const isDark = luminance(bgColor) < 0.5;
  const primaryColor = isDark ? "#ffffff" : "#1a1a1a";
  const secondaryColor = isDark ? "#a3a3a3" : "#737373";
  const iconBgColor = isDark ? "#262626" : "#f5f5f5";
  const iconStrokeColor = isDark ? "#a3a3a3" : "#404040";

  const centerX = width / 2;
  let cursorY = imgY + imgAreaH + iconTopGap;

  // Camera icon (centered)
  if (showLogo) {
    const iconX = centerX - iconSize / 2;
    drawCameraIcon(ctx, iconX, cursorY, iconSize, iconBgColor, iconStrokeColor);
    cursorY += iconSize + textGapFromIcon;
  } else {
    cursorY += textGapFromIcon;
  }

  if (hasModel) {
    const shotOnText = `Shot on ${exifData.model}`;
    ctx.fillStyle = primaryColor;
    ctx.font = `600 ${modelFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(shotOnText, centerX, cursorY);
    cursorY += modelFontSize + (hasLens ? lensGap : 0);
  }

  if (hasLens) {
    ctx.fillStyle = secondaryColor;
    ctx.font = `400 ${lensFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(exifData.lensModel!, centerX, cursorY);
  }
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// --- Helper: Draw image with "cover" behavior ---
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
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
  image: SourceImage,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const imgAspect = iw(image) / ih(image);
  const areaAspect = dw / dh;

  let sx = 0,
    sy = 0,
    sw = iw(image),
    sh = ih(image);

  if (imgAspect > areaAspect) {
    sw = ih(image) * areaAspect;
    sx = (iw(image) - sw) / 2;
  } else {
    sh = iw(image) / areaAspect;
    sy = (ih(image) - sh) / 2;
  }

  ctx.drawImage(image as CanvasImageSource, sx, sy, sw, sh, dx, dy, dw, dh);
}

// Relative luminance (0=black, 1=white) for contrast-adaptive text
function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const toLinear = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function drawCameraIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bgFill: string,
  strokeColor: string
) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  // Circle background
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = bgFill;
  ctx.fill();

  // Camera icon inside
  const iconScale = size * 0.45;
  const ix = centerX - iconScale / 2;
  const iy = centerY - iconScale / 2;

  ctx.save();
  ctx.translate(ix, iy);
  ctx.scale(iconScale / 24, iconScale / 24);

  ctx.beginPath();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Camera body
  ctx.moveTo(23, 19);
  ctx.quadraticCurveTo(23, 21, 21, 21);
  ctx.lineTo(3, 21);
  ctx.quadraticCurveTo(1, 21, 1, 19);
  ctx.lineTo(1, 8);
  ctx.quadraticCurveTo(1, 6, 3, 6);
  ctx.lineTo(7, 6);
  ctx.lineTo(9, 3);
  ctx.lineTo(15, 3);
  ctx.lineTo(17, 6);
  ctx.lineTo(21, 6);
  ctx.quadraticCurveTo(23, 6, 23, 8);
  ctx.closePath();
  ctx.stroke();

  // Lens circle
  ctx.beginPath();
  ctx.arc(12, 13, 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
