/**
 * lib/renderer.ts — Canvas Drawing Orchestrator
 *
 * This module coordinates frame rendering by:
 *  - Selecting the correct frame painter based on the chosen style
 *  - Calling the painter with (canvas, image, exifData)
 *  - Handling both preview (scaled) and export (full resolution) renders
 *
 * Each frame style is implemented as a self-contained painter in lib/styles/.
 *
 * Usage:
 *   import { renderFrame } from "@/lib/renderer";
 *   renderFrame(canvas, image, exifData, "classic");
 *
 * Performance target: < 100ms for preview re-render (PRD 8.4)
 */

import type { ExifData } from "./exif";
import type { FrameStyle } from "@/components/StylePicker";

// Lazy-load style painters to keep initial bundle small
const PAINTERS: Record<FrameStyle, () => Promise<{ paint: FramePainter }>> = {
  classic: () => import("./styles/classic"),
};

export interface PaintOptions {
  /** Target aspect ratio for the image area (w/h). null = use original image ratio. */
  aspectRatio?: number | null;
  showMetadata?: boolean;
  showLogo?: boolean;
  borderWeight?: number;
  backgroundColor?: string;
}

/** The signature every frame painter must implement */
export type FramePainter = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  exifData: ExifData,
  options?: PaintOptions
) => void;

/**
 * Renders a frame onto the canvas using the selected style painter.
 *
 * @param canvas       - Target canvas element (preview or export)
 * @param image        - The user's loaded photo
 * @param exifData     - Normalised EXIF fields
 * @param style        - The selected frame style
 *
 * TODO: Cache the loaded painter module to avoid re-importing on every render
 * TODO: Debounce calls during rapid EXIF field edits (aim < 100ms perceived)
 */
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

/**
 * Generates the full-resolution export canvas.
 * Uses the same painter as preview but at the original image dimensions.
 *
 * TODO: Implement watermark overlay after frame is painted
 * TODO: Call canvas.toBlob() and trigger browser download
 */
export async function exportFrame(
  image: HTMLImageElement,
  exifData: ExifData,
  style: FrameStyle,
  format: "jpeg" | "png",
  originalFilename: string
): Promise<void> {
  const exportCanvas = document.createElement("canvas");
  // TODO: Set canvas size based on style (image + frame bar height)
  exportCanvas.width = image.naturalWidth;
  exportCanvas.height = image.naturalHeight;

  await renderFrame(exportCanvas, image, exifData, style);

  // TODO: Draw watermark.svg in bottom-right corner

  // TODO: Trigger download
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
    format === "jpeg" ? 0.95 : undefined // JPEG quality
  );
}
