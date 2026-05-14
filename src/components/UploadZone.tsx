"use client";

import Dialog from "@/components/Dialog";
import { extractExif } from "@/lib/exif";
import { addPhotos, clearPhotos, MAX_PHOTOS, type PhotoEntry } from "@/lib/photo-store";
import { ImagePlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadZone() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const router = useRouter();

  useEffect(() => { clearPhotos(); }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    if (acceptedFiles.length > MAX_PHOTOS) {
      setShowLimitDialog(true);
      return;
    }

    setIsUploading(true);
    setProgress({ done: 0, total: acceptedFiles.length });

    try {
      const entries: PhotoEntry[] = [];
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const exifData = await extractExif(file);
        const objectUrl = URL.createObjectURL(file);
        entries.push({ id: crypto.randomUUID(), objectUrl, exifData, filename: file.name, file });
        setProgress({ done: i + 1, total: acceptedFiles.length });
      }
      await addPhotos(entries);
      router.push("/preview");
    } catch {
      setIsUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejections) => {
      const hasInvalidType = rejections.some(r =>
        r.errors.some(e => e.code === "file-invalid-type")
      );
      if (hasInvalidType) {
        setShowFormatDialog(true);
      }
    },
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic', '.heif'],
    },
    maxSize: 52428800,
    multiple: true,
    disabled: isUploading,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={`
        border border-dashed border-neutral-700 rounded-[8px] 
        w-full h-[clamp(9rem,24dvh,13.5rem)] max-h-full
        px-5 py-6 sm:px-8 sm:py-8
        flex flex-col items-center justify-center
        transition-colors duration-200
        ${!isUploading && "cursor-pointer"}
        ${isDragActive ? "border-white bg-white/[0.06]" : ""}
        ${isUploading ? "opacity-50" : "hover:border-neutral-500 hover:bg-white/[0.03]"}
      `}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="size-[40px] text-white animate-spin" strokeWidth={1.5} />
            <p className="font-medium text-[#a1a1a1] text-[14px] leading-[20px] tracking-[0.2px] text-center">
              Reading EXIF metadata{progress.total > 1 ? ` (${progress.done}/${progress.total})` : "..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="mb-3 flex size-11 items-center justify-center rounded-[8px] border border-neutral-800 bg-[#151515] sm:size-12">
              <ImagePlus className="size-6 text-white" strokeWidth={1.5} />
            </div>

            <p className="text-center text-[16px] font-semibold leading-6 text-white sm:text-[18px]">
              Drop photos here
            </p>

            <p className="mt-1 text-center text-[13px] font-medium leading-5 text-neutral-500 sm:text-[14px]">
              or click to browse files
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={showLimitDialog}
        onClose={() => setShowLimitDialog(false)}
        title="Too many photos"
        description={`You can upload up to ${MAX_PHOTOS} photos at a time. Please select fewer files and try again.`}
        actionLabel="Got it"
        variant="warning"
      />

      <Dialog
        open={showFormatDialog}
        onClose={() => setShowFormatDialog(false)}
        title="Unsupported format"
        description="RAW formats (CR3, ARW, NEF, RAF, DNG) are not supported. Please upload JPEG, PNG, or HEIC files instead."
        actionLabel="Got it"
        variant="warning"
      />
    </>
  );
}
