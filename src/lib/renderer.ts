import type { ExifData } from "./exif";
import type { FrameStyle } from "@/lib/frame-styles";

export type SourceImage = HTMLImageElement | ImageBitmap;

const PAINTERS: Record<FrameStyle, () => Promise<{ paint: FramePainter }>> = {
  classic: () => import("./styles/classic"),
  "shot-on": () => import("./styles/shot-on"),
  "minimal-line": () => import("./styles/minimal-line"),
  "fine-art": () => import("./styles/fine-art"),
  editorial: () => import("./styles/editorial"),
};

export interface PaintOptions {
  aspectRatio?: number | null;
  showMetadata?: boolean;
  showLogo?: boolean;
  borderWeight?: number;
  backgroundColor?: string;
  metadataTextScale?: number;
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
  const { paint } = await PAINTERS[style]();
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
