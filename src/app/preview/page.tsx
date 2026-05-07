"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, SlidersHorizontal, Settings2, Image as ImageIcon, MapPin } from "lucide-react";
import StylePicker, { type FrameStyle } from "@/components/StylePicker";
import { renderFrame } from "@/lib/renderer";
import { usePhotoStore } from "@/lib/photo-store";

function ExifInput({ label, field, value, onChange, placeholder }: {
  label: string;
  field: string;
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

const BACKGROUND_PRESETS = [
  { color: "#ffffff", label: "White" },
  { color: "#000000", label: "Black" },
  { color: "#f5f0eb", label: "Cream" },
] as const;

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
  const { objectUrl, exifData } = usePhotoStore();
  const [borderWeight, setBorderWeight] = useState(1);
  const [exportQuality, setExportQuality] = useState(92);
  const [readGpsLocation, setReadGpsLocation] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [activeRatio, setActiveRatio] = useState('Original');
  const [selectedStyle, setSelectedStyle] = useState<FrameStyle>('classic');
  const [canvasReady, setCanvasReady] = useState(false);
  const [editedExif, setEditedExif] = useState(exifData);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);
  const exifInitialized = useRef(false);

  useEffect(() => {
    if (!exifInitialized.current && Object.keys(exifData).some(k => exifData[k as keyof typeof exifData])) {
      setEditedExif(exifData);
      exifInitialized.current = true;
    }
  }, [exifData]);

  const isCustomColor = !BACKGROUND_PRESETS.some(p => p.color === backgroundColor);

  const handleReset = useCallback(() => {
    setShowMetadata(true);
    setShowLogo(true);
    setBorderWeight(1);
    setBackgroundColor("#ffffff");
    setEditedExif(exifData);
  }, [exifData]);

  const activeAspectRatio = (() => {
    const s = ASPECT_RATIOS.find(r => r.label === activeRatio);
    return s && s.w > 0 ? s.w / s.h : null;
  })();

  const FADE_DURATION_MS = 200;
  const handleRatioChange = useCallback((label: string) => {
    setCanvasReady(false);
    setTimeout(() => setActiveRatio(label), FADE_DURATION_MS);
  }, []);

  useEffect(() => {
    if (!objectUrl) {
      router.replace("/");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1080;

    const paintOptions = {
      aspectRatio: activeAspectRatio,
      showMetadata,
      showLogo,
      borderWeight,
      backgroundColor,
    };

    const renderWithImage = (img: HTMLImageElement) => {
      renderFrame(canvas, img, editedExif, selectedStyle, paintOptions).then(() => {
        setCanvasReady(true);
      });
    };

    if (loadedImgRef.current) {
      renderWithImage(loadedImgRef.current);
      return;
    }

    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      loadedImgRef.current = img;
      renderWithImage(img);
    };
  }, [objectUrl, editedExif, activeRatio, selectedStyle, showMetadata, showLogo, borderWeight, backgroundColor, router]);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      
      {/* Left Column (Canvas + Bottom Bar) */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#262626]">
        {/* Header */}
        <header className="h-16 flex items-center px-6 border-b border-[#262626] shrink-0 bg-[#0a0a0a] z-10">
          <Link href="/" className="flex items-center gap-2 text-sm text-[#a1a1a1] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Upload
          </Link>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center p-8 bg-[#121212] relative">
          <canvas 
            ref={canvasRef} 
            id="frame-canvas" 
            className={`max-w-full max-h-full object-contain shadow-2xl rounded transition-all duration-200 ease-out ${canvasReady ? "blur-0 scale-100" : "blur-md scale-[0.98]"}`}
          />
        </div>

        {/* Bottom Bar: Aspect Ratios (centered) + Frame Styles (scrollable) */}
        <div className="border-t border-[#262626] bg-[#0a0a0a] px-6 py-2 flex flex-col gap-2 shrink-0 z-10">
          <div className="flex gap-5 items-center justify-center">
            {ASPECT_RATIOS.map(ratio => {
              const isOriginal = ratio.w === 0;
              const shapeW = isOriginal ? 16 : Math.max(10, Math.min(24, (ratio.w / ratio.h) * 18));
              const shapeH = isOriginal ? 20 : Math.max(10, Math.min(24, (ratio.h / ratio.w) * 18));
              const isActive = activeRatio === ratio.label;

              return (
                <button 
                  key={ratio.label} 
                  onClick={() => handleRatioChange(ratio.label)}
                  className="flex flex-col items-center gap-1 group transition-all duration-300"
                >
                  <div className="h-6 flex items-center justify-center">
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

          <StylePicker
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            image={loadedImgRef.current}
            exifData={editedExif}
            paintOptions={{ aspectRatio: activeAspectRatio, showMetadata, showLogo, borderWeight, backgroundColor }}
          />
        </div>
      </div>

      {/* Right Column (Customize Menu) */}
      <div className="w-[340px] shrink-0 bg-[#0a0a0a] flex flex-col h-full z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="h-16 px-6 border-b border-[#262626] shrink-0 flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-neutral-400" /> Customize
          </h2>
          <button onClick={handleReset} className="text-sm text-neutral-400 hover:text-white transition-colors">Reset</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scrollbar-hide">
          {/* Visual Settings */}
          <section className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-neutral-400" /> Visual
            </h3>
            
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">Show Metadata (EXIF)</span>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" checked={showMetadata} onChange={() => setShowMetadata(!showMetadata)} />
                  <div className="w-9 h-5 bg-[#262626] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">Show Camera Logo</span>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" checked={showLogo} onChange={() => setShowLogo(!showLogo)} />
                  <div className="w-9 h-5 bg-[#262626] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                </div>
              </label>
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

            <div className="flex flex-col gap-3">
              <label className="text-sm text-neutral-400">Background</label>
              <div className="flex gap-3 items-center">
                {BACKGROUND_PRESETS.map(({ color, label }) => {
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
              </div>
            </div>
          </section>
          
          <hr className="border-[#262626]" />

          <section className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-400" /> Metadata Overrides
            </h3>
            
            <div className="flex flex-col gap-4">
              <ExifInput label="Camera" field="model" value={editedExif.model} onChange={(v) => setEditedExif(prev => ({ ...prev, model: v }))} placeholder="e.g. ILCE-7CM2" />
              <ExifInput label="Lens" field="lensModel" value={editedExif.lensModel} onChange={(v) => setEditedExif(prev => ({ ...prev, lensModel: v }))} placeholder="e.g. FE 35mm F1.8" />
              <div className="grid grid-cols-2 gap-4 mt-1">
                <ExifInput label="Aperture" field="aperture" value={editedExif.aperture} onChange={(v) => setEditedExif(prev => ({ ...prev, aperture: v }))} placeholder="e.g. f/1.8" />
                <ExifInput label="Shutter" field="shutterSpeed" value={editedExif.shutterSpeed} onChange={(v) => setEditedExif(prev => ({ ...prev, shutterSpeed: v }))} placeholder="e.g. 1/500s" />
                <ExifInput label="ISO" field="iso" value={editedExif.iso} onChange={(v) => setEditedExif(prev => ({ ...prev, iso: v }))} placeholder="e.g. ISO 800" />
                <ExifInput label="Focal Length" field="focalLength" value={editedExif.focalLength} onChange={(v) => setEditedExif(prev => ({ ...prev, focalLength: v }))} placeholder="e.g. 35mm" />
              </div>
            </div>
          </section>

          <hr className="border-[#262626]" />

          <section className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-neutral-400" /> Export Settings
            </h3>
            
            <div className="bg-[#121212] border border-neutral-800 rounded-2xl overflow-hidden">
              {/* Quality Slider Section */}
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-neutral-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="text-sm font-semibold text-white">Export Quality</h4>
                      <span className="text-xs text-neutral-500 font-medium">{exportQuality}%</span>
                    </div>
                    <p className="text-xs text-neutral-500">Adjust image resolution</p>
                  </div>
                </div>
                
                <div className="relative flex items-center h-4 px-1">
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

              <div className="border-t border-neutral-800" />

              {/* GPS Toggle Section */}
              <label className="p-4 flex items-center gap-3 cursor-pointer group hover:bg-neutral-800/30 transition-colors">
                <div className="text-neutral-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">Read GPS Location</h4>
                  <p className="text-xs text-neutral-500">Include location in EXIF</p>
                </div>
                <div className="relative inline-flex items-center">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={readGpsLocation}
                    onChange={() => setReadGpsLocation(!readGpsLocation)}
                  />
                  <div className="w-9 h-5 bg-[#262626] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                </div>
              </label>
            </div>
          </section>

        </div>
        
        {/* Export Button Area */}
        <div className="px-6 py-4 border-t border-[#262626] shrink-0 bg-[#0a0a0a]">
          <button className="w-full bg-white text-black py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-neutral-200 transition-colors active:scale-[0.98]">
              <Download className="w-4 h-4" /> Export Image
          </button>
        </div>
      </div>

    </div>
  );
}
