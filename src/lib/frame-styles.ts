import type { ExifData } from "./exif";

export type FrameStyle =
  | "classic"
  | "shot-on"
  | "minimal-line"
  | "fine-art"
  | "editorial"
  | "vintage"
  | "signature"
  | "storyteller"
  | "travel";

export interface ExifSlot {
  key: keyof ExifData;
  label: string;
  placeholder: string;
  half?: boolean;
}

export interface FrameStyleConfig {
  id: FrameStyle;
  label: string;
  description: string;
  slots: ExifSlot[];
  hasLogo?: boolean;
}

export const FRAME_STYLE_CONFIGS: Record<FrameStyle, FrameStyleConfig> = {
  classic: {
    id: "classic",
    label: "Classic",
    description: "White bottom bar, metadata on the right, clean and minimal",
    hasLogo: true,
    slots: [
      { key: "model", label: "Camera", placeholder: "e.g. ILCE-7CM2" },
      { key: "lensModel", label: "Lens", placeholder: "e.g. FE 35mm F1.8" },
      { key: "aperture", label: "Aperture", placeholder: "e.g. f/1.8", half: true },
      { key: "shutterSpeed", label: "Shutter", placeholder: "e.g. 1/500s", half: true },
      { key: "iso", label: "ISO", placeholder: "e.g. ISO 800", half: true },
      { key: "focalLength", label: "Focal Length", placeholder: "e.g. 35mm", half: true },
    ],
  },
  signature: {
    id: "signature",
    label: "Signature",
    description: "Gallery-exhibition layout with brand logo and bold specs readout",
    hasLogo: true,
    slots: [
      { key: "model", label: "Camera", placeholder: "e.g. ILCE-7CM2" },
      { key: "focalLength", label: "Focal Length", placeholder: "e.g. 35mm", half: true },
      { key: "aperture", label: "Aperture", placeholder: "e.g. f/1.8", half: true },
      { key: "shutterSpeed", label: "Shutter", placeholder: "e.g. 1/500s", half: true },
      { key: "iso", label: "ISO", placeholder: "e.g. ISO 800", half: true },
    ],
  },
  "shot-on": {
    id: "shot-on",
    label: "Shot On",
    description: "Centered 'Shot on' text with camera icon, minimal and bold",
    hasLogo: true,
    slots: [
      { key: "model", label: "Camera", placeholder: "e.g. Sony ILCE-7CM2" },
      { key: "lensModel", label: "Lens", placeholder: "e.g. FE 35MM F1.8" },
    ],
  },
  "minimal-line": {
    id: "minimal-line",
    label: "Minimal Line",
    description: "Inset border with floating pill badge, clean and modern",
    slots: [
      { key: "model", label: "Camera", placeholder: "e.g. ILCE-7CM2" },
      { key: "focalLength", label: "Focal Length", placeholder: "e.g. 35mm", half: true },
      { key: "aperture", label: "Aperture", placeholder: "e.g. f/1.8", half: true },
    ],
  },
  "fine-art": {
    id: "fine-art",
    label: "Fine Art",
    description: "Gallery-print layout with a deep bottom margin and museum plaque metadata",
    slots: [
      { key: "model", label: "Camera", placeholder: "e.g. ILCE-7CM2" },
      { key: "dateTime", label: "Capture Date", placeholder: "e.g. 2026-05-03" },
    ],
  },
  editorial: {
    id: "editorial",
    label: "Editorial",
    description: "Magazine-style bottom caption with a bold serif camera brand and exposure details",
    slots: [
      { key: "make", label: "Brand", placeholder: "e.g. Sony" },
      { key: "focalLength", label: "Focal Length", placeholder: "e.g. 35mm", half: true },
      { key: "aperture", label: "Aperture", placeholder: "e.g. f/1.8", half: true },
      { key: "shutterSpeed", label: "Shutter", placeholder: "e.g. 1/500s", half: true },
      { key: "iso", label: "ISO", placeholder: "e.g. ISO 800", half: true },
    ],
  },
  vintage: {
    id: "vintage",
    label: "Vintage",
    description: "Postcard-inspired frame with tape, stamp, texture, and handwritten notes",
    slots: [
      { key: "model", label: "Camera", placeholder: "e.g. ILCE-7CM2" },
      { key: "dateTime", label: "Capture Date", placeholder: "e.g. 2026-05-03" },
    ],
  },
  storyteller: {
    id: "storyteller",
    label: "Storyteller",
    description: "Journal-page layout with typewriter metadata and pasted-print photo",
    slots: [
      { key: "model", label: "Camera", placeholder: "e.g. ILCE-7CM2" },
      { key: "make", label: "Brand", placeholder: "e.g. Sony" },
      { key: "dateTime", label: "Capture Date", placeholder: "e.g. 2026-05-03" },
      { key: "location", label: "Location", placeholder: "e.g. Yogyakarta" },
    ],
  },
  travel: {
    id: "travel",
    label: "Travel",
    description: "Gallery-print travel keepsake with handwritten location and month-year caption",
    slots: [
      { key: "location", label: "Location", placeholder: "e.g. Kyoto, Japan" },
      { key: "dateTime", label: "Capture Date", placeholder: "e.g. 2026-05" },
    ],
  },
};

export const FRAME_STYLES = Object.values(FRAME_STYLE_CONFIGS);
