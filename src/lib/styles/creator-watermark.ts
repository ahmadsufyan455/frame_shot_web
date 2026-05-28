/**
 * Creator Watermark Frame Painter
 *
 * Style: tall white creator frame inspired by social portfolio posts.
 * The Instagram handle runs vertically on the left margin and a custom
 * watermark logo can be placed anywhere inside the photo area.
 */

import type { FramePainter, PaintOptions, SourceImage } from "../renderer";

const iw = (img: SourceImage) => "naturalWidth" in img ? img.naturalWidth : img.width;
const ih = (img: SourceImage) => "naturalHeight" in img ? img.naturalHeight : img.height;

const logoCache = new Map<string, HTMLImageElement | ImageBitmap | null>();

export async function prepare(options?: PaintOptions) {
  const src = options?.customLogoDataUrl;
  if (!src || logoCache.has(src)) return;

  try {
    if (typeof HTMLImageElement === "undefined") {
      const res = await fetch(src);
      if (!res.ok) {
        logoCache.set(src, null);
        return;
      }
      const blob = await res.blob();
      const bitmap = await createImageBitmap(blob);
      logoCache.set(src, bitmap);
      return;
    }

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
    logoCache.set(src, img);
  } catch {
    logoCache.set(src, null);
  }
}

export const paint: FramePainter = (canvas, image, exifData, options) => {
  const ctx = (canvas as unknown as HTMLCanvasElement).getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const weight = options?.borderWeight ?? 1;
  const textScale = clamp(options?.metadataTextScale ?? 1, 0.5, 2);
  const logoScale = clamp(options?.logoScale ?? 1, 0.5, 2);
  const bgColor = options?.backgroundColor ?? "#ffffff";
  const instagramPosition = options?.instagramPosition ?? "left";
  const hasSideInstagramRail = instagramPosition === "left" || instagramPosition === "right";
  const hasBottomInstagramRail = instagramPosition === "bottom";

  const railWidth = Math.round(width * 0.13 * weight);
  const bottomRailHeight = Math.round(width * 0.085 * weight);
  const outerPad = Math.round(width * 0.042 * weight);
  const topPad = Math.round(width * (hasBottomInstagramRail ? 0.032 : 0.055) * weight);
  const bottomPad = Math.round(width * 0.055 * weight);
  const leftRail = hasSideInstagramRail && instagramPosition === "left" ? railWidth : 0;
  const rightRail = hasSideInstagramRail && instagramPosition === "right" ? railWidth : 0;
  const photoX = leftRail + outerPad;
  const photoY = topPad;
  const photoW = width - photoX - outerPad - rightRail;
  const borderSize = Math.max(1, Math.round(width * 0.002));

  let totalHeight: number;
  let photoH: number;

  if (options?.aspectRatio) {
    totalHeight = Math.round(width / options.aspectRatio);
    photoH = Math.max(1, totalHeight - topPad - bottomPad - (hasBottomInstagramRail ? bottomRailHeight : 0));
  } else {
    const sourceAspect = iw(image) / ih(image);
    photoH = Math.round(photoW / sourceAspect);
    totalHeight = topPad + photoH + bottomPad + (hasBottomInstagramRail ? bottomRailHeight : 0);
  }

  canvas.width = width;
  canvas.height = totalHeight;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, totalHeight);

  drawImageCover(ctx, image, photoX, photoY, photoW, photoH);

  ctx.strokeStyle = "#e5e5e5";
  ctx.lineWidth = borderSize;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  const handle = formatHandle(exifData.instagram);
  if ((options?.showMetadata ?? true) && handle && instagramPosition !== "hidden") {
    const fontSize = Math.round(width * 0.027 * textScale);
    ctx.save();
    ctx.fillStyle = "#9a9a9a";
    ctx.font = `700 ${fontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (instagramPosition === "bottom") {
      ctx.translate(Math.round(width / 2), Math.round((photoY + photoH + totalHeight) / 2));
    } else {
      const handleX = instagramPosition === "right"
        ? width - Math.round(railWidth * 0.46)
        : Math.round(railWidth * 0.46);
      const rotation = instagramPosition === "right" ? Math.PI / 2 : -Math.PI / 2;
      ctx.translate(handleX, Math.round(totalHeight / 2));
      ctx.rotate(rotation);
    }

    ctx.fillText(handle.toUpperCase(), 0, 0);
    ctx.restore();
  }

  const logo = options?.customLogoDataUrl ? logoCache.get(options.customLogoDataUrl) : null;
  if ((options?.showLogo ?? true) && logo) {
    const logoNaturalW = "naturalWidth" in logo ? logo.naturalWidth : logo.width;
    const logoNaturalH = "naturalHeight" in logo ? logo.naturalHeight : logo.height;
    const aspect = logoNaturalH > 0 ? logoNaturalW / logoNaturalH : 1;
    const targetSize = Math.round(width * 0.085 * logoScale);
    const logoW = aspect >= 1 ? targetSize : Math.round(targetSize * aspect);
    const logoH = aspect >= 1 ? Math.round(targetSize / aspect) : targetSize;
    const position = options?.customLogoPosition ?? { x: 0.86, y: 0.89 };
    const centerX = photoX + clamp(position.x, 0, 1) * photoW;
    const centerY = photoY + clamp(position.y, 0, 1) * photoH;
    const logoX = clamp(centerX - logoW / 2, photoX, photoX + photoW - logoW);
    const logoY = clamp(centerY - logoH / 2, photoY, photoY + photoH - logoH);

    ctx.save();
    ctx.globalAlpha = clamp(options?.customLogoOpacity ?? 0.85, 0, 1);
    ctx.drawImage(logo as CanvasImageSource, logoX, logoY, logoW, logoH);
    ctx.restore();
  }
};

function formatHandle(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
