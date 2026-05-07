"use client";

import { useRef, useEffect } from "react";

/**
 * FrameCanvas — F-04: Frame Preview
 *
 * Responsibilities:
 *  - Render the composited photo + EXIF frame on a <canvas> element
 *  - Re-render in < 100ms when style or EXIF fields change (PRD 8.4)
 *  - Preview is scaled-down for performance; export renders at full resolution
 *  - Receives: image (HTMLImageElement), exifData, selectedStyle
 *
 * TODO: Accept props: { image, exifData, selectedStyle }
 * TODO: On prop change, call lib/renderer.ts → renderFrame(canvas, image, exifData, style)
 * TODO: Handle canvas sizing (maintain aspect ratio of source image)
 */

export default function FrameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // TODO: Call renderer when image/style/exif data changes
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Placeholder: draw a grey rectangle with text
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#555";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "Frame preview will appear here",
      canvas.width / 2,
      canvas.height / 2
    );
  }, []);

  return (
    <div className="w-full aspect-[4/3] bg-neutral-900 rounded-xl overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="max-w-full max-h-full"
        aria-label="Frame preview canvas"
      />
    </div>
  );
}
