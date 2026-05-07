"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { extractExif } from "@/lib/exif";
import { setPhoto } from "@/lib/photo-store";

export default function UploadZone() {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      const exifData = await extractExif(file);
      const objectUrl = URL.createObjectURL(file);
      setPhoto(objectUrl, exifData, file.name);
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
    maxSize: 52428800, // 50MB
    disabled: isUploading,
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed border-[#404040] rounded-[32px] 
        w-full max-w-[672px] h-[280px]
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
            Reading EXIF metadata...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="bg-[#262626] rounded-full size-[64px] flex items-center justify-center mb-[20px]">
            <ImagePlus className="size-[28px] text-white" strokeWidth={1.5} />
          </div>
          
          <p className="font-semibold text-[18px] leading-[28px] text-white tracking-[-0.4395px] text-center">
            Drag & drop photos
          </p>
          
          <p className="font-medium text-[14px] leading-[20px] text-[#737373] tracking-[-0.15px] text-center mt-1">
            or click to browse files
          </p>
        </div>
      )}
    </div>
  );
}
