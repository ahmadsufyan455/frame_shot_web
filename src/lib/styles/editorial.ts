/**
 * Editorial Frame Painter
 *
 * Style: White editorial print frame with a full-width image block and a
 * centered bottom caption: bold serif brand, divider, and small exposure line.
 *
 * Layout (based on Figma node 83:2782):
 *  - Paper: #ffffff
 *  - Photo inset: ~4% of width
 *  - Bottom caption band: ~20% of width
 *  - Title: Georgia bold, uppercase, center aligned
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
  const bgColor = options?.backgroundColor ?? "#ffffff";
  const textScale = clamp(options?.metadataTextScale ?? 1, 0.5, 2);

  const padding = Math.round(width * 0.0405 * weight);
  const photoW = Math.max(1, width - padding * 2);
  const photoAspect = iw(image) / ih(image);
  const titleFontSize = Math.max(10, Math.round(width * 0.0455 * textScale));
  const detailsFontSize = Math.max(7, Math.round(width * 0.0203 * textScale));
  const titleLineHeight = Math.round(titleFontSize * 1.55);
  const detailsLineHeight = Math.round(detailsFontSize * 1.5);
  const titleToDividerGap = Math.max(3, Math.round(width * 0.010));
  const dividerToDetailsGap = Math.max(6, Math.round(width * 0.016));
  const captionPaddingY = Math.max(Math.round(width * 0.039), Math.round(detailsFontSize * 1.6));
  const captionContentHeight = titleLineHeight + titleToDividerGap + 1 + dividerToDetailsGap + detailsLineHeight;
  const captionHeight = showMetadata
    ? Math.max(Math.round(width * 0.202), captionContentHeight + captionPaddingY * 2)
    : Math.round(padding);

  let totalHeight: number;
  let photoH: number;

  if (options?.aspectRatio) {
    totalHeight = Math.round(width / options.aspectRatio);
    photoH = Math.max(1, totalHeight - padding - captionHeight);
  } else {
    photoH = Math.round(photoW / photoAspect);
    totalHeight = padding + photoH + captionHeight;
  }

  canvas.width = width;
  canvas.height = totalHeight;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, totalHeight);

  const photoX = padding;
  const photoY = padding;
  drawImageCover(ctx, image, photoX, photoY, photoW, photoH);

  if (!showMetadata) return;

  const brand = getBrandLabel(exifData.make, exifData.model);
  const details = [
    exifData.focalLength,
    exifData.aperture,
    exifData.shutterSpeed,
    exifData.iso,
  ].filter(Boolean).join(" \u2022 ");

  if (!brand && !details) return;

  const isDark = luminance(bgColor) < 0.5;
  const primaryColor = isDark ? "#ffffff" : "#000000";
  const secondaryColor = isDark ? "#a3a3a3" : "#737373";
  const centerX = width / 2;
  const captionTop = photoY + photoH;
  const captionCenterY = captionTop + captionHeight / 2;
  const groupTop = captionCenterY - captionContentHeight / 2;
  const titleBaselineY = groupTop + titleLineHeight * 0.74;
  const dividerY = groupTop + titleLineHeight + titleToDividerGap;
  const detailsBaselineY = dividerY + 1 + dividerToDetailsGap + detailsFontSize;

  if (brand) {
    ctx.fillStyle = primaryColor;
    ctx.font = `700 ${titleFontSize}px Georgia, "Times New Roman", serif`;
    drawLetterSpacedText(ctx, brand.toUpperCase(), centerX, titleBaselineY, titleFontSize * 0.1, "center");
  }

  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = Math.max(1, width * 0.002);
  ctx.beginPath();
  ctx.moveTo(centerX - Math.round(width * 0.0405), dividerY);
  ctx.lineTo(centerX + Math.round(width * 0.0405), dividerY);
  ctx.stroke();

  if (details) {
    ctx.fillStyle = secondaryColor;
    ctx.font = `400 ${detailsFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    drawLetterSpacedText(ctx, details.toUpperCase(), centerX, detailsBaselineY, detailsFontSize * 0.125, "center");
  }
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getBrandLabel(make?: string, model?: string) {
  const cleanMake = make?.trim();
  if (cleanMake) return cleanMake;

  const cleanModel = model?.trim();
  return cleanModel?.split(/\s+/)[0] ?? "";
}

function drawLetterSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  spacing: number,
  align: "center" | "left" | "right"
) {
  let totalWidth = 0;
  for (let i = 0; i < text.length; i++) {
    totalWidth += ctx.measureText(text[i]).width;
    if (i < text.length - 1) totalWidth += spacing;
  }

  let x = centerX;
  if (align === "center") x -= totalWidth / 2;
  if (align === "right") x -= totalWidth;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x, y);
    x += ctx.measureText(text[i]).width + spacing;
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
