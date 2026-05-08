/**
 * Classic Frame Painter
 *
 * Style: White background, photo with rounded corners, compact bottom bar
 * with camera icon on left and metadata split left/right.
 *
 * Layout (based on Figma design):
 *  ┌──────────────────────────────────┐
 *  │  padding                         │
 *  │  ┌────────────────────────────┐  │
 *  │  │                            │  │
 *  │  │     Photo (rounded 6px)    │  │
 *  │  │                            │  │
 *  │  └────────────────────────────┘  │
 *  │                                  │
 *  │  [◉] Camera Model    35mm f/1.8  │
 *  │      Lens Model     1/500s ISO…  │
 *  └──────────────────────────────────┘
 *
 * Proportions (relative to canvas width):
 *  - Padding: ~3.6% of width (12/329 from Figma)
 *  - Bottom bar height: ~17% of width (56/329)
 *  - Image corner radius: ~1.8% of width (6/329)
 *  - Icon circle: ~9.7% of width (32/329)
 */

import type { FramePainter } from "../renderer";

export const paint: FramePainter = (canvas, image, exifData, options) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const showMetadata = options?.showMetadata ?? true;
  const showLogo = options?.showLogo ?? true;
  const weight = options?.borderWeight ?? 1;
  const bgColor = options?.backgroundColor ?? "#ffffff";

  const basePadding = Math.round(width * 0.0365);
  const padding = Math.round(basePadding * weight);
  const imageRadius = Math.round(width * 0.018);
  const iconSize = Math.round(width * 0.097);
  const gapIconText = Math.round(width * 0.0365);
  const modelFontSize = Math.round(width * 0.0365);
  const lensFontSize = Math.round(width * 0.0304);

  const hasModel = Boolean(exifData.model);
  const hasLens = Boolean(exifData.lensModel);
  const hasTopRight = Boolean(exifData.focalLength || exifData.aperture);
  const hasBottomRight = Boolean(exifData.shutterSpeed || exifData.iso);
  const hasTopRow = hasModel || hasTopRight;
  const hasBottomRow = hasLens || hasBottomRight;
  const hasAnyContent = hasTopRow || hasBottomRow || showLogo;

  let bottomBarHeight: number;
  if (!showMetadata || !hasAnyContent) {
    bottomBarHeight = Math.round(padding * 0.5);
  } else if (hasTopRow && hasBottomRow) {
    bottomBarHeight = Math.round(width * 0.17);
  } else {
    bottomBarHeight = Math.round(width * 0.12);
  }

  const imgAreaW = width - padding * 2;
  const imgAspect = options?.aspectRatio ?? image.naturalWidth / image.naturalHeight;
  const imgAreaH = Math.round(imgAreaW / imgAspect);

  const barGap = Math.round(padding * 0.3);
  const totalHeight = padding + imgAreaH + barGap + bottomBarHeight + Math.round(padding * 0.3);

  canvas.width = width;
  canvas.height = totalHeight;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, totalHeight);

  // --- Draw image with rounded corners ---
  const imgX = padding;
  const imgY = padding;

  // Clip to rounded rect for the image
  ctx.save();
  drawRoundedRect(ctx, imgX, imgY, imgAreaW, imgAreaH, imageRadius);
  ctx.clip();

  // Draw image filling the area (cover)
  drawImageCover(ctx, image, imgX, imgY, imgAreaW, imgAreaH);

  ctx.restore();

  if (!showMetadata || !hasAnyContent) return;

  const barY = imgY + imgAreaH + barGap;
  const barContentX = padding + Math.round(basePadding * 0.12);
  const barContentW = imgAreaW - Math.round(basePadding * 0.24);
  const barCenterY = barY + bottomBarHeight / 2;

  const textLeftX = showLogo
    ? barContentX + iconSize + gapIconText
    : barContentX;

  const isDark = luminance(bgColor) < 0.5;
  const primaryColor = isDark ? "#ffffff" : "#000000";
  const secondaryColor = isDark ? "#a3a3a3" : "#737373";
  const iconBgColor = isDark ? "#262626" : "#f5f5f5";
  const iconStrokeColor = isDark ? "#a3a3a3" : "#525252";

  if (showLogo) {
    drawCameraIcon(ctx, barContentX, barCenterY - iconSize / 2, iconSize, iconBgColor, iconStrokeColor);
  }

  const textRightX = barContentX + barContentW;
  const settingsFontSize = Math.round(width * 0.0334);

  if (hasTopRow && hasBottomRow) {
    const modelY = barCenterY - Math.round(modelFontSize * 0.15);
    const lensY = modelY + Math.round(modelFontSize * 1.3);

    if (hasModel) {
      ctx.fillStyle = primaryColor;
      ctx.font = `600 ${modelFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(exifData.model!, textLeftX, modelY);
    }

    if (hasLens) {
      ctx.fillStyle = secondaryColor;
      ctx.font = `400 ${lensFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(exifData.lensModel!, textLeftX, lensY);
    }

    if (hasTopRight) {
      const topRight = [exifData.focalLength, exifData.aperture].filter(Boolean).join(" ");
      ctx.fillStyle = primaryColor;
      ctx.font = `500 ${settingsFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(topRight, textRightX, modelY);
    }

    if (hasBottomRight) {
      const bottomRight = [exifData.shutterSpeed, exifData.iso].filter(Boolean).join(" ");
      ctx.fillStyle = secondaryColor;
      ctx.font = `400 ${lensFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(bottomRight, textRightX, lensY);
    }
  } else {
    const singleRowY = barCenterY + Math.round(modelFontSize * 0.3);

    if (hasModel) {
      ctx.fillStyle = primaryColor;
      ctx.font = `600 ${modelFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(exifData.model!, textLeftX, singleRowY);
    } else if (hasLens) {
      ctx.fillStyle = secondaryColor;
      ctx.font = `400 ${lensFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(exifData.lensModel!, textLeftX, singleRowY);
    }

    if (hasTopRight) {
      const topRight = [exifData.focalLength, exifData.aperture].filter(Boolean).join(" ");
      ctx.fillStyle = primaryColor;
      ctx.font = `500 ${settingsFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(topRight, textRightX, singleRowY);
    } else if (hasBottomRight) {
      const bottomRight = [exifData.shutterSpeed, exifData.iso].filter(Boolean).join(" ");
      ctx.fillStyle = secondaryColor;
      ctx.font = `400 ${lensFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(bottomRight, textRightX, singleRowY);
    }
  }
};

// --- Helper: Draw rounded rectangle path ---
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

// --- Helper: Draw image with "cover" behavior ---
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
    // Image is wider — crop sides
    sw = image.naturalHeight * areaAspect;
    sx = (image.naturalWidth - sw) / 2;
  } else {
    // Image is taller — crop top/bottom
    sh = image.naturalWidth / areaAspect;
    sy = (image.naturalHeight - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
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

  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = bgFill;
  ctx.fill();

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

  // Camera body rectangle with rounded corners
  // path: M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z
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

  // Lens circle: circle cx="12" cy="13" r="4"
  ctx.beginPath();
  ctx.arc(12, 13, 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
