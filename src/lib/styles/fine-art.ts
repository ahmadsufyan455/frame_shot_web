/**
 * Fine Art Frame Painter
 *
 * Style: Off-white gallery paper, asymmetrical photo placement,
 * deep bottom margin, subtle print shadow, and right-aligned serif metadata.
 *
 * Layout (based on Figma node 118:10):
 *  - Paper: #fdfdfc
 *  - Photo: ~7% top/side padding
 *  - Bottom: large gallery-print margin
 *  - Metadata: bottom-right museum-plaque treatment in Georgia
 */

import type { FramePainter, SourceImage } from "../renderer";

const iw = (img: SourceImage) => "naturalWidth" in img ? img.naturalWidth : img.width;
const ih = (img: SourceImage) => "naturalHeight" in img ? img.naturalHeight : img.height;

export const paint: FramePainter = (canvas, image, exifData, options) => {
  const ctx = (canvas as unknown as HTMLCanvasElement).getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const showMetadata = options?.showMetadata ?? true;
  const weight = clamp(options?.borderWeight ?? 1, 0.5, 2);
  const bgColor = options?.backgroundColor ?? "#fdfdfc";
  const textScale = clamp(options?.metadataTextScale ?? 1, 0.5, 2);
  const model = exifData.model?.trim();
  const date = formatPlaqueDate(exifData.dateTime);
  const hasMetadata = showMetadata && Boolean(model || date);
  const borderScale = getFineArtBorderScale(weight);

  const topPadding = Math.round(width * 0.070 * borderScale);
  const sidePadding = Math.round(width * 0.070 * borderScale);
  const photoW = Math.max(1, width - sidePadding * 2);
  const photoAspect = iw(image) / ih(image);
  const modelFontSize = Math.max(8, Math.round(width * 0.029 * textScale));
  const dateFontSize = Math.max(7, Math.round(width * 0.023 * textScale));
  const bottomInset = Math.max(Math.round(width * 0.038), Math.round(dateFontSize * 1.2));
  const photoToPlaqueGap = Math.round(width * 0.022);
  const lineToModelGap = Math.max(Math.round(width * 0.033), Math.round(modelFontSize * 1.35));
  const modelToDateGap = Math.max(Math.round(width * 0.050), Math.round(dateFontSize * 1.65));
  const lineToDateGap = Math.max(Math.round(width * 0.033), Math.round(dateFontSize * 1.35));
  const plaqueContentHeight = model
    ? lineToModelGap + (date ? modelToDateGap : 0)
    : lineToDateGap;
  const metadataBottomMargin = hasMetadata
    ? photoToPlaqueGap + plaqueContentHeight + bottomInset
    : 0;
  const galleryBottomMargin = Math.round(width * 0.187 * borderScale);
  const minBottomMargin = Math.max(galleryBottomMargin, metadataBottomMargin);

  let totalHeight: number;
  let photoH: number;

  if (options?.aspectRatio) {
    totalHeight = Math.round(width / options.aspectRatio);
    photoH = Math.max(1, totalHeight - topPadding - minBottomMargin);
  } else {
    photoH = Math.round(photoW / photoAspect);
    totalHeight = topPadding + photoH + minBottomMargin;
  }

  canvas.width = width;
  canvas.height = totalHeight;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, totalHeight);

  const photoX = sidePadding;
  const photoY = topPadding;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
  ctx.shadowBlur = Math.round(width * 0.044);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(width * 0.023);
  drawImageCover(ctx, image, photoX, photoY, photoW, photoH);
  ctx.restore();

  if (!showMetadata) return;

  if (!hasMetadata) return;

  const rightX = photoX + photoW;
  const lineW = Math.round(width * 0.094);
  const photoBottom = photoY + photoH;
  const bottomMargin = totalHeight - photoBottom;
  const centeredLineY = photoBottom + (bottomMargin - plaqueContentHeight) / 2;
  const minLineY = photoBottom + photoToPlaqueGap;
  const maxLineY = totalHeight - bottomInset - plaqueContentHeight;
  const lineY = clamp(centeredLineY, minLineY, Math.max(minLineY, maxLineY));
  const modelY = model ? lineY + lineToModelGap : 0;
  const dateY = model
    ? modelY + (date ? modelToDateGap : 0)
    : lineY + lineToDateGap;
  const isDark = luminance(bgColor) < 0.5;

  ctx.fillStyle = isDark ? "#f5f5f5" : "#262626";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";

  ctx.strokeStyle = isDark ? "rgba(245, 245, 245, 0.35)" : "#d4d4d4";
  ctx.lineWidth = Math.max(1, width * 0.002);
  ctx.beginPath();
  ctx.moveTo(rightX - lineW, lineY);
  ctx.lineTo(rightX, lineY);
  ctx.stroke();

  if (model) {
    ctx.font = `400 ${modelFontSize}px Georgia, "Times New Roman", serif`;
    drawLetterSpacedText(ctx, model.toUpperCase(), rightX, modelY, Math.max(0, modelFontSize * 0.1), "right");
  }

  if (date) {
    ctx.fillStyle = isDark ? "rgba(245, 245, 245, 0.58)" : "#a1a1a1";
    ctx.font = `400 ${dateFontSize}px Georgia, "Times New Roman", serif`;
    drawLetterSpacedText(ctx, date, rightX, dateY, Math.max(0, dateFontSize * 0.05), "right");
  }
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getFineArtBorderScale(weight: number) {
  if (weight <= 1) return 0.85 + weight * 0.15;
  return 1 + (weight - 1) * 0.35;
}

function formatPlaqueDate(value?: string) {
  const text = value?.trim();
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function drawLetterSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: "left" | "right"
) {
  let totalWidth = 0;
  for (let i = 0; i < text.length; i++) {
    totalWidth += ctx.measureText(text[i]).width;
    if (i < text.length - 1) totalWidth += spacing;
  }

  let cursorX = align === "right" ? x - totalWidth : x;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], cursorX, y);
    cursorX += ctx.measureText(text[i]).width + spacing;
  }
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

function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const toLinear = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}
