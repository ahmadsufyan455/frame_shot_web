"use client";

/**
 * UploadZone — F-01: Photo Upload
 *
 * Responsibilities:
 *  - Drag-and-drop photo upload
 *  - Click-to-browse file picker
 *  - File type validation: JPEG, PNG, HEIC, DNG, ARW, RAF, NEF, CR3
 *  - File size validation: max 50MB
 *  - Privacy notice prominently displayed
 *  - Trigger EXIF extraction (lib/exif.ts) after file selected
 *  - Redirect to /frame after successful upload
 *
 * TODO: Implement drag-and-drop handlers
 * TODO: Implement file validation (type + size)
 * TODO: Integrate with lib/exif.ts for extraction
 * TODO: Store image + exifData in sessionStorage / context before redirect
 */

export default function UploadZone() {
  return (
    <div className="w-full max-w-2xl">
      {/* Upload drop zone */}
      <div
        className="
          border-2 border-dashed border-neutral-700
          rounded-2xl p-16
          flex flex-col items-center justify-center gap-4
          cursor-pointer
          hover:border-indigo-500 hover:bg-indigo-950/10
          transition-colors duration-200
        "
        aria-label="Photo upload zone"
      >
        {/* Upload icon placeholder */}
        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-3xl">
          📸
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-lg">
            Drop your photo here
          </p>
          <p className="text-neutral-400 text-sm mt-1">
            or{" "}
            <span className="text-indigo-400 underline cursor-pointer">
              click to browse
            </span>
          </p>
        </div>

        <p className="text-neutral-600 text-xs text-center">
          JPEG · PNG · HEIC · DNG · ARW · RAF · NEF · CR3 · Max 50MB
        </p>

        {/* Hidden file input — TODO: wire up onChange */}
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.heic,.heif,.dng,.arw,.raf,.nef,.cr3"
          className="hidden"
          aria-label="Select photo file"
        />
      </div>

      {/* Privacy notice — PRD 6.2 required */}
      <p className="mt-4 text-center text-neutral-500 text-xs">
        🔒 Your photo is processed entirely in your browser. Nothing is uploaded
        to any server.
      </p>
    </div>
  );
}
