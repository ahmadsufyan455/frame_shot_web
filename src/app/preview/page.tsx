"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, SlidersHorizontal, Settings2, Image as ImageIcon, MapPin } from "lucide-react";
import StylePicker from "@/components/StylePicker";
import { paint as classicPaint } from "@/lib/styles/classic";

export default function PreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [borderWeight, setBorderWeight] = useState(1);
  const [exportQuality, setExportQuality] = useState(92);
  const [readGpsLocation, setReadGpsLocation] = useState(false);
  const [activeRatio, setActiveRatio] = useState('Original');

  const aspectRatios = [
    { label: 'Original', w: 3, h: 4 },
    { label: '1:1', w: 1, h: 1 },
    { label: '4:5', w: 4, h: 5 },
    { label: '3:4', w: 3, h: 4 },
    { label: '16:9', w: 16, h: 9 },
    { label: '9:16', w: 9, h: 16 },
  ];

  // Dummy render for classic frame preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions based on a 4:5 aspect ratio
    canvas.width = 1080;
    canvas.height = 1350;

    // Load a placeholder image to render
    const img = new Image();
    img.src = "https://images.unsplash.com/photo-1682687982501-1e5898cb4fe9?q=80&w=1080&auto=format&fit=crop";
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Dummy EXIF data
      const dummyExif = {
        make: "Sony",
        model: "ILCE-7RM4",
        lensModel: "FE 35mm F1.4 GM",
        focalLength: "35mm",
        aperture: "1.4",
        shutterSpeed: "1/500",
        iso: "100"
      };

      classicPaint(canvas, img, dummyExif);
    };
  }, []);

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
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[#121212] relative">
          <canvas 
            ref={canvasRef} 
            id="frame-canvas" 
            className="max-w-full max-h-full object-contain shadow-2xl rounded" 
            style={{ maxHeight: "calc(100vh - 16rem)" }}
          />
        </div>

        {/* Bottom Bar: Aspect Ratios & Style Picker */}
        <div className="h-auto border-t border-[#262626] bg-[#0a0a0a] px-6 py-4 flex flex-col gap-3 shrink-0 z-10">
          {/* Aspect Ratios */}
          <div className="flex flex-col gap-1">
            <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide px-2 items-center justify-center">
                {aspectRatios.map(ratio => (
                  <button 
                    key={ratio.label} 
                    onClick={() => setActiveRatio(ratio.label)}
                    className="flex flex-col items-center gap-2 group transition-all duration-300"
                  >
                    {/* Ratio Shape Visual - Hollow with Glow */}
                    <div className="h-10 flex items-center justify-center">
                      <div 
                        className={`rounded-[4px] transition-all duration-300 ${
                          activeRatio === ratio.label 
                          ? "border-[2px] border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                          : "border-[1.5px] border-neutral-700 group-hover:border-neutral-500"
                        }`}
                        style={{
                          width: `${Math.max(12, Math.min(36, (ratio.w / ratio.h) * 28))}px`,
                          height: `${Math.max(12, Math.min(36, (ratio.h / ratio.w) * 28))}px`
                        }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold transition-colors duration-300 ${
                      activeRatio === ratio.label ? "text-white" : "text-neutral-500 group-hover:text-neutral-400"
                    }`}>
                      {ratio.label}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Style Picker */}
          <StylePicker />
        </div>
      </div>

      {/* Right Column (Customize Menu) */}
      <div className="w-[340px] shrink-0 bg-[#0a0a0a] flex flex-col h-full z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="h-16 px-6 border-b border-[#262626] shrink-0 flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-neutral-400" /> Customize
          </h2>
          <button className="text-sm text-neutral-400 hover:text-white transition-colors">Reset</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scrollbar-hide">
          {/* Visual Settings */}
          <section className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-neutral-400" /> Visual
            </h3>
            
            {/* Toggles */}
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">Show Metadata (EXIF)</span>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-[#262626] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">Show Camera Logo</span>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
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

            {/* Background Color */}
            <div className="flex flex-col gap-3">
              <label className="text-sm text-neutral-400">Background</label>
              <div className="flex gap-3">
                {['#ffffff', '#000000', '#f5f5f5', '#1a1a1a'].map(color => (
                  <button 
                    key={color} 
                    className="w-8 h-8 rounded-full border-2 border-neutral-800 shadow-sm transition-transform hover:scale-110" 
                    style={{ backgroundColor: color }} 
                  />
                ))}
              </div>
            </div>
          </section>
          
          <hr className="border-[#262626]" />

          {/* Metadata Overrides */}
          <section className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-400" /> Metadata Overrides
            </h3>
            
            <div className="flex flex-col gap-4">
              {/* Camera */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-neutral-500">Camera</label>
                <input type="text" placeholder="Sony A7 IV" defaultValue="Sony ILCE-7RM4" className="w-full bg-[#121212] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
              </div>

              {/* Lens */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-neutral-500">Lens</label>
                <input type="text" placeholder="Sony FE 35mm f/1.4 GM" defaultValue="FE 35mm F1.4 GM" className="w-full bg-[#121212] border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-neutral-500">Aperture</label>
                  <input type="text" placeholder="f/1.4" defaultValue="f/1.4" className="w-full bg-[#121212] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-neutral-500">Shutter</label>
                  <input type="text" placeholder="1/500s" defaultValue="1/500s" className="w-full bg-[#121212] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-neutral-500">ISO</label>
                  <input type="text" placeholder="100" defaultValue="ISO 100" className="w-full bg-[#121212] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-neutral-500">Focal Length</label>
                  <input type="text" placeholder="35mm" defaultValue="35mm" className="w-full bg-[#121212] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors" />
                </div>
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
