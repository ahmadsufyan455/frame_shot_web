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
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic', '.heif'],
      'image/x-adobe-dng': ['.dng'],
      'image/x-sony-arw': ['.arw'],
      'image/x-fuji-raf': ['.raf'],
      'image/x-nikon-nef': ['.nef'],
      'image/x-canon-cr3': ['.cr3'],
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
        border-2 border-dashed border-[#404040] rounded-[32px] 
        w-full max-w-[672px] h-[clamp(6rem,34dvh,17.5rem)] max-h-full
        px-6 py-5 sm:px-10 sm:py-8
        flex flex-col items-center justify-center
        transition-colors duration-200
        ${!isUploading && "cursor-pointer"}
        ${isDragActive ? "bg-[#262626]/50 border-white/50" : ""}
        ${isUploading ? "opacity-50" : "hover:border-white/30 hover:bg-[#262626]/30"}
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
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#262626] sm:mb-5 sm:size-16">
              <ImagePlus className="size-6 text-white sm:size-7" strokeWidth={1.5} />
            </div>

            <p className="text-center text-[16px] font-semibold leading-6 tracking-[-0.25px] text-white sm:text-[18px] sm:leading-7 sm:tracking-[-0.4395px]">
              Drag & drop photos
            </p>

            <p className="mt-0.5 text-center text-[13px] font-medium leading-5 tracking-[-0.15px] text-[#737373] sm:mt-1 sm:text-[14px]">
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
    </>
  );
}
