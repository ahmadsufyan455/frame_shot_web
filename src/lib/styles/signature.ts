/**
 * Signature Frame Painter
 *
 * Style: A modern, gallery-exhibition layout that celebrates the gear behind the shot.
 * Crisp "Gallery White" border with extended bottom margin, camera brand logo on the left,
 * bold camera model + monospaced exposure specs on the right.
 *
 * Layout:
 *  ┌──────────────────────────────────┐
 *  │  padding                         │
 *  │  ┌────────────────────────────┐  │
 *  │  │                            │  │
 *  │  │     Photo (no radius)      │  │
 *  │  │                            │  │
 *  │  └────────────────────────────┘  │
 *  │                                  │
 *  │  [BRAND LOGO]    Camera Model    │
 *  │                  35mm • f/1.8 …  │
 *  └──────────────────────────────────┘
 *
 * Proportions (relative to canvas width):
 *  - Side padding: ~3.6% of width
 *  - Bottom bar height: ~14-18% of width (extended margin)
 *  - Logo height: ~4.5% of width
 *  - Model font: ~3.2% of width (bold, sans-serif)
 *  - Specs font: ~2.4% of width (monospace)
 */

import type { FramePainter, SourceImage } from "../renderer";

const iw = (img: SourceImage) => "naturalWidth" in img ? img.naturalWidth : img.width;
const ih = (img: SourceImage) => "naturalHeight" in img ? img.naturalHeight : img.height;

const BRAND_LOGO_MAP: Record<string, string> = {
  apple: "apple",
  blackmagic: "blackmagic",
  canon: "canon",
  dji: "dji",
  fujifilm: "fujifilm",
  fuji: "fujifilm",
  google: "google",
  gopro: "gopro",
  hasselblad: "hasselblad",
  huawei: "huawei",
  insta360: "insta360",
  leica: "leica",
  nikon: "nikon",
  olympus: "olympus",
  oneplus: "oneplus",
  oppo: "oppo",
  pentax: "pentax",
  "phase one": "phase_one",
  phaseone: "phase_one",
  ricoh: "ricoh",
  samsung: "samsung",
  sigma: "sigma",
  sony: "sony",
  tamron: "tamron",
  vivo: "vivo",
  xiaomi: "xiaomi",
};

const logoCache = new Map<string, HTMLImageElement | ImageBitmap | null>();

function resolveBrandKey(make?: string): string | null {
  if (!make) return null;
  const normalized = make.trim().toLowerCase();

  if (BRAND_LOGO_MAP[normalized]) return BRAND_LOGO_MAP[normalized];

  for (const [key, value] of Object.entries(BRAND_LOGO_MAP)) {
    if (normalized.includes(key)) return value;
  }

  return null;
}

async function loadLogo(brandKey: string): Promise<HTMLImageElement | ImageBitmap | null> {
  if (logoCache.has(brandKey)) return logoCache.get(brandKey)!;

  const url = `/logos/${brandKey}.svg`;

  try {
    // OffscreenCanvas path (worker environment)
    if (typeof HTMLImageElement === "undefined") {
      const res = await fetch(url);
      if (!res.ok) { logoCache.set(brandKey, null); return null; }
      const blob = await res.blob();
      const bitmap = await createImageBitmap(blob);
      logoCache.set(brandKey, bitmap);
      return bitmap;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = url;
    });
    logoCache.set(brandKey, img);
    return img;
  } catch {
    logoCache.set(brandKey, null);
    return null;
  }
}

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

  const logoScale = clamp(options?.logoScale ?? 1, 0.5, 2);
  const logoHeight = Math.round(width * 0.045 * logoScale);
  const modelFontSize = Math.round(width * 0.032 * textScale);
  const specsFontSize = Math.round(width * 0.024 * textScale);
  const rowGap = Math.round(modelFontSize * 0.45);
  const barPaddingY = Math.round(basePadding * 1.2);

  const specsStr = [
    exifData.focalLength,
    exifData.aperture,
    exifData.shutterSpeed,
    exifData.iso,
  ].filter(Boolean).join(" \u2022 ");

  const hasModel = Boolean(exifData.model);
  const hasSpecs = Boolean(specsStr);
  const hasAnyContent = hasModel || hasSpecs || showLogo;

  let bottomBarHeight: number;
  if (!showMetadata || !hasAnyContent) {
    bottomBarHeight = Math.round(padding * 0.5);
  } else {
    const textBlockHeight = (hasModel ? modelFontSize : 0) + (hasModel && hasSpecs ? rowGap : 0) + (hasSpecs ? specsFontSize : 0);
    const contentHeight = Math.max(logoHeight, textBlockHeight);
    bottomBarHeight = barPaddingY + contentHeight + barPaddingY;
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

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, totalHeight);

  const imgX = padding;
  const imgY = padding;
  drawImageCover(ctx, image, imgX, imgY, imgAreaW, imgAreaH);

  if (!showMetadata || !hasAnyContent) return;

  const isDark = luminance(bgColor) < 0.5;
  const primaryColor = isDark ? "#ffffff" : "#1a1a1a";
  const secondaryColor = isDark ? "#a3a3a3" : "#6b6b6b";

  const barY = imgY + imgAreaH;
  const barCenterY = barY + bottomBarHeight / 2;

  const brandKey = resolveBrandKey(exifData.make);
  if (showLogo && brandKey) {
    const cachedLogo = logoCache.get(brandKey);
    if (cachedLogo) {
      const logoW = getLogoWidth(cachedLogo, logoHeight);
      const logoX = padding;
      const logoY = barCenterY - logoHeight / 2;
      drawLogoWithColor(ctx, cachedLogo, logoX, logoY, logoW, logoHeight, primaryColor, isDark);
    } else {
      loadLogo(brandKey);
    }
  }

  const textRightX = width - padding;
  const textBlockHeight = (hasModel ? modelFontSize : 0) + (hasModel && hasSpecs ? rowGap : 0) + (hasSpecs ? specsFontSize : 0);
  const textTopY = barCenterY - textBlockHeight / 2;

  let cursorY = textTopY;

  if (hasModel) {
    ctx.fillStyle = primaryColor;
    ctx.font = `700 ${modelFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(exifData.model!, textRightX, cursorY);
    cursorY += modelFontSize + rowGap;
  }

  if (hasSpecs) {
    ctx.fillStyle = secondaryColor;
    ctx.font = `600 ${specsFontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    drawLetterSpacedText(ctx, specsStr.toUpperCase(), textRightX, cursorY, specsFontSize * 0.1, "right");
  }
};

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
  if (align === "right") cursorX -= totalWidth;
  if (align === "center") cursorX -= totalWidth / 2;

  ctx.textAlign = "left";
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], cursorX, y);
    cursorX += ctx.measureText(text[i]).width + spacing;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getLogoWidth(logo: HTMLImageElement | ImageBitmap, targetHeight: number): number {
  const w = "naturalWidth" in logo ? logo.naturalWidth : logo.width;
  const h = "naturalHeight" in logo ? logo.naturalHeight : logo.height;
  if (h === 0) return targetHeight;
  const naturalWidth = Math.round((w / h) * targetHeight);
  const maxWidth = targetHeight * 5;
  return Math.min(naturalWidth, maxWidth);
}

function drawLogoWithColor(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | ImageBitmap,
  x: number,
  y: number,
  w: number,
  h: number,
  _color: string,
  isDark: boolean
) {
  if (isDark) {
    ctx.save();
    ctx.filter = "invert(1)";
    ctx.drawImage(logo as CanvasImageSource, x, y, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(logo as CanvasImageSource, x, y, w, h);
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
