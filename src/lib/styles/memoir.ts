/**
 * Memoir Frame Painter
 *
 * Style: Clean exhibition/journal print with centered photo,
 * thin grey hairline border, soft horizontal line divider,
 * centered Georgia serif description caption (wrapped up to 3 lines),
 * and letter-spaced sans-serif date/location.
 *
 * Layout:
 *  - Margins: 6.5% top/sides, dynamic bottom margin based on wrapped caption height
 *  - Divider: thin centered horizontal line
 *  - Caption: Georgia serif, centered, wraps responsive to canvas width and scale
 *  - Sub-caption: Inter sans-serif, uppercase, letter-spaced (Date • Location)
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

  const borderScale = weight <= 1 ? 0.1 + weight * 0.9 : 1 + (weight - 1) * 0.4;

  const topPadding = Math.round(width * 0.065 * borderScale);
  const sidePadding = Math.round(width * 0.065 * borderScale);

  // Content text preparation
  const descText = exifData.description?.trim() || "A quiet moment captured in time, telling a story of light and shadow.";
  const locationText = exifData.location?.trim();
  const dateText = formatMomentDate(exifData.dateTime);

  const finalDate = dateText || formatMomentDate(new Date().toISOString());
  const finalLocation = locationText ? locationText.toUpperCase() : "UNKNOWN LOCATION";

  const subParts = [];
  if (finalDate) subParts.push(finalDate);
  if (finalLocation) subParts.push(finalLocation);
  const subText = subParts.join(" • ");

  const photoW = Math.max(1, width - sidePadding * 2);
  const photoAspect = iw(image) / ih(image);

  // Typographical parameters
  const captionFontSize = Math.max(12, Math.round(width * 0.032 * textScale));
  const subCaptionFontSize = Math.max(10, Math.round(width * 0.019 * textScale));
  const captionLineHeight = Math.round(captionFontSize * 1.35);
  const subCaptionLineHeight = Math.round(subCaptionFontSize * 1.3);

  // Wrap caption text to a maximum of 3 lines
  const maxTextWidth = photoW * 0.9;
  ctx.save();
  ctx.font = `${captionFontSize}px Georgia, "Times New Roman", serif`;
  const wrappedLines = wrapAndTruncateText(ctx, descText, maxTextWidth, 3);
  ctx.restore();

  const captionTotalHeight = wrappedLines.length * captionLineHeight;

  // Responsive gaps scaled with borderScale
  const gap1 = Math.round(width * 0.018 * borderScale);      // photo bottom -> divider
  const gap2 = Math.round(width * 0.024 * borderScale);      // divider -> caption start
  const gap3 = Math.round(width * 0.018 * borderScale);      // caption end -> sub-caption
  const gapBottom = Math.round(width * 0.035 * borderScale);  // sub-caption -> canvas bottom

  const contentHeight = gap1 + 1 + gap2 + captionTotalHeight + gap3 + subCaptionLineHeight + gapBottom;
  const bottomPadding = showMetadata ? contentHeight : topPadding;

  let totalHeight: number;
  let photoH: number;

  if (options?.aspectRatio) {
    totalHeight = Math.round(width / options.aspectRatio);
    photoH = Math.max(1, totalHeight - topPadding - bottomPadding);
  } else {
    photoH = Math.round(photoW / photoAspect);
    totalHeight = topPadding + photoH + bottomPadding;
  }

  canvas.width = width;
  canvas.height = totalHeight;

  // Draw background mat
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, totalHeight);

  // Draw image with soft depth shadow
  const photoX = sidePadding;
  const photoY = topPadding;
  const isDark = luminance(bgColor) < 0.5;

  ctx.save();
  ctx.shadowColor = isDark ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.12)";
  ctx.shadowBlur = Math.round(width * 0.024);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(width * 0.010);
  drawImageCover(ctx, image, photoX, photoY, photoW, photoH);
  ctx.restore();

  // Draw hairline border around image
  const hairline = Math.max(1, Math.round(width * 0.0015));
  ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(10, 10, 10, 0.12)";
  ctx.lineWidth = hairline;
  ctx.strokeRect(
    photoX + hairline / 2,
    photoY + hairline / 2,
    photoW - hairline,
    photoH - hairline
  );

  if (!showMetadata) return;

  const photoBottom = photoY + photoH;
  const dividerY = photoBottom + gap1;
  const captionStartY = dividerY + 1 + gap2;
  const subCaptionBaselineY = captionStartY + captionTotalHeight + gap3 + subCaptionFontSize * 0.85;

  const dividerW = Math.round(width * 0.38);

  // Draw thin divider line
  ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(10, 10, 10, 0.12)";
  ctx.lineWidth = Math.max(1, Math.round(width * 0.001));
  ctx.beginPath();
  ctx.moveTo(width / 2 - dividerW / 2, dividerY);
  ctx.lineTo(width / 2 + dividerW / 2, dividerY);
  ctx.stroke();

  // Draw Caption text lines (Georgia serif)
  ctx.fillStyle = isDark ? "#f3f4f6" : "#262626";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${captionFontSize}px Georgia, "Times New Roman", serif`;

  for (let i = 0; i < wrappedLines.length; i++) {
    const lineY = captionStartY + i * captionLineHeight + captionLineHeight / 2;
    ctx.fillText(wrappedLines[i], width / 2, lineY);
  }

  // Draw Sub-caption text (Inter sans-serif, uppercase, letter-spaced)
  ctx.fillStyle = isDark ? "#9ca3af" : "#737373";
  ctx.font = `600 ${subCaptionFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  drawLetterSpacedText(ctx, subText.toUpperCase(), width / 2, subCaptionBaselineY, subCaptionFontSize * 0.15, "center");
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatMomentDate(value?: string): string {
  const text = value?.trim();
  if (!text) return "";

  const parsed = parseExifDate(text);
  if (!parsed) return text; // Fallback to raw text if parsing fails

  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${month}/${year}`;
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

function wrapAndTruncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 3
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + " " + word;
    const width = ctx.measureText(testLine).width;
    if (width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  if (lines.length > maxLines) {
    const truncatedLines = lines.slice(0, maxLines);
    let lastLine = truncatedLines[maxLines - 1];

    while (lastLine.length > 0 && ctx.measureText(lastLine + "...").width > maxWidth) {
      lastLine = lastLine.slice(0, -1);
    }
    truncatedLines[maxLines - 1] = lastLine + "...";
    return truncatedLines;
  }

  return lines;
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
