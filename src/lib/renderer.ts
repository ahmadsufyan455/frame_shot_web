import type { ExifData } from "./exif";
import type { FrameStyle } from "@/lib/frame-styles";

const PAINTERS: Record<FrameStyle, () => Promise<{ paint: FramePainter }>> = {
  classic: () => import("./styles/classic"),
  "shot-on": () => import("./styles/shot-on"),
  "minimal-line": () => import("./styles/minimal-line"),
};

export interface PaintOptions {
  aspectRatio?: number | null;
  showMetadata?: boolean;
  showLogo?: boolean;
  borderWeight?: number;
  backgroundColor?: string;
}

export type FramePainter = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  exifData: ExifData,
  options?: PaintOptions
) => void;

export async function renderFrame(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  exifData: ExifData,
  style: FrameStyle,
  options?: PaintOptions
): Promise<void> {
  const { paint } = await PAINTERS[style]();
  paint(canvas, image, exifData, options);
}

export async function exportFrame(
  image: HTMLImageElement,
  exifData: ExifData,
  style: FrameStyle,
  format: "jpeg" | "png",
  originalFilename: string
): Promise<void> {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = image.naturalWidth;
  exportCanvas.height = image.naturalHeight;

  await renderFrame(exportCanvas, image, exifData, style);

  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  const baseName = originalFilename.replace(/\.[^.]+$/, "");
  const extension = format === "jpeg" ? "jpg" : "png";
  const downloadName = `frameshot-${baseName}.${extension}`;

  exportCanvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      a.click();
      URL.revokeObjectURL(url);
    },
    mimeType,
    format === "jpeg" ? 0.95 : undefined
  );
}
