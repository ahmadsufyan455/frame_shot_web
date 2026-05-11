/// <reference lib="webworker" />
export {};

import type { ExifData } from "./exif";
import type { FrameStyle } from "./frame-styles";
import type { FramePainter, PaintOptions } from "./renderer";

export type WorkerRequest = {
  photos: Array<{
    id: string;
    blob: Blob;
    exifData: ExifData;
    filename: string;
    isLowRes: boolean;
  }>;
  style: FrameStyle;
  format: "jpeg" | "png";
  quality: number;
  paintOptions: PaintOptions;
};

export type WorkerEvent =
  | { type: "progress"; done: number; total: number }
  | { type: "result"; id: string; buffer: ArrayBuffer; filename: string; isLowRes: boolean }
  | { type: "error"; id: string; filename: string }
  | { type: "done" };

const PAINTERS: Record<FrameStyle, () => Promise<{ paint: FramePainter }>> = {
  classic: () => import("./styles/classic"),
  "shot-on": () => import("./styles/shot-on"),
  "minimal-line": () => import("./styles/minimal-line"),
  "fine-art": () => import("./styles/fine-art"),
  editorial: () => import("./styles/editorial"),
};

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { photos, style, format, quality, paintOptions } = event.data;
  const { paint } = await PAINTERS[style]();
  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  const qualityValue = format === "jpeg" ? quality / 100 : undefined;

  for (let i = 0; i < photos.length; i++) {
    const { id, blob, exifData, filename, isLowRes } = photos[i];

    try {
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      canvas.width = bitmap.width;

      paint(canvas, bitmap, exifData, paintOptions);
      bitmap.close();

      const resultBlob = await canvas.convertToBlob({ type: mimeType, quality: qualityValue });
      const buffer = await resultBlob.arrayBuffer();

      (self as unknown as Worker).postMessage(
        { type: "result", id, buffer, filename, isLowRes } satisfies WorkerEvent,
        [buffer]
      );
    } catch {
      (self as unknown as Worker).postMessage({ type: "error", id, filename } satisfies WorkerEvent);
    }

    (self as unknown as Worker).postMessage(
      { type: "progress", done: i + 1, total: photos.length } satisfies WorkerEvent
    );
  }

  (self as unknown as Worker).postMessage({ type: "done" } satisfies WorkerEvent);
};
