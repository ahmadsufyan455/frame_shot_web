"use client";

import type { ExifData } from "@/lib/exif";

/**
 * ExifPanel — F-02 + F-05: EXIF Display & Inline Editing
 *
 * Responsibilities:
 *  - Display all extracted EXIF fields (from lib/exif.ts)
 *  - Every field is an editable text input — clicking allows custom value
 *  - Changes update FrameCanvas preview in real time (via shared state/context)
 *  - If a field is missing, show an empty input (never show "null")
 *  - If NO EXIF data found at all, show the "no data" banner
 *
 * Fields displayed (per PRD 6.3):
 *  - Camera Make & Model
 *  - Lens Model
 *  - Aperture
 *  - Shutter Speed
 *  - ISO
 *  - Focal Length
 *  - Exposure Compensation
 *  - White Balance
 *  - Date & Time
 *
 * TODO: Accept props: { exifData: ExifData, onChange: (field, value) => void }
 * TODO: Implement inline edit state per field
 * TODO: Show "No camera data found" banner when exifData is entirely empty
 */

const EXIF_FIELDS: { key: keyof ExifData; label: string; placeholder: string }[] =
  [
    { key: "make", label: "Camera Make", placeholder: "e.g. Sony" },
    { key: "model", label: "Camera Model", placeholder: "e.g. ILCE-7CM2" },
    { key: "lensModel", label: "Lens", placeholder: "e.g. FE 35mm F1.8" },
    { key: "aperture", label: "Aperture", placeholder: "e.g. f/1.8" },
    { key: "shutterSpeed", label: "Shutter Speed", placeholder: "e.g. 1/500s" },
    { key: "iso", label: "ISO", placeholder: "e.g. 800" },
    { key: "focalLength", label: "Focal Length", placeholder: "e.g. 35mm" },
    { key: "exposureComp", label: "Exposure Comp", placeholder: "e.g. +0.3 EV" },
    { key: "whiteBalance", label: "White Balance", placeholder: "e.g. Auto" },
    { key: "dateTime", label: "Date & Time", placeholder: "e.g. May 3, 2026 · 14:32" },
  ];

export default function ExifPanel() {
  // TODO: Replace with real exifData from props/context
  const exifData: ExifData = {};
  const hasNoExif = Object.values(exifData).every((v) => !v);

  return (
    <div className="bg-neutral-900 rounded-xl p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-neutral-300">Camera Data</h2>

      {/* No EXIF banner — per PRD 6.3 edge cases */}
      {hasNoExif && (
        <div className="bg-amber-950/40 border border-amber-700/50 rounded-lg px-3 py-2 text-amber-400 text-xs">
          No camera data found in this photo — you can fill in the fields below
          manually.
        </div>
      )}

      {/* EXIF fields */}
      <div className="flex flex-col gap-2">
        {EXIF_FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-0.5">
            <label
              htmlFor={`exif-${field.key}`}
              className="text-xs text-neutral-500"
            >
              {field.label}
            </label>
            <input
              id={`exif-${field.key}`}
              type="text"
              placeholder={field.placeholder}
              defaultValue={exifData[field.key] ?? ""}
              className="
                bg-neutral-800 text-white text-sm rounded-lg px-3 py-1.5
                border border-neutral-700
                focus:outline-none focus:border-indigo-500
                placeholder:text-neutral-600
                transition-colors duration-150
              "
              // TODO: onChange → update exifData → trigger canvas re-render
            />
          </div>
        ))}
      </div>
    </div>
  );
}
