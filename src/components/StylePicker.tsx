"use client";

import { useRef, useEffect } from "react";
import type { ExifData } from "@/lib/exif";
import type { PaintOptions } from "@/lib/renderer";

export type FrameStyle = "classic";

const FRAME_STYLES: { id: FrameStyle; label: string; description: string }[] = [
  {
    id: "classic",
    label: "Classic",
    description: "White bottom bar, metadata on the right, clean and minimal",
  },
];

interface StylePickerProps {
  selectedStyle: FrameStyle;
  onStyleChange: (style: FrameStyle) => void;
  image: HTMLImageElement | null;
  exifData: ExifData;
  paintOptions?: PaintOptions;
}

function StyleThumbnail({
  styleId,
  image,
  exifData,
  paintOptions,
}: {
  styleId: FrameStyle;
  image: HTMLImageElement | null;
  exifData: ExifData;
  paintOptions?: PaintOptions;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    canvas.width = 200;

    import(`@/lib/styles/${styleId}`).then(({ paint }) => {
      paint(canvas, image, exifData, paintOptions);
    });
  }, [styleId, image, exifData, paintOptions]);

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
  paintOptions,
}: StylePickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {FRAME_STYLES.map((style) => {
        const isActive = selectedStyle === style.id;
        return (
          <button
            key={style.id}
            title={style.description}
            aria-pressed={isActive}
            onClick={() => onStyleChange(style.id)}
            className={`
              flex-shrink-0 w-14 rounded-lg border p-1 text-center
              transition-all duration-200 cursor-pointer
              ${isActive
                ? "border-white bg-white/10 text-white shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                : "border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-600"
              }
            `}
          >
            <div className="w-full aspect-[3/4] bg-neutral-800 rounded overflow-hidden">
              <StyleThumbnail
                styleId={style.id}
                image={image}
                exifData={exifData}
                paintOptions={paintOptions}
              />
            </div>
            <span className="text-[9px] leading-tight mt-0.5 block">{style.label}</span>
          </button>
        );
      })}
    </div>
  );
}
