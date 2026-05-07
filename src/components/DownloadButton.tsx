"use client";

import { useState } from "react";

/**
 * DownloadButton — F-06: Download
 *
 * Responsibilities:
 *  - Format toggle: JPEG (default) | PNG
 *  - Single "Download" button — no extra steps, no email gate
 *  - Export at full original photo resolution (not capped or compressed)
 *  - Add small FrameShot watermark in bottom-right corner
 *  - Output filename: frameshot-[original-filename].jpg / .png
 *
 * TODO: Accept props: { canvas, originalFilename, format }
 * TODO: On download click:
 *         1. Get full-res canvas from renderer.ts (renderFrame at original size)
 *         2. Draw watermark (public/watermark.svg)
 *         3. canvas.toBlob() → trigger browser download
 */

type ExportFormat = "jpeg" | "png";

export default function DownloadButton() {
  const [format, setFormat] = useState<ExportFormat>("jpeg");

  const handleDownload = () => {
    // TODO: Implement full-resolution export
    // 1. Render full-res frame via renderer.ts
    // 2. Draw watermark
    // 3. Trigger download with correct filename + MIME type
    console.log("Download triggered — format:", format);
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-4 flex flex-col gap-3">
      {/* Format toggle */}
      <div className="flex gap-2">
        {(["jpeg", "png"] as ExportFormat[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            aria-pressed={format === f}
            className={`
              flex-1 py-1.5 rounded-lg text-sm font-medium border
              transition-colors duration-150
              ${
                format === f
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-500"
              }
            `}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="
          w-full py-3 rounded-xl
          bg-indigo-600 hover:bg-indigo-500
          text-white font-semibold text-sm
          transition-colors duration-150
          active:scale-95
        "
      >
        Download {format.toUpperCase()}
      </button>

      <p className="text-neutral-600 text-xs text-center">
        Full resolution · Small FrameShot watermark included
      </p>
    </div>
  );
}
