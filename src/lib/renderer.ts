import type { ExifData } from "./exif";
import type { FrameStyle } from "@/lib/frame-styles";

export type SourceImage = HTMLImageElement | ImageBitmap;

type PainterModule = {
  paint: FramePainter;
  prepare?: (options?: PaintOptions) => Promise<void>;
};

const PAINTERS: Record<FrameStyle, () => Promise<PainterModule>> = {
  classic: () => import("./styles/classic"),
  "shot-on": () => import("./styles/shot-on"),
  "minimal-line": () => import("./styles/minimal-line"),
  "fine-art": () => import("./styles/fine-art"),
  editorial: () => import("./styles/editorial"),
  vintage: () => import("./styles/vintage"),
  signature: () => import("./styles/signature"),
  storyteller: () => import("./styles/storyteller"),
  travel: () => import("./styles/travel"),
  "creator-watermark": () => import("./styles/creator-watermark"),
  memoir: () => import("./styles/memoir"),
};

export interface PaintOptions {
  aspectRatio?: number | null;
  showMetadata?: boolean;
  showLogo?: boolean;
  borderWeight?: number;
  backgroundColor?: string;
  metadataTextScale?: number;
  logoScale?: number;
  vintageStampPosition?: "bottom-right" | "bottom-left" | "hidden";
  vintageNotePosition?: "bottom-left" | "bottom-center" | "bottom-right" | "hidden";
  vintageIntensity?: "soft" | "classic" | "faded";
  customLogoDataUrl?: string;
  customLogoOpacity?: number;
  customLogoPosition?: { x: number; y: number };
  instagramPosition?: "left" | "right" | "bottom" | "hidden";
}

export interface ExportOptions {
  format: "jpeg" | "png";
  quality: number;
  paintOptions?: PaintOptions;
}

export type FramePainter = (
  canvas: HTMLCanvasElement | OffscreenCanvas,
  image: SourceImage,
  exifData: ExifData,
  options?: PaintOptions
) => void;

export async function renderFrame(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  image: SourceImage,
  exifData: ExifData,
  style: FrameStyle,
  options?: PaintOptions
): Promise<void> {
  const painter = await PAINTERS[style]();
  await painter.prepare?.(options);
  const { paint } = painter;
  paint(canvas, image, exifData, options);
}

export async function exportFrameToBlob(
  image: HTMLImageElement,
  exifData: ExifData,
  style: FrameStyle,
  exportOptions: ExportOptions
): Promise<Blob> {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = image.naturalWidth;
  await renderFrame(exportCanvas, image, exifData, style, exportOptions.paintOptions);

  const mimeType = exportOptions.format === "jpeg" ? "image/jpeg" : "image/png";
  const quality = exportOptions.format === "jpeg" ? exportOptions.quality / 100 : undefined;

  return new Promise((resolve, reject) => {
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Failed to create blob"));
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
