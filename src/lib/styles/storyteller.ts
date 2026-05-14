/**
 * Storyteller Frame Painter
 *
 * Style: A romantic, nostalgic journal page. Warm paper background with subtle
 * grain texture, photo mounted as a "pasted print" with white border and inner
 * shadow, and typewriter-style metadata arranged as a narrative entry.
 *
 * Layout (based on Figma node 136:417):
 *  ┌──────────────────────────────────┐  ← warm paper (#F9F6F0)
 *  │  padding                         │
 *  │  ┌────────────────────────────┐  │
 *  │  │ ┌────────────────────────┐ │  │  ← white card + border
 *  │  │ │                        │ │  │
 *  │  │ │   Photo (faded)        │ │  │
 *  │  │ │                        │ │  │
 *  │  │ └────────────────────────┘ │  │
 *  │  └────────────────────────────┘  │
 *  │                                  │
 *  │      VOL. 2026 — PAGE 3         │
 *  │     "2026-05-03 at 14:32"       │
 *  │  ─────────────────────────────── │
 *  │          YOGYAKARTA             │
 *  │    CAPTURED ON SONY ILCE-7CM2   │
 *  └──────────────────────────────────┘
 *
 * Proportions (relative to canvas width):
 *  - Outer padding: 24 / 329.328 = ~7.3% of width
 *  - Card border: 1 / 329.328 = ~0.3% of width
 *  - Card inner padding: 8 / 329.328 = ~2.4% of width
 *  - Metadata starts ~20px below the pasted print
 */

import type { FramePainter, SourceImage } from "../renderer";

const iw = (img: SourceImage) => "naturalWidth" in img ? img.naturalWidth : img.width;
const ih = (img: SourceImage) => "naturalHeight" in img ? img.naturalHeight : img.height;

const PAPER_COLOR = "#F9F6F0";
const CARD_BG = "#ffffff";
const CARD_BORDER = "#d4d4d4";
const TEXT_PRIMARY = "#262626";
const TEXT_SECONDARY = "#5f5f5f";
const TEXT_LOCATION = "#3f3f3f";
const TEXT_CAMERA = "#7a7a7a";
const DIVIDER_COLOR = "rgba(212,212,212,0.6)";

export const paint: FramePainter = (canvas, image, exifData, options) => {
  const ctx = (canvas as unknown as HTMLCanvasElement).getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const showMetadata = options?.showMetadata ?? true;
  const weight = clamp(options?.borderWeight ?? 1, 0.5, 2);
  const bgColor = options?.backgroundColor ?? PAPER_COLOR;
  const textScale = clamp(options?.metadataTextScale ?? 1, 0.5, 2);

  // Layout proportions matched to Figma (329.328px reference width)
  const padding = Math.round(width * 0.073 * weight);
  const cardBorder = Math.max(1, Math.round(width * 0.003));
  const cardInnerPad = Math.round(width * 0.024);

  const headerFontSize = Math.round(width * 0.0305 * textScale);
  const dateFontSize = Math.round(width * 0.0245 * textScale);
  const footerFontSize = Math.round(width * 0.0245 * textScale);
  const headerLineHeight = Math.round(headerFontSize * 1.42);
  const dateLineHeight = Math.round(dateFontSize * 1.42);
  const footerLineHeight = Math.round(footerFontSize * 1.52);
  const headerTracking = headerFontSize * 0.35;
  const dateTracking = dateFontSize * 0.05;
  const footerTracking = footerFontSize * 0.025;

  const gapPhotoToHeader = Math.round(width * 0.052);
  const gapHeaderToDate = Math.round(width * 0.009);
  const gapDateToDivider = Math.round(width * 0.021);
  const gapDividerToFooter = Math.round(width * 0.028);
  const gapFooterLines = Math.round(width * 0.014);
  const bottomPadding = Math.round(width * 0.040);

  const cardContentW = width - padding * 2 - cardBorder * 2 - cardInnerPad * 2;
  const cardOuterW = width - padding * 2;

  const { headerText, dateText, locationText, cameraText } = buildMetadataStrings(exifData);
  const hasHeader = Boolean(headerText);
  const hasDate = Boolean(dateText);
  const hasLocation = Boolean(locationText);
  const hasCamera = Boolean(cameraText);

  let metadataHeight: number;
  if (!showMetadata || (!hasHeader && !hasDate && !hasLocation && !hasCamera)) {
    metadataHeight = padding;
  } else {
    metadataHeight = gapPhotoToHeader;
    if (hasHeader) metadataHeight += headerLineHeight;
    if (hasHeader && hasDate) metadataHeight += gapHeaderToDate;
    if (hasDate) metadataHeight += dateLineHeight;
    metadataHeight += gapDateToDivider + 1 + gapDividerToFooter;
    if (hasLocation) metadataHeight += footerLineHeight;
    if (hasLocation && hasCamera) metadataHeight += gapFooterLines;
    if (hasCamera) metadataHeight += footerLineHeight;
    metadataHeight += bottomPadding;
  }

  let totalHeight: number;
  let imgAreaH: number;

  const cardOuterH_overhead = cardBorder * 2 + cardInnerPad * 2;

  if (options?.aspectRatio) {
    totalHeight = Math.round(width / options.aspectRatio);
    const cardOuterH = Math.max(1, totalHeight - padding - metadataHeight);
    imgAreaH = Math.max(1, cardOuterH - cardOuterH_overhead);
  } else {
    const imgAspect = iw(image) / ih(image);
    imgAreaH = Math.round(cardContentW / imgAspect);
    totalHeight = Math.round(padding + cardOuterH_overhead + imgAreaH + metadataHeight);
  }

  canvas.width = width;
  canvas.height = totalHeight;

  // Paper background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, totalHeight);

  // Paper grain texture
  drawPaperGrain(ctx, width, totalHeight);

  // Card (white mount with border)
  const cardX = padding;
  const cardY = padding;
  const cardH = cardOuterH_overhead + imgAreaH;

  ctx.fillStyle = CARD_BG;
  ctx.fillRect(cardX, cardY, cardOuterW, cardH);
  ctx.strokeStyle = CARD_BORDER;
  ctx.lineWidth = cardBorder;
  ctx.strokeRect(cardX + cardBorder / 2, cardY + cardBorder / 2, cardOuterW - cardBorder, cardH - cardBorder);

  // Photo inside card
  const photoX = cardX + cardBorder + cardInnerPad;
  const photoY = cardY + cardBorder + cardInnerPad;
  const photoW = cardContentW;
  const photoH = imgAreaH;

  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(photoX, photoY, photoW, photoH);

  // Draw photo with slight fade
  ctx.save();
  ctx.filter = "contrast(0.95) saturate(0.9)";
  drawImageCover(ctx, image, photoX, photoY, photoW, photoH);
  ctx.restore();

  // Card inner shadow
  drawInnerShadow(ctx, cardX, cardY, cardOuterW, cardH, 10, "rgba(0,0,0,0.05)");

  if (!showMetadata || (!hasHeader && !hasDate && !hasLocation && !hasCamera)) {
    drawCanvasInnerShadow(ctx, width, totalHeight);
    return;
  }

  // Metadata section
  const centerX = width / 2;
  let cursorY = cardY + cardH + gapPhotoToHeader;

  // Header: VOL. YYYY — PAGE DD
  if (hasHeader) {
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.font = `700 ${headerFontSize}px "Courier Prime", "Courier New", Courier, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    drawLetterSpacedText(ctx, headerText.toUpperCase(), centerX, cursorY, headerTracking, "center");
    cursorY += headerLineHeight + gapHeaderToDate;
  }

  // Date: "YYYY-MM-DD at HH:MM"
  if (hasDate) {
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.font = `italic ${dateFontSize}px "Courier Prime", "Courier New", Courier, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    drawLetterSpacedText(ctx, dateText, centerX, cursorY, dateTracking, "center");
    cursorY += dateLineHeight + gapDateToDivider;
  } else {
    cursorY += gapDateToDivider;
  }

  // Divider line
  const dividerW = Math.round(cardOuterW * 0.95);
  ctx.strokeStyle = DIVIDER_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - dividerW / 2, cursorY);
  ctx.lineTo(centerX + dividerW / 2, cursorY);
  ctx.stroke();
  cursorY += 1 + gapDividerToFooter;

  // Location
  if (hasLocation) {
    ctx.fillStyle = TEXT_LOCATION;
    ctx.font = `400 ${footerFontSize}px "Courier Prime", "Courier New", Courier, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    drawLetterSpacedText(ctx, locationText.toUpperCase(), centerX, cursorY, footerTracking, "center");
    cursorY += footerLineHeight + gapFooterLines;
  }

  // Camera info
  if (hasCamera) {
    ctx.fillStyle = TEXT_CAMERA;
    ctx.font = `400 ${footerFontSize}px "Courier Prime", "Courier New", Courier, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    drawLetterSpacedText(ctx, cameraText.toUpperCase(), centerX, cursorY, footerTracking, "center");
  }

  drawCanvasInnerShadow(ctx, width, totalHeight);
};

function buildMetadataStrings(exifData: Parameters<FramePainter>[2]) {
  let headerText = "";
  let dateText = "";

  if (exifData.dateTime) {
    const parsed = parseDateParts(exifData.dateTime);
    if (parsed) {
      headerText = `Vol. ${parsed.year} \u2014 Page ${parsed.day}`;
      dateText = `\u201C${parsed.year}-${parsed.month}-${parsed.day} at ${parsed.time}\u201D`;
    }
  }

  const locationText = exifData.location?.trim() ?? "";

  const make = exifData.make?.trim() ?? "";
  const model = exifData.model?.trim() ?? "";
  let cameraText = "";
  if (make && model) {
    const modelLower = model.toLowerCase();
    const makeLower = make.toLowerCase();
    if (modelLower.startsWith(makeLower)) {
      cameraText = `Captured on ${model}`;
    } else {
      cameraText = `Captured on ${make} ${model}`;
    }
  } else if (model) {
    cameraText = `Captured on ${model}`;
  } else if (make) {
    cameraText = `Captured on ${make}`;
  }

  return { headerText, dateText, locationText, cameraText };
}

function parseDateParts(dateStr: string): { year: string; month: string; day: string; time: string } | null {
  // Try to parse formats like "May 3, 2026 at 14:32", "May 3, 2026 · 14:32", or "2026-05-03 14:32".
  const dateMatch = dateStr.match(/(\w+)\s+(\d+),?\s+(\d{4})(?:,|\s|·|\bat\b)*\s*(\d{1,2}:\d{2})/i);
  if (dateMatch) {
    const monthNames: Record<string, string> = {
      january: "01", february: "02", march: "03", april: "04",
      may: "05", june: "06", july: "07", august: "08",
      september: "09", october: "10", november: "11", december: "12",
    };
    const monthNum = monthNames[dateMatch[1].toLowerCase()] ?? "01";
    const day = dateMatch[2].padStart(2, "0");
    const year = dateMatch[3];
    const time = dateMatch[4];
    return { year, month: monthNum, day, time };
  }

  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})(?:\s+|T)(\d{1,2}:\d{2})/);
  if (isoMatch) {
    return { year: isoMatch[1], month: isoMatch[2], day: isoMatch[3], time: isoMatch[4] };
  }

  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function drawLetterSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: "left" | "center" | "right"
) {
  let totalWidth = 0;
  for (let i = 0; i < text.length; i++) {
    totalWidth += ctx.measureText(text[i]).width;
    if (i < text.length - 1) totalWidth += spacing;
  }

  let cursorX = x;
  if (align === "center") cursorX -= totalWidth / 2;
  if (align === "right") cursorX -= totalWidth;

  ctx.textAlign = "left";
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], cursorX, y);
    cursorX += ctx.measureText(text[i]).width + spacing;
  }
}

function drawPaperGrain(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.globalCompositeOperation = "multiply";

  const grainSize = 3;
  for (let y = 0; y < h; y += grainSize) {
    for (let x = 0; x < w; x += grainSize) {
      const noise = pseudoNoise(x, y);
      const brightness = Math.floor(112 + noise * 72);
      ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
      ctx.fillRect(x, y, grainSize, grainSize);
    }
  }

  ctx.restore();
}

function pseudoNoise(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function drawCanvasInnerShadow(ctx: CanvasRenderingContext2D, width: number, height: number) {
  drawInnerShadow(ctx, 0, 0, width, height, Math.round(width * 0.012), "rgba(0,0,0,0.05)", Math.round(width * 0.006));
}

function drawInnerShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  blur: number,
  color: string,
  offsetY = 0
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = offsetY;

  const offset = blur + 1;
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.beginPath();
  ctx.rect(x - offset, y - offset, w + offset * 2, offset);
  ctx.rect(x - offset, y + h, w + offset * 2, offset);
  ctx.rect(x - offset, y - offset, offset, h + offset * 2);
  ctx.rect(x + w, y - offset, offset, h + offset * 2);
  ctx.fill();

  ctx.restore();
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
