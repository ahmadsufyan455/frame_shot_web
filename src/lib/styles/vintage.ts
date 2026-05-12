/**
 * Vintage Frame Painter
 *
 * Style: Off-white postcard paper with subtle texture, taped photo print,
 * warm vintage image treatment, stamped date, and handwritten metadata.
 *
 * Layout (based on Figma node 125:756):
 *  - Paper: #f4f1ea
 *  - Photo print: #fafafa, -1deg rotation, shadow, 4% inner border
 *  - Tape: top-center, translucent beige, -1deg rotation
 *  - Stamp: bottom-right, red double ring, 15deg rotation
 *  - Metadata: bottom-left, cursive fallback, -2deg rotation
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
  const bgColor = options?.backgroundColor ?? "#f4f1ea";
  const textScale = clamp(options?.metadataTextScale ?? 1, 0.5, 2);
  const borderScale = 0.85 + weight * 0.15;

  const topPadding = Math.round(width * 0.089 * borderScale);
  const sidePadding = Math.round(width * 0.097 * borderScale);
  const bottomMargin = showMetadata
    ? Math.round(width * 0.210 * borderScale)
    : Math.round(width * 0.070 * borderScale);
  const paperW = Math.max(1, width - sidePadding * 2);
  const printPadding = Math.round(paperW * 0.040);
  const innerW = Math.max(1, paperW - printPadding * 2);
  const imageAspect = iw(image) / ih(image);

  let totalHeight: number;
  let paperH: number;
  let innerH: number;

  if (options?.aspectRatio) {
    totalHeight = Math.round(width / options.aspectRatio);
    paperH = Math.max(1, totalHeight - topPadding - bottomMargin);
    innerH = Math.max(1, paperH - printPadding * 2);
  } else {
    innerH = Math.round(innerW / imageAspect);
    paperH = innerH + printPadding * 2;
    totalHeight = topPadding + paperH + bottomMargin;
  }

  canvas.width = width;
  canvas.height = totalHeight;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, totalHeight);
  drawPaperTexture(ctx, width, totalHeight);

  const paperX = sidePadding;
  const paperY = topPadding;
  const paperCenterX = paperX + paperW / 2;
  const paperCenterY = paperY + paperH / 2;
  const photoRotation = degrees(-1);

  ctx.save();
  ctx.translate(paperCenterX, paperCenterY);
  ctx.rotate(photoRotation);
  ctx.translate(-paperW / 2, -paperH / 2);

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.16)";
  ctx.shadowBlur = Math.round(width * 0.012);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(width * 0.012);
  ctx.fillStyle = "#fafafa";
  ctx.fillRect(0, 0, paperW, paperH);
  ctx.restore();

  ctx.fillStyle = "#fafafa";
  ctx.fillRect(0, 0, paperW, paperH);

  ctx.save();
  ctx.beginPath();
  ctx.rect(printPadding, printPadding, innerW, innerH);
  ctx.clip();
  ctx.filter = "sepia(0.25) contrast(0.95) saturate(0.8)";
  drawImageCover(ctx, image, printPadding, printPadding, innerW, innerH);
  ctx.restore();

  drawStamp(ctx, paperW * 0.91, paperH * 0.959, width, formatStampDate(exifData.dateTime));
  ctx.restore();

  drawTape(ctx, width);

  if (showMetadata) {
    drawHandwrittenMetadata(ctx, exifData, width, paperX, paperY + paperH, totalHeight, textScale);
  }
};

function drawTape(ctx: CanvasRenderingContext2D, width: number) {
  const tapeW = Math.round(width * 0.292);
  const tapeH = Math.round(width * 0.061);
  const x = width / 2;
  const y = Math.round(width * 0.058);

  ctx.save();
  ctx.translate(x, y + tapeH / 2);
  ctx.rotate(degrees(-1));
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#e3dfd3";
  ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
  ctx.shadowBlur = Math.round(width * 0.0045);
  ctx.shadowOffsetY = Math.round(width * 0.003);
  ctx.fillRect(-tapeW / 2, -tapeH / 2, tapeW, tapeH);
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#c2bcae";
  ctx.lineWidth = Math.max(1, width * 0.002);
  ctx.beginPath();
  ctx.moveTo(-tapeW / 2, tapeH / 2 - ctx.lineWidth / 2);
  ctx.lineTo(tapeW / 2, tapeH / 2 - ctx.lineWidth / 2);
  ctx.stroke();

  ctx.globalAlpha = 0.30;
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  const wrinkleW = tapeW / 5;
  for (let i = 1; i < 5; i += 2) {
    ctx.fillRect(-tapeW / 2 + wrinkleW * i, -tapeH / 2, wrinkleW, tapeH);
  }
  ctx.restore();
}

function drawStamp(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, date: string) {
  const size = Math.round(width * 0.194);
  const radius = size / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(degrees(15));
  ctx.globalCompositeOperation = "multiply";

  ctx.strokeStyle = "rgba(161, 59, 59, 0.40)";
  ctx.lineWidth = Math.max(1.25, width * 0.006);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(161, 59, 59, 0.30)";
  ctx.lineWidth = Math.max(1, width * 0.003);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.875, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(161, 59, 59, 0.60)";
  ctx.font = `700 ${Math.max(6, Math.round(width * 0.018))}px Menlo, Monaco, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  drawLetterSpacedText(ctx, "POSTED", 0, -radius * 0.34, width * 0.0018, "center");

  ctx.strokeStyle = "rgba(161, 59, 59, 0.30)";
  ctx.lineWidth = Math.max(1, width * 0.002);
  ctx.beginPath();
  ctx.moveTo(-radius * 0.50, -radius * 0.10);
  ctx.lineTo(radius * 0.50, -radius * 0.10);
  ctx.stroke();

  if (date) {
    ctx.fillStyle = "rgba(161, 59, 59, 0.70)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${fitStampDateFontSize(ctx, date, width, radius)}px Menlo, Monaco, Consolas, monospace`;
    ctx.fillText(date, 0, radius * 0.15);
  }
  ctx.restore();
}

function fitStampDateFontSize(
  ctx: CanvasRenderingContext2D,
  date: string,
  width: number,
  radius: number
) {
  const maxTextWidth = radius * 1.25;
  let fontSize = Math.max(7, Math.round(width * 0.021));

  while (fontSize > 6) {
    ctx.font = `700 ${fontSize}px Menlo, Monaco, Consolas, monospace`;
    if (ctx.measureText(date).width <= maxTextWidth) return fontSize;
    fontSize -= 1;
  }

  return fontSize;
}

function drawHandwrittenMetadata(
  ctx: CanvasRenderingContext2D,
  exifData: { model?: string; dateTime?: string },
  width: number,
  x: number,
  paperBottom: number,
  totalHeight: number,
  textScale: number
) {
  const camera = exifData.model?.trim();
  const month = formatMonthYear(exifData.dateTime);
  const lines = [
    camera ? `Captured with ${camera}` : "",
    month,
  ].filter(Boolean);
  if (lines.length === 0) return;

  const titleSize = Math.max(12, Math.round(width * 0.043 * textScale));
  const subSize = Math.max(9, Math.round(width * 0.030 * textScale));
  const lineGap = Math.round(width * 0.012);
  const blockH = titleSize + (lines[1] ? lineGap + subSize : 0);
  const y = Math.min(totalHeight - Math.round(width * 0.035) - blockH, paperBottom + Math.round(width * 0.055));

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(degrees(-2));
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 ${titleSize}px "Caveat", "Dancing Script", "Bradley Hand", "Comic Sans MS", cursive`;
  ctx.fillStyle = "rgba(64, 64, 64, 0.90)";
  ctx.fillText(lines[0], 0, titleSize);

  if (lines[1]) {
    ctx.font = `700 ${subSize}px "Caveat", "Dancing Script", "Bradley Hand", "Comic Sans MS", cursive`;
    ctx.fillStyle = "#737373";
    ctx.fillText(lines[1], 0, titleSize + lineGap + subSize);
  }
  ctx.restore();
}

function drawPaperTexture(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const step = Math.max(3, Math.round(width * 0.012));
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.globalCompositeOperation = "multiply";
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const value = hashNoise(x / step, y / step);
      ctx.fillStyle = value > 0.5 ? "#000000" : "#ffffff";
      ctx.fillRect(x, y, step, step);
    }
  }
  ctx.restore();
}

function formatStampDate(value?: string) {
  const parsed = parseExifDate(value);
  if (!parsed) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthYear(value?: string) {
  const parsed = parseExifDate(value);
  if (!parsed) return "";
  return parsed.toLocaleString("en-US", { month: "long", year: "numeric" });
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

function hashNoise(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function degrees(value: number) {
  return value * Math.PI / 180;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
