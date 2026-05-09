"use client";

import { removePhoto, setActiveIndex, type PhotoEntry } from "@/lib/photo-store";
import { X } from "lucide-react";

interface FilmstripProps {
  photos: PhotoEntry[];
  activeIndex: number;
}

export default function Filmstrip({ photos, activeIndex }: FilmstripProps) {
  if (photos.length <= 1) return null;

  return (
    <div className="overflow-x-auto scrollbar-hide px-3 pb-2 pt-3">
      <div className="mx-auto flex w-max items-center gap-2">
        {photos.map((photo, i) => {
          const isActive = i === activeIndex;
          return (
            <div key={photo.id} className="relative group flex-shrink-0">
              <button
                onClick={() => setActiveIndex(i)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${isActive
                  ? "border-white shadow-[0_0_8px_rgba(255,255,255,0.3)] scale-105"
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-neutral-600"
                  }`}
              >
                <img
                  src={photo.objectUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:border-red-500"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
