"use client";

import Dialog from "@/components/Dialog";
import { extractExif } from "@/lib/exif";
import { prepareImageForCanvas } from "@/lib/image-file";
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
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [showProcessingDialog, setShowProcessingDialog] = useState(false);
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
        const displayBlob = await prepareImageForCanvas(file);
        const objectUrl = URL.createObjectURL(displayBlob);
        entries.push({ id: crypto.randomUUID(), objectUrl, exifData, filename: file.name, file: displayBlob });
        setProgress({ done: i + 1, total: acceptedFiles.length });
      }
      await addPhotos(entries);
      router.push("/preview");
    } catch {
      setIsUploading(false);
      setShowProcessingDialog(true);
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
        return;
      }

      const hasOversizedFile = rejections.some(r =>
        r.errors.some(e => e.code === "file-too-large")
      );
      if (hasOversizedFile) {
        setShowSizeDialog(true);
      }
    },
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic', '.heif'],
      'image/heif': ['.heif'],
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

      <Dialog
        open={showSizeDialog}
        onClose={() => setShowSizeDialog(false)}
        title="File too large"
        description="This file is too large. Please upload photos up to 50MB."
        actionLabel="Got it"
        variant="warning"
      />

      <Dialog
        open={showProcessingDialog}
        onClose={() => setShowProcessingDialog(false)}
        title="Could not read photo"
        description="FrameShot could not prepare this photo. Try exporting it as a JPEG or PNG and upload it again."
        actionLabel="Got it"
        variant="warning"
      />
    </>
  );
}
