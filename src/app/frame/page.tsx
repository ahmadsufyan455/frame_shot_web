/**
 * Frame Editor page — /frame
 *
 * This is the main editor screen after a photo is uploaded.
 * It contains:
 *  - FrameCanvas: real-time canvas preview (F-04)
 *  - StylePicker: horizontal style carousel (F-03)
 *  - ExifPanel: EXIF field display + inline editing (F-02, F-05)
 *  - DownloadButton: export trigger + format toggle (F-06)
 *
 * TODO: Implement state management to pass image + exifData
 *       from the landing page upload to this page.
 *       Options: React Context, URL-encoded blob, or sessionStorage.
 */

import FrameCanvas from "@/components/FrameCanvas";
import ExifPanel from "@/components/ExifPanel";
import DownloadButton from "@/components/DownloadButton";

export default function FramePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Top nav bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <a href="/" className="text-lg font-bold">
          Frame<span className="text-indigo-400">Shot</span>
        </a>
        {/* TODO: Add "Upload new photo" quick action */}
      </nav>

      {/* Editor layout: preview on left, controls on right */}
      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
        {/* Left: Canvas preview */}
        <section className="flex-1 flex flex-col gap-4">
          <FrameCanvas />
        </section>

        {/* Right: EXIF controls + download */}
        <aside className="w-full lg:w-80 flex flex-col gap-4">
          <ExifPanel />
          <DownloadButton />
        </aside>
      </div>
    </main>
  );
}
