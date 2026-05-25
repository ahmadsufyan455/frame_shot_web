"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, SlidersHorizontal, Settings2, Image as ImageIcon, Loader2, X } from "lucide-react";
import StylePicker from "@/components/StylePicker";
import Filmstrip from "@/components/Filmstrip";
import Toast, { type ToastMessage } from "@/components/Toast";
import { renderFrame, exportFrameToBlob, downloadBlob, type PaintOptions } from "@/lib/renderer";
import { usePhotoStore, getPhotoBlob, clearStorageWarning, type PhotoEntry } from "@/lib/photo-store";
import { FRAME_STYLE_CONFIGS, type FrameStyle } from "@/lib/frame-styles";
import type { ExifData } from "@/lib/exif";

function ExifInput({ label, value, onChange, placeholder }: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#121212] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
      />
    </div>
  );
}

type VintageStampPosition = NonNullable<PaintOptions["vintageStampPosition"]>;
type VintageNotePosition = NonNullable<PaintOptions["vintageNotePosition"]>;
type VintageIntensity = NonNullable<PaintOptions["vintageIntensity"]>;

const VINTAGE_STAMP_POSITIONS: Array<{ value: VintageStampPosition; label: string }> = [
  { value: "bottom-right", label: "Right" },
  { value: "bottom-left", label: "Left" },
  { value: "hidden", label: "Hidden" },
];

const VINTAGE_NOTE_POSITIONS: Array<{ value: VintageNotePosition; label: string }> = [
  { value: "bottom-left", label: "Left" },
  { value: "bottom-center", label: "Center" },
  { value: "bottom-right", label: "Right" },
  { value: "hidden", label: "Hidden" },
];

const VINTAGE_INTENSITIES: Array<{ value: VintageIntensity; label: string }> = [
  { value: "soft", label: "Soft" },
  { value: "classic", label: "Classic" },
  { value: "faded", label: "Faded" },
];

function SegmentedOption<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-neutral-400">{label}</span>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`h-9 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-white text-black"
                  : "bg-[#121212] text-neutral-500 hover:bg-[#1a1a1a] hover:text-neutral-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VintageOptions({
  stampPosition,
  notePosition,
  intensity,
  onStampPositionChange,
  onNotePositionChange,
  onIntensityChange,
}: {
  stampPosition: VintageStampPosition;
  notePosition: VintageNotePosition;
  intensity: VintageIntensity;
  onStampPositionChange: (value: VintageStampPosition) => void;
  onNotePositionChange: (value: VintageNotePosition) => void;
  onIntensityChange: (value: VintageIntensity) => void;
}) {
  return (
    <>
      <hr className="border-[#262626]" />
      <section className="flex flex-col gap-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400" /> Vintage Options
        </h3>
        <div className="flex flex-col gap-4">
          <SegmentedOption
            label="Stamp Position"
            value={stampPosition}
            options={VINTAGE_STAMP_POSITIONS}
            onChange={onStampPositionChange}
          />
          <SegmentedOption
            label="Note Position"
            value={notePosition}
            options={VINTAGE_NOTE_POSITIONS}
            onChange={onNotePositionChange}
          />
          <SegmentedOption
            label="Vintage Intensity"
            value={intensity}
            options={VINTAGE_INTENSITIES}
            onChange={onIntensityChange}
          />
        </div>
      </section>
    </>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [value, delayMs]);

  return debouncedValue;
}

const DESKTOP_PREVIEW_CANVAS_WIDTH = 1080;
const COMPACT_PREVIEW_CANVAS_WIDTH = 720;
const COMPACT_PREVIEW_QUERY = "(max-width: 1023px)";
const TEXT_SCALE_MIN = 0.5;
const TEXT_SCALE_MAX = 2;

function getPreviewCanvasWidth() {
  if (typeof window === "undefined") return DESKTOP_PREVIEW_CANVAS_WIDTH;
  return window.matchMedia(COMPACT_PREVIEW_QUERY).matches
    ? COMPACT_PREVIEW_CANVAS_WIDTH
    : DESKTOP_PREVIEW_CANVAS_WIDTH;
}

function usePreviewCanvasWidth() {
  const [canvasWidth, setCanvasWidth] = useState(getPreviewCanvasWidth);

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_PREVIEW_QUERY);
    const updateCanvasWidth = () => setCanvasWidth(getPreviewCanvasWidth());

    updateCanvasWidth();
    mediaQuery.addEventListener("change", updateCanvasWidth);
    return () => mediaQuery.removeEventListener("change", updateCanvasWidth);
  }, []);

  return canvasWidth;
}

const BACKGROUND_PRESETS = [
  { color: "#ffffff", label: "White" },
  { color: "#000000", label: "Black" },
  { color: "#f5f0eb", label: "Cream" },
] as const;

const STORYTELLER_BACKGROUND_PRESETS = [
  { color: "#F6F1E8", label: "Vintage Paper" },
  { color: "#F9F6F0", label: "Journal" },
  { color: "#FAF8F3", label: "Soft Paper" },
] as const;

const TRAVEL_BACKGROUND_PRESETS = [
  { color: "#fafafa", label: "Warm White" },
  { color: "#ffffff", label: "Pure White" },
  { color: "#f5f0eb", label: "Cream" },
] as const;

function getStyleBackgroundPresets(style: FrameStyle) {
  if (style === "storyteller") return STORYTELLER_BACKGROUND_PRESETS;
  if (style === "travel") return TRAVEL_BACKGROUND_PRESETS;
  return BACKGROUND_PRESETS;
}

function getDefaultBackgroundColor(style: FrameStyle) {
  return getStyleBackgroundPresets(style)[0].color;
}

const ASPECT_RATIOS = [
  { label: 'Original', w: 0, h: 0 },
  { label: '1:1', w: 1, h: 1 },
  { label: '4:5', w: 4, h: 5 },
  { label: '3:4', w: 3, h: 4 },
  { label: '16:9', w: 16, h: 9 },
  { label: '9:16', w: 9, h: 16 },
] as const;

export default function PreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { photos, activeIndex, isHydrated, storageWarning } = usePhotoStore();
  const activePhoto = photos[activeIndex];

  const [borderWeight, setBorderWeight] = useState(1);
  const [metadataTextScale, setMetadataTextScale] = useState(1);
  const [exportQuality, setExportQuality] = useState(92);
  const [exportFormat, setExportFormat] = useState<"jpeg" | "png">("jpeg");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ done: number; total: number } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showMetadata, setShowMetadata] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [vintageStampPosition, setVintageStampPosition] = useState<VintageStampPosition>("bottom-right");
  const [vintageNotePosition, setVintageNotePosition] = useState<VintageNotePosition>("bottom-left");
  const [vintageIntensity, setVintageIntensity] = useState<VintageIntensity>("classic");
  const [logoScale, setLogoScale] = useState(1);
  const [activeRatio, setActiveRatio] = useState('Original');
  const [selectedStyle, setSelectedStyle] = useState<FrameStyle>('classic');
  const [canvasReady, setCanvasReady] = useState(false);
  const [perPhotoExif, setPerPhotoExif] = useState<Record<number, ExifData>>({});
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);
  const loadedImgUrl = useRef<string | null>(null);
  const previewCanvasWidth = usePreviewCanvasWidth();

  const editedExif = useMemo(
    () => perPhotoExif[activeIndex] ?? activePhoto?.exifData ?? {},
    [perPhotoExif, activeIndex, activePhoto]
  );
  const setEditedExif = useCallback((updater: ExifData | ((prev: ExifData) => ExifData)) => {
    setPerPhotoExif(prev => ({
      ...prev,
      [activeIndex]: typeof updater === "function" ? updater(prev[activeIndex] ?? activePhoto?.exifData ?? {}) : updater,
    }));
  }, [activeIndex, activePhoto]);

  const backgroundPresets = getStyleBackgroundPresets(selectedStyle);
  const supportsCustomBackgroundColor = selectedStyle !== "storyteller" && selectedStyle !== "travel";
  const isCustomColor = supportsCustomBackgroundColor && !backgroundPresets.some(p => p.color === backgroundColor);

  const handleStyleChange = useCallback((style: FrameStyle) => {
    setSelectedStyle(style);
    setBackgroundColor(getDefaultBackgroundColor(style));
  }, []);

  const handleReset = useCallback(() => {
    setShowMetadata(true);
    setShowLogo(true);
    setBorderWeight(1);
    setMetadataTextScale(1);
    setBackgroundColor(getDefaultBackgroundColor(selectedStyle));
    setVintageStampPosition("bottom-right");
    setVintageNotePosition("bottom-left");
    setVintageIntensity("classic");
    setLogoScale(1);
    if (activePhoto) {
      setPerPhotoExif(prev => ({ ...prev, [activeIndex]: activePhoto.exifData }));
    }
  }, [activePhoto, activeIndex, selectedStyle]);

  const activeAspectRatio = (() => {
    const s = ASPECT_RATIOS.find(r => r.label === activeRatio);
    return s && s.w > 0 ? s.w / s.h : null;
  })();

  const currentPaintOptions = useMemo(() => ({
    aspectRatio: activeAspectRatio,
    showMetadata,
    showLogo,
    borderWeight,
    metadataTextScale,
    backgroundColor,
    logoScale,
    vintageStampPosition,
    vintageNotePosition,
    vintageIntensity,
  }), [
    activeAspectRatio,
    showMetadata,
    showLogo,
    borderWeight,
    metadataTextScale,
    backgroundColor,
    logoScale,
    vintageStampPosition,
    vintageNotePosition,
    vintageIntensity,
  ]);
  const debouncedEditedExif = useDebouncedValue(editedExif, 120);
  const debouncedPaintOptions = useDebouncedValue(currentPaintOptions, 120);
  const thumbnailExif = useMemo(() => activePhoto?.exifData ?? {}, [activePhoto]);

  const addToast = useCallback((type: "success" | "error", text: string) => {
    setToasts(prev => [...prev, { id: crypto.randomUUID(), type, text }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    if (!storageWarning) return;
    const id = setTimeout(() => {
      addToast("error", storageWarning);
      clearStorageWarning();
    }, 0);
    return () => clearTimeout(id);
  }, [storageWarning, addToast]);

  const resolveExportUrl = useCallback(
    async (photo: PhotoEntry): Promise<{ url: string; revoke: () => void; isLowRes: boolean }> => {
      if (photo.file) {
        const url = URL.createObjectURL(photo.file);
        return { url, revoke: () => URL.revokeObjectURL(url), isLowRes: false };
      }
      const fullBlob = await getPhotoBlob(photo.id);
      if (fullBlob) {
        const url = URL.createObjectURL(fullBlob);
        return { url, revoke: () => URL.revokeObjectURL(url), isLowRes: false };
      }
      return { url: photo.objectUrl, revoke: () => {}, isLowRes: true };
    },
    []
  );

  const resolveExportBlob = useCallback(
    async (photo: PhotoEntry): Promise<{ blob: Blob; isLowRes: boolean }> => {
      if (photo.file) return { blob: photo.file, isLowRes: false };
      const fullBlob = await getPhotoBlob(photo.id);
      if (fullBlob) return { blob: fullBlob, isLowRes: false };
      const res = await fetch(photo.objectUrl);
      return { blob: await res.blob(), isLowRes: true };
    },
    []
  );

  const handleExport = useCallback(async () => {
    if (isExporting || photos.length === 0 || !canvasReady) return;
    setIsExporting(true);

    const exportOpts = { format: exportFormat, quality: exportQuality, paintOptions: currentPaintOptions };
    const extension = exportFormat === "jpeg" ? "jpg" : "png";
    let warnedLowRes = false;

    try {
      if (photos.length === 1) {
        const photo = photos[0];
        const { url, revoke, isLowRes } = await resolveExportUrl(photo);
        const img = await loadImage(url);
        revoke();
        const exif = perPhotoExif[0] ?? photo.exifData;
        const blob = await exportFrameToBlob(img, exif, selectedStyle, exportOpts);
        const baseName = photo.filename.replace(/\.[^.]+$/, "");
        downloadBlob(blob, `frameshot-${baseName}.${extension}`);
        if (isLowRes) {
          addToast("error", "Exported at preview quality — original was not saved due to storage limits");
        } else {
          addToast("success", "Image exported successfully");
        }
      } else {
        const canUseWorker = typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined";

        if (canUseWorker) {
          const resolvedPhotos = await Promise.all(
            photos.map(async (photo, i) => {
              const { blob, isLowRes } = await resolveExportBlob(photo);
              return { id: photo.id, blob, exifData: perPhotoExif[i] ?? photo.exifData, filename: photo.filename, isLowRes };
            })
          );

          await new Promise<void>((resolve) => {
            const worker = new Worker(new URL("../../lib/export.worker.ts", import.meta.url));
            const results = new Map<string, { buffer: ArrayBuffer; filename: string; isLowRes: boolean }>();
            let failed = 0;

            worker.postMessage({
              photos: resolvedPhotos,
              style: selectedStyle,
              format: exportFormat,
              quality: exportQuality,
              paintOptions: currentPaintOptions,
            });

            worker.onmessage = async (e) => {
              const msg = e.data;
              if (msg.type === "progress") {
                setExportProgress({ done: msg.done, total: msg.total });
              } else if (msg.type === "result") {
                results.set(msg.id, { buffer: msg.buffer, filename: msg.filename, isLowRes: msg.isLowRes });
              } else if (msg.type === "error") {
                failed++;
              } else if (msg.type === "done") {
                worker.terminate();
                setExportProgress(null);

                if (results.size === 0) {
                  addToast("error", "Export failed — could not process any photos");
                } else {
                  const JSZip = (await import("jszip")).default;
                  const zip = new JSZip();
                  const usedNames = new Map<string, number>();
                  let anyLowRes = false;

                  for (const [, { buffer, filename, isLowRes }] of results) {
                    let baseName = filename.replace(/\.[^.]+$/, "");
                    const count = usedNames.get(baseName) ?? 0;
                    usedNames.set(baseName, count + 1);
                    if (count > 0) baseName = `${baseName}-${count + 1}`;
                    zip.file(`frameshot-${baseName}.${extension}`, buffer);
                    if (isLowRes) anyLowRes = true;
                  }

                  const zipBlob = await zip.generateAsync({ type: "blob" });
                  downloadBlob(zipBlob, "frameshot-export.zip");

                  if (failed > 0) {
                    addToast("success", `Exported ${results.size}/${photos.length} photos (${failed} failed)`);
                  } else if (anyLowRes) {
                    addToast("success", "Exported — some photos at preview quality due to storage limits");
                  } else {
                    addToast("success", `All ${results.size} photos exported successfully`);
                  }
                }
                resolve();
              }
            };

            worker.onerror = () => {
              worker.terminate();
              setExportProgress(null);
              addToast("error", "Export failed — please try again");
              resolve();
            };
          });
        } else {
          // Fallback: main-thread batch (older Safari)
          const JSZip = (await import("jszip")).default;
          const zip = new JSZip();
          const usedNames = new Map<string, number>();
          let succeeded = 0;
          let failed = 0;

          for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            try {
              const { url, revoke, isLowRes } = await resolveExportUrl(photo);
              const img = await loadImage(url);
              revoke();
              const exif = perPhotoExif[i] ?? photo.exifData;
              const blob = await exportFrameToBlob(img, exif, selectedStyle, exportOpts);

              let baseName = photo.filename.replace(/\.[^.]+$/, "");
              const count = usedNames.get(baseName) ?? 0;
              usedNames.set(baseName, count + 1);
              if (count > 0) baseName = `${baseName}-${count + 1}`;

              zip.file(`frameshot-${baseName}.${extension}`, blob);
              succeeded++;
              if (isLowRes && !warnedLowRes) warnedLowRes = true;
            } catch {
              failed++;
            }
          }

          if (succeeded === 0) {
            addToast("error", "Export failed — could not process any photos");
          } else {
            const zipBlob = await zip.generateAsync({ type: "blob" });
            downloadBlob(zipBlob, "frameshot-export.zip");
            if (failed > 0) {
              addToast("success", `Exported ${succeeded}/${photos.length} photos (${failed} failed)`);
            } else if (warnedLowRes) {
              addToast("success", "Exported — some photos at preview quality due to storage limits");
            } else {
              addToast("success", `All ${succeeded} photos exported successfully`);
            }
          }
        }
      }
    } catch {
      addToast("error", "Export failed — please try again");
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [isExporting, photos, perPhotoExif, selectedStyle, exportFormat, exportQuality, canvasReady, currentPaintOptions, addToast, resolveExportUrl, resolveExportBlob]);

  const FADE_DURATION_MS = 200;
  const handleRatioChange = useCallback((label: string) => {
    if (label === activeRatio) return;
    setCanvasReady(false);
    setTimeout(() => setActiveRatio(label), FADE_DURATION_MS);
  }, [activeRatio]);

  useEffect(() => {
    if (isHydrated && !activePhoto) {
      router.replace("/");
      return;
    }

    if (!activePhoto) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = previewCanvasWidth;

    const renderWithImage = (img: HTMLImageElement) => {
      renderFrame(canvas, img, debouncedEditedExif, selectedStyle, debouncedPaintOptions).then(() => {
        setCanvasReady(true);
      });
    };

    if (loadedImgRef.current && loadedImgUrl.current === activePhoto.objectUrl) {
      renderWithImage(loadedImgRef.current);
      return;
    }

    loadedImgRef.current = null;
    setLoadedImg(null);
    loadedImgUrl.current = activePhoto.objectUrl;
    const img = new Image();
    img.src = activePhoto.objectUrl;
    img.onload = () => {
      loadedImgRef.current = img;
      setLoadedImg(img);
      loadedImgUrl.current = activePhoto.objectUrl;
      renderWithImage(img);
    };
  }, [activePhoto, debouncedEditedExif, activeRatio, selectedStyle, debouncedPaintOptions, previewCanvasWidth, isHydrated, router]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#0a0a0a] text-white font-sans lg:flex-row">
      <input id="mobile-customize-sheet" type="checkbox" aria-label="Customize sheet" className="peer sr-only" />

      {/* Left Column (Canvas + Bottom Bar) */}
      <div className="flex min-h-0 flex-1 flex-col border-[#262626] lg:border-r">
        <header className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-[#262626] bg-[#0a0a0a] px-4 shrink-0 z-10 sm:px-6">
          <Link href="/" className="flex items-center gap-2 justify-self-start text-sm text-[#a1a1a1] hover:text-white transition-colors whitespace-nowrap">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="min-w-0 w-full overflow-hidden lg:max-w-[520px] lg:justify-self-center">
            <Filmstrip photos={photos} activeIndex={activeIndex} />
          </div>
          <span className="hidden justify-self-end text-xs text-neutral-600 tabular-nums lg:inline">
            {photos.length > 1 ? `${activeIndex + 1}/${photos.length}` : ""}
          </span>
          <button
            onClick={handleExport}
            disabled={isExporting || photos.length === 0 || !canvasReady}
            className="flex h-9 min-w-9 items-center justify-center justify-self-end gap-2 rounded-lg bg-white px-3 text-xs font-bold text-black transition-colors hover:bg-neutral-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 lg:hidden"
            aria-label={photos.length > 1 ? `Export all ${photos.length} photos` : "Export image"}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {isExporting && exportProgress
                ? `${exportProgress.done}/${exportProgress.total}`
                : "Export"}
            </span>
          </button>
        </header>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#121212] p-4 relative sm:p-6 lg:p-8">
          <canvas
            ref={canvasRef}
            id="frame-canvas"
            className={`max-w-full max-h-full object-contain shadow-2xl rounded transition-all duration-200 ease-out ${canvasReady ? "blur-0 scale-100" : "blur-md scale-[0.98]"}`}
          />
        </div>

        {/* Bottom Bar: Aspect Ratios (centered) + Frame Styles (scrollable) */}
        <div className="border-t border-[#262626] bg-[#0a0a0a] px-4 py-2 flex flex-col gap-3 shrink-0 z-10 sm:px-6">
          <div className="overflow-x-auto scrollbar-hide pb-1">
            <div className="mx-auto flex w-max items-center gap-4 sm:gap-5">
              {ASPECT_RATIOS.map(ratio => {
                const isOriginal = ratio.w === 0;
                const shapeW = isOriginal ? 20 : Math.max(14, Math.min(32, (ratio.w / ratio.h) * 24));
                const shapeH = isOriginal ? 26 : Math.max(14, Math.min(32, (ratio.h / ratio.w) * 24));
                const isActive = activeRatio === ratio.label;

                return (
                  <button
                    key={ratio.label}
                    onClick={() => handleRatioChange(ratio.label)}
                    className="flex shrink-0 flex-col items-center gap-1 group transition-all duration-300"
                  >
                    <div className="h-8 flex items-center justify-center">
                      <div
                        className={`rounded-[3px] transition-all duration-300 ${
                          isActive
                          ? "border-[1.5px] border-white shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                          : "border-[1px] border-neutral-700 group-hover:border-neutral-500"
                        }`}
                        style={{ width: `${shapeW}px`, height: `${shapeH}px` }}
                      />
                    </div>
                    <span className={`text-[9px] font-semibold transition-colors duration-300 ${
                      isActive ? "text-white" : "text-neutral-600 group-hover:text-neutral-400"
                    }`}>
                      {ratio.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <StylePicker
            selectedStyle={selectedStyle}
            onStyleChange={handleStyleChange}
            image={loadedImg}
            exifData={thumbnailExif}
          />

          <label
            htmlFor="mobile-customize-sheet"
            role="button"
            tabIndex={0}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-[#121212] text-sm font-semibold text-white transition-colors hover:border-neutral-600 lg:hidden"
          >
            <Settings2 className="w-4 h-4 text-neutral-400" /> Customize
          </label>
        </div>
      </div>

      {/* Right Column (Customize Menu) */}
      <div className="hidden w-[340px] shrink-0 flex-col bg-[#0a0a0a] z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] lg:flex">
        <div className="h-14 px-4 border-b border-[#262626] shrink-0 flex items-center justify-between sm:h-16 sm:px-6">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-neutral-400" /> Customize
          </h2>
          <button onClick={handleReset} className="text-sm text-neutral-400 hover:text-white transition-colors">Reset</button>
        </div>

        <div className="flex flex-col gap-7 p-4 scrollbar-hide sm:p-6 lg:flex-1 lg:overflow-y-auto lg:gap-8">
          {/* Visual Settings */}
          <section className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-neutral-400" /> Visual
            </h3>

            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between gap-4 cursor-pointer group">
                <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">Show Metadata (EXIF)</span>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" checked={showMetadata} onChange={() => setShowMetadata(!showMetadata)} />
                  <div className="w-9 h-5 bg-[#262626] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                </div>
              </label>

              {FRAME_STYLE_CONFIGS[selectedStyle].hasLogo && (
                <label className="flex items-center justify-between gap-4 cursor-pointer group">
                  <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">Show Camera Logo</span>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" className="sr-only peer" checked={showLogo} onChange={() => setShowLogo(!showLogo)} />
                    <div className="w-9 h-5 bg-[#262626] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                  </div>
                </label>
              )}
            </div>

            {/* Border Weight Slider */}
            <div className="flex flex-col gap-3">
              <label className="text-sm text-neutral-400 flex justify-between items-center">
                <span>Border Weight</span>
                <span className="text-neutral-500 font-medium">{borderWeight}x</span>
              </label>
              <div className="relative flex items-center h-4">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={borderWeight}
                  onChange={(e) => setBorderWeight(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 border border-neutral-700 rounded-full appearance-none cursor-pointer outline-none focus:outline-none z-10 bg-no-repeat [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
                  style={{
                    backgroundImage: 'linear-gradient(white, white)',
                    backgroundSize: `${((borderWeight - 0.5) / 1.5) * 100}% 100%`
                  }}
                />
              </div>
            </div>

            {/* Metadata Text Size Slider */}
            <div className="flex flex-col gap-3">
              <label className="text-sm text-neutral-400 flex justify-between items-center">
                <span>EXIF Text Size</span>
                <span className="text-neutral-500 font-medium">{metadataTextScale}x</span>
              </label>
              <div className="relative flex items-center h-4">
                <input
                  type="range"
                  min={TEXT_SCALE_MIN}
                  max={TEXT_SCALE_MAX}
                  step="0.1"
                  value={metadataTextScale}
                  onChange={(e) => setMetadataTextScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 border border-neutral-700 rounded-full appearance-none cursor-pointer outline-none focus:outline-none z-10 bg-no-repeat [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
                  style={{
                    backgroundImage: 'linear-gradient(white, white)',
                    backgroundSize: `${((metadataTextScale - TEXT_SCALE_MIN) / (TEXT_SCALE_MAX - TEXT_SCALE_MIN)) * 100}% 100%`
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm text-neutral-400">Background</label>
              <div className="flex flex-wrap gap-3 items-center">
                {backgroundPresets.map(({ color, label }) => {
                  const isActive = backgroundColor === color;
                  return (
                    <button
                      key={color}
                      title={label}
                      onClick={() => setBackgroundColor(color)}
                      className={`w-8 h-8 rounded-full border-2 shadow-sm transition-all hover:scale-110 ${
                        isActive ? "border-white scale-110" : "border-neutral-800"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
                {supportsCustomBackgroundColor && (
                  <div className="relative">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                        isCustomColor ? "border-white scale-110" : "border-neutral-800"
                      }`}
                      style={{ background: isCustomColor ? backgroundColor : "conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
                    >
                      {!isCustomColor && <div className="w-3 h-3 rounded-full bg-[#0a0a0a]" />}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {selectedStyle === "vintage" && (
            <VintageOptions
              stampPosition={vintageStampPosition}
              notePosition={vintageNotePosition}
              intensity={vintageIntensity}
              onStampPositionChange={setVintageStampPosition}
              onNotePositionChange={setVintageNotePosition}
              onIntensityChange={setVintageIntensity}
            />
          )}

          {selectedStyle === "signature" && (
            <>
              <hr className="border-[#262626]" />
              <section className="flex flex-col gap-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-neutral-400" /> Signature Options
                </h3>
                <div className="flex flex-col gap-3">
                  <label className="text-sm text-neutral-400 flex justify-between items-center">
                    <span>Logo Size</span>
                    <span className="text-neutral-500 font-medium">{logoScale}x</span>
                  </label>
                  <div className="relative flex items-center h-4">
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={logoScale}
                      onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-800 border border-neutral-700 rounded-full appearance-none cursor-pointer outline-none focus:outline-none z-10 bg-no-repeat [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
                      style={{
                        backgroundImage: 'linear-gradient(white, white)',
                        backgroundSize: `${((logoScale - 0.5) / 1.5) * 100}% 100%`
                      }}
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          <hr className="border-[#262626]" />

          <section className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-400" /> Metadata Overrides
            </h3>

            {(() => {
              const config = FRAME_STYLE_CONFIGS[selectedStyle];
              const fullWidthSlots = config.slots.filter(s => !s.half);
              const halfWidthSlots = config.slots.filter(s => s.half);

              return (
                <div className="flex flex-col gap-4">
                  {fullWidthSlots.map(slot => (
                    <ExifInput
                      key={slot.key}
                      label={slot.label}
                      value={editedExif[slot.key]}
                      onChange={(v) => setEditedExif(prev => ({ ...prev, [slot.key]: v }))}
                      placeholder={slot.placeholder}
                    />
                  ))}
                  {halfWidthSlots.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 mt-1 sm:grid-cols-2 lg:grid-cols-2">
                      {halfWidthSlots.map(slot => (
                        <ExifInput
                          key={slot.key}
                          label={slot.label}
                          value={editedExif[slot.key]}
                          onChange={(v) => setEditedExif(prev => ({ ...prev, [slot.key]: v }))}
                          placeholder={slot.placeholder}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </section>

          <hr className="border-[#262626]" />

          <section className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-neutral-400" /> Export Settings
            </h3>

            <div className="bg-[#121212] border border-neutral-800 rounded-xl overflow-hidden">
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-neutral-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">Format</h4>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(["jpeg", "png"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        exportFormat === fmt
                          ? "bg-white text-black"
                          : "bg-[#262626] text-neutral-400 hover:text-neutral-300"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {exportFormat === "jpeg" && (
                <>
                  <div className="border-t border-neutral-800" />
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-400">Quality</span>
                      <span className="text-xs text-neutral-500 font-medium">{exportQuality}%</span>
                    </div>
                    <div className="relative flex items-center h-4">
                      <input
                        type="range"
                        min="85"
                        max="100"
                        step="1"
                        value={exportQuality}
                        onChange={(e) => setExportQuality(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-neutral-800 border border-neutral-700 rounded-full appearance-none cursor-pointer outline-none focus:outline-none z-10 bg-no-repeat [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
                        style={{
                          backgroundImage: 'linear-gradient(white, white)',
                          backgroundSize: `${((exportQuality - 85) / 15) * 100}% 100%`
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

        </div>

        <div className="px-4 py-4 border-t border-[#262626] shrink-0 bg-[#0a0a0a] sm:px-6">
          <button
            onClick={handleExport}
            disabled={isExporting || photos.length === 0 || !canvasReady}
            className="w-full bg-white text-black py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-neutral-200 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isExporting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {exportProgress ? `Exporting ${exportProgress.done}/${exportProgress.total}...` : "Exporting..."}</>
            ) : (
              <><Download className="w-4 h-4" /> {photos.length > 1 ? `Export All (${photos.length})` : "Export Image"}</>
            )}
          </button>
        </div>
      </div>

      <div className="pointer-events-none invisible fixed inset-0 z-40 flex items-end bg-black/0 opacity-0 transition-[background-color,opacity,visibility] duration-300 ease-out peer-checked:pointer-events-auto peer-checked:visible peer-checked:bg-black/35 peer-checked:opacity-100 peer-checked:[&_.sheet-panel]:translate-y-0 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-customize-title">
          <label
            htmlFor="mobile-customize-sheet"
            aria-label="Close customize"
            className="absolute inset-0 cursor-default"
          />
          <div className="sheet-panel relative flex max-h-[50dvh] w-full translate-y-full flex-col overflow-hidden rounded-t-lg border-t border-[#262626] bg-[#0a0a0a] shadow-[0_-12px_36px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out">
            <div className="h-14 px-4 border-b border-[#262626] shrink-0 flex items-center justify-between">
              <h2 id="mobile-customize-title" className="font-semibold text-white flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-neutral-400" /> Customize
              </h2>
              <div className="flex items-center gap-3">
                <button onClick={handleReset} className="text-sm text-neutral-400 hover:text-white transition-colors">Reset</button>
                <label
                  htmlFor="mobile-customize-sheet"
                  role="button"
                  tabIndex={0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
                  aria-label="Close customize"
                >
                  <X className="w-4 h-4" />
                </label>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto p-4 scrollbar-hide">
              <section className="flex flex-col gap-6">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-neutral-400" /> Visual
                </h3>

                <div className="flex flex-col gap-4">
                  <label className="flex items-center justify-between gap-4 cursor-pointer group">
                    <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">Show Metadata (EXIF)</span>
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" className="sr-only peer" checked={showMetadata} onChange={() => setShowMetadata(!showMetadata)} />
                      <div className="w-9 h-5 bg-[#262626] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                    </div>
                  </label>

                  {FRAME_STYLE_CONFIGS[selectedStyle].hasLogo && (
                    <label className="flex items-center justify-between gap-4 cursor-pointer group">
                      <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">Show Camera Logo</span>
                      <div className="relative inline-flex items-center">
                        <input type="checkbox" className="sr-only peer" checked={showLogo} onChange={() => setShowLogo(!showLogo)} />
                        <div className="w-9 h-5 bg-[#262626] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                      </div>
                    </label>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm text-neutral-400 flex justify-between items-center">
                    <span>Border Weight</span>
                    <span className="text-neutral-500 font-medium">{borderWeight}x</span>
                  </label>
                  <div className="relative flex items-center h-4">
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={borderWeight}
                      onChange={(e) => setBorderWeight(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-800 border border-neutral-700 rounded-full appearance-none cursor-pointer outline-none focus:outline-none z-10 bg-no-repeat [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
                      style={{
                        backgroundImage: 'linear-gradient(white, white)',
                        backgroundSize: `${((borderWeight - 0.5) / 1.5) * 100}% 100%`
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm text-neutral-400 flex justify-between items-center">
                    <span>EXIF Text Size</span>
                    <span className="text-neutral-500 font-medium">{metadataTextScale}x</span>
                  </label>
                  <div className="relative flex items-center h-4">
                    <input
                      type="range"
                      min={TEXT_SCALE_MIN}
                      max={TEXT_SCALE_MAX}
                      step="0.1"
                      value={metadataTextScale}
                      onChange={(e) => setMetadataTextScale(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-800 border border-neutral-700 rounded-full appearance-none cursor-pointer outline-none focus:outline-none z-10 bg-no-repeat [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
                      style={{
                        backgroundImage: 'linear-gradient(white, white)',
                        backgroundSize: `${((metadataTextScale - TEXT_SCALE_MIN) / (TEXT_SCALE_MAX - TEXT_SCALE_MIN)) * 100}% 100%`
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm text-neutral-400">Background</label>
                  <div className="flex flex-wrap gap-3 items-center">
                    {backgroundPresets.map(({ color, label }) => {
                      const isActive = backgroundColor === color;
                      return (
                        <button
                          key={color}
                          title={label}
                          onClick={() => setBackgroundColor(color)}
                          className={`w-8 h-8 rounded-full border-2 shadow-sm transition-all hover:scale-110 ${
                            isActive ? "border-white scale-110" : "border-neutral-800"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                    {supportsCustomBackgroundColor && (
                      <div className="relative">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                            isCustomColor ? "border-white scale-110" : "border-neutral-800"
                          }`}
                          style={{ background: isCustomColor ? backgroundColor : "conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
                        >
                          {!isCustomColor && <div className="w-3 h-3 rounded-full bg-[#0a0a0a]" />}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {selectedStyle === "vintage" && (
                <VintageOptions
                  stampPosition={vintageStampPosition}
                  notePosition={vintageNotePosition}
                  intensity={vintageIntensity}
                  onStampPositionChange={setVintageStampPosition}
                  onNotePositionChange={setVintageNotePosition}
                  onIntensityChange={setVintageIntensity}
                />
              )}

              {selectedStyle === "signature" && (
                <>
                  <hr className="border-[#262626]" />
                  <section className="flex flex-col gap-5">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-neutral-400" /> Signature Options
                    </h3>
                    <div className="flex flex-col gap-3">
                      <label className="text-sm text-neutral-400 flex justify-between items-center">
                        <span>Logo Size</span>
                        <span className="text-neutral-500 font-medium">{logoScale}x</span>
                      </label>
                      <div className="relative flex items-center h-4">
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={logoScale}
                          onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-neutral-800 border border-neutral-700 rounded-full appearance-none cursor-pointer outline-none focus:outline-none z-10 bg-no-repeat [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
                          style={{
                            backgroundImage: 'linear-gradient(white, white)',
                            backgroundSize: `${((logoScale - 0.5) / 1.5) * 100}% 100%`
                          }}
                        />
                      </div>
                    </div>
                  </section>
                </>
              )}

              <hr className="border-[#262626]" />

              <section className="flex flex-col gap-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-neutral-400" /> Metadata Overrides
                </h3>

                {(() => {
                  const config = FRAME_STYLE_CONFIGS[selectedStyle];
                  const fullWidthSlots = config.slots.filter(s => !s.half);
                  const halfWidthSlots = config.slots.filter(s => s.half);

                  return (
                    <div className="flex flex-col gap-4">
                      {fullWidthSlots.map(slot => (
                        <ExifInput
                          key={slot.key}
                          label={slot.label}
                          value={editedExif[slot.key]}
                          onChange={(v) => setEditedExif(prev => ({ ...prev, [slot.key]: v }))}
                          placeholder={slot.placeholder}
                        />
                      ))}
                      {halfWidthSlots.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 mt-1 sm:grid-cols-2">
                          {halfWidthSlots.map(slot => (
                            <ExifInput
                              key={slot.key}
                              label={slot.label}
                              value={editedExif[slot.key]}
                              onChange={(v) => setEditedExif(prev => ({ ...prev, [slot.key]: v }))}
                              placeholder={slot.placeholder}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </section>

              <hr className="border-[#262626]" />

              <section className="flex flex-col gap-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-neutral-400" /> Export Settings
                </h3>

                <div className="bg-[#121212] border border-neutral-800 rounded-xl overflow-hidden">
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-neutral-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">Format</h4>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(["jpeg", "png"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            exportFormat === fmt
                              ? "bg-white text-black"
                              : "bg-[#262626] text-neutral-400 hover:text-neutral-300"
                          }`}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {exportFormat === "jpeg" && (
                    <>
                      <div className="border-t border-neutral-800" />
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-400">Quality</span>
                          <span className="text-xs text-neutral-500 font-medium">{exportQuality}%</span>
                        </div>
                        <div className="relative flex items-center h-4">
                          <input
                            type="range"
                            min="85"
                            max="100"
                            step="1"
                            value={exportQuality}
                            onChange={(e) => setExportQuality(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-neutral-800 border border-neutral-700 rounded-full appearance-none cursor-pointer outline-none focus:outline-none z-10 bg-no-repeat [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
                            style={{
                              backgroundImage: 'linear-gradient(white, white)',
                              backgroundSize: `${((exportQuality - 85) / 15) * 100}% 100%`
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </div>

          </div>
        </div>

      <Toast messages={toasts} onDismiss={dismissToast} />
    </div>
  );
}
