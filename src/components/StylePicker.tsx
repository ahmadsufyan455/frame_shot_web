"use client";

import { useRef, useEffect } from "react";
import type { ExifData } from "@/lib/exif";
import { FRAME_STYLES, type FrameStyle } from "@/lib/frame-styles";

export type { FrameStyle } from "@/lib/frame-styles";

interface StylePickerProps {
  selectedStyle: FrameStyle;
  onStyleChange: (style: FrameStyle) => void;
  image: HTMLImageElement | null;
  exifData: ExifData;
}

function StyleThumbnail({
  styleId,
  image,
  exifData,
}: {
  styleId: FrameStyle;
  image: HTMLImageElement | null;
  exifData: ExifData;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    canvas.width = 200;

    import(`@/lib/styles/${styleId}`).then(({ paint }) => {
      paint(canvas, image, exifData);
    });
  }, [styleId, image, exifData]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain rounded"
    />
  );
}

export default function StylePicker({
  selectedStyle,
  onStyleChange,
  image,
  exifData,
}: StylePickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center py-1">
      {FRAME_STYLES.map((style) => {
        const isActive = selectedStyle === style.id;
        return (
          <button
            key={style.id}
            title={style.description}
            aria-pressed={isActive}
            onClick={() => onStyleChange(style.id)}
            className={`
              flex-shrink-0 w-[64px] rounded-lg border p-1 text-center
              transition-all duration-300 ease-out cursor-pointer
              ${isActive
                ? "border-white bg-white/10 text-white shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                : "border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-600"
              }
            `}
          >
            <div className={`w-full aspect-[4/5] bg-neutral-800 rounded overflow-hidden transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-60"}`}>
              <StyleThumbnail
                styleId={style.id}
                image={image}
                exifData={exifData}
              />
            </div>
            <span className={`text-[9px] leading-tight mt-1 block whitespace-nowrap transition-colors duration-300 ${isActive ? "text-white" : "text-neutral-500"}`}>{style.label}</span>
          </button>
        );
      })}
    </div>
  );
}
