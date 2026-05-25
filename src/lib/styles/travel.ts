/**
 * Travel Frame Painter
 *
 * Style: Gallery-print travel keepsake. Warm-white mat with a single photo
 * accompanied by a handwritten caption (location on the left, "Month 'YY"
 * on the right). No outer frame — minimalist poster look.
 *
 * Layout:
 *  - Mat side padding:      ~6.0% of width
 *  - Mat top padding:       ~6.0% of width
 *  - Bottom mat margin:     ~18% of width (where caption sits)
 *  - Photo: thin black hairline border, no rotation
 *  - Caption: Caveat handwritten, slate text (#1f2937)
 */

import type { FramePainter, SourceImage } from "../renderer";

const iw = (img: SourceImage) => ("naturalWidth" in img ? img.naturalWidth : img.width);
const ih = (img: SourceImage) => ("naturalHeight" in img ? img.naturalHeight : img.height);

export const paint: FramePainter = (canvas, image, exifData, options) => {
  const ctx = (canvas as unknown as HTMLCanvasElement).getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const showMetadata = options?.showMetadata ?? true;
  const weight = clamp(options?.borderWeight ?? 1, 0.5, 2);
  const matColor = options?.backgroundColor ?? "#fafafa";
  const textScale = clamp(options?.metadataTextScale ?? 1, 0.5, 2);
  // Piecewise: 0.5 → 0.55 (thin), 1 → 1, 2 → 1.4 (lower half bends to allow thinner mats)
  const borderScale = weight <= 1 ? 0.1 + weight * 0.9 : 1 + (weight - 1) * 0.4;

  const matSidePadding = Math.round(width * 0.060 * borderScale);
  const matTopPadding = Math.round(width * 0.060 * borderScale);
  const matBottomMargin = showMetadata
    ? Math.round(width * 0.180 * borderScale)
    : Math.round(width * 0.060 * borderScale);

  const innerW = Math.max(1, width - matSidePadding * 2);
  const imageAspect = iw(image) / ih(image);

  let totalHeight: number;
  let innerH: number;

  if (options?.aspectRatio) {
    totalHeight = Math.round(width / options.aspectRatio);
    innerH = Math.max(1, totalHeight - matTopPadding - matBottomMargin);
  } else {
    innerH = Math.round(innerW / imageAspect);
    totalHeight = matTopPadding + innerH + matBottomMargin;
  }

  canvas.width = width;
  canvas.height = totalHeight;

  // Mat
  ctx.fillStyle = matColor;
  ctx.fillRect(0, 0, width, totalHeight);

  // Photo with subtle outer shadow (gallery-print depth)
  const photoX = matSidePadding;
  const photoY = matTopPadding;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.20)";
  ctx.shadowBlur = Math.round(width * 0.022);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(width * 0.010);
  drawImageCover(ctx, image, photoX, photoY, innerW, innerH);
  ctx.restore();

  // Hairline border around photo
  const hairline = Math.max(1, Math.round(width * 0.0015));
  ctx.strokeStyle = "rgba(10, 10, 10, 0.85)";
  ctx.lineWidth = hairline;
  ctx.strokeRect(
    photoX + hairline / 2,
    photoY + hairline / 2,
    innerW - hairline,
    innerH - hairline
  );

  if (!showMetadata) return;

  // Caption row — sits ~58% through the bottom mat margin (slightly below center)
  const photoBottom = photoY + innerH;
  const captionY = photoBottom + Math.round(matBottomMargin * 0.58);
  const captionFontSize = Math.max(12, Math.round(width * 0.038 * textScale));
  const location = exifData.location?.trim();
  const dateText = formatTravelDate(exifData.dateTime);
  const isDarkMat = luminance(matColor) < 0.5;
  const primaryText = isDarkMat ? "#f3f4f6" : "#1f2937";
  const placeholderText = isDarkMat ? "rgba(243,244,246,0.45)" : "#9ca3af";

  ctx.textBaseline = "middle";

  if (location) {
    ctx.save();
    ctx.translate(photoX, captionY);
    ctx.rotate(degrees(-1.6));
    ctx.textAlign = "left";
    ctx.fillStyle = primaryText;
    ctx.font = `700 ${captionFontSize}px "Caveat", "Dancing Script", "Bradley Hand", "Comic Sans MS", cursive`;
    ctx.fillText(location, 0, 0);
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(photoX, captionY);
    ctx.rotate(degrees(-1.6));
    ctx.textAlign = "left";
    ctx.fillStyle = placeholderText;
    ctx.font = `400 italic ${captionFontSize}px "Caveat", "Dancing Script", "Bradley Hand", "Comic Sans MS", cursive`;
    ctx.fillText("Add location", 0, 0);
    ctx.restore();
  }

  if (dateText) {
    ctx.save();
    ctx.translate(photoX + innerW, captionY + Math.round(captionFontSize * 0.06));
    ctx.rotate(degrees(-0.7));
    ctx.textAlign = "right";
    ctx.fillStyle = primaryText;
    ctx.font = `700 ${captionFontSize}px "Caveat", "Dancing Script", "Bradley Hand", "Comic Sans MS", cursive`;
    ctx.fillText(dateText, 0, 0);
    ctx.restore();
  }
};

function degrees(value: number) {
  return (value * Math.PI) / 180;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatTravelDate(value?: string) {
  const parsed = parseExifDate(value);
  if (!parsed) return "";
  const month = parsed.toLocaleString("en-US", { month: "long" });
  const year = String(parsed.getFullYear() % 100).padStart(2, "0");
  return `${month} '${year}`;
}

function parseExifDate(value?: string) {
  const text = value?.trim();
  if (!text) return null;

  const isoMatch = text.match(/^(\d{4})[-:/](\d{1,2})[-:/](\d{1,2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsedIso = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(parsedIso.getTime())) return parsedIso;
  }

  const yearMonthMatch = text.match(/^(\d{4})[-:/](\d{1,2})$/);
  if (yearMonthMatch) {
    const [, year, month] = yearMonthMatch;
    const parsed = new Date(Number(year), Number(month) - 1, 1);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const monthMatch = text.match(/\b([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})\b/);
  if (monthMatch) {
    const [, monthName, day, year] = monthMatch;
    const monthIndex = monthNames.indexOf(monthName.toLowerCase());
    if (monthIndex >= 0) return new Date(Number(year), monthIndex, Number(day));
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

const monthNames = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

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

  let sx = 0;
  let sy = 0;
  let sw = iw(image);
  let sh = ih(image);

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
  if (c.length !== 6) return 1;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const toLinear = (v: number) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}
