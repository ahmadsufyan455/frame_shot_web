/**
 * lib/exif.ts — F-02: EXIF Extraction
 *
 * Wraps the `exifr` npm library with field normalisation.
 *
 * GPS data is read locally when present so styles can show approximate places.
 *
 * Usage:
 *   import { extractExif } from "@/lib/exif";
 *   const exifData = await extractExif(file);
 */

import exifr from "exifr";

/** The normalised EXIF fields used throughout the app */
export interface ExifData {
  make?: string;         // Camera Make  — e.g. "Sony"
  model?: string;        // Camera Model — e.g. "ILCE-7CM2"
  lensModel?: string;    // Lens Model   — e.g. "FE 35mm F1.8"
  aperture?: string;     // Formatted    — e.g. "f/1.8"
  shutterSpeed?: string; // Formatted    — e.g. "1/500s"
  iso?: string;          // Formatted    — e.g. "ISO 800"
  focalLength?: string;  // Formatted    — e.g. "35mm"
  exposureComp?: string; // Formatted    — e.g. "+0.3 EV"
  whiteBalance?: string; // Formatted    — e.g. "Auto"
  dateTime?: string;     // Formatted    — e.g. "May 3, 2026 · 14:32"
  location?: string;     // Place name   — e.g. "Yogyakarta"
  latitude?: string;     // Decimal GPS  — e.g. "35.670000"
  longitude?: string;    // Decimal GPS  — e.g. "139.650000"
}

/**
 * Extracts and normalises EXIF metadata from a File.
 * Returns an ExifData object — empty strings for missing fields (never null).
 *
 * TODO: Implement field normalisation (e.g. FNumber → "f/1.8")
 * TODO: Handle RAW formats via exifr options (metadata-only mode for performance)
 */
export async function extractExif(file: File): Promise<ExifData> {
  try {
    // exifr.parse reads only metadata — does NOT decode the full image
    const raw = await exifr.parse(file, {
      gps: true,
      // Request only the tags we need
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FNumber",
        "ExposureTime",
        "ISO",
        "FocalLength",
        "ExposureCompensation",
        "WhiteBalance",
        "DateTimeOriginal",
        "GPSLatitude",
        "GPSLatitudeRef",
        "GPSLongitude",
        "GPSLongitudeRef",
      ],
    });

    if (!raw) {
      return {}; // No EXIF — caller shows the "no data" banner
    }

    const latitude = formatCoordinate(raw.latitude);
    const longitude = formatCoordinate(raw.longitude);
    const location = latitude && longitude ? await reverseGeocodeLocation(latitude, longitude) : "";

    // TODO: Normalise each raw field to the display format
    return {
      make: raw.Make ?? "",
      model: raw.Model ?? "",
      lensModel: raw.LensModel ?? "",
      aperture: raw.FNumber ? `f/${raw.FNumber}` : "",
      shutterSpeed: raw.ExposureTime
        ? formatShutterSpeed(raw.ExposureTime)
        : "",
      iso: raw.ISO ? `ISO ${raw.ISO}` : "",
      focalLength: raw.FocalLength ? `${raw.FocalLength}mm` : "",
      exposureComp: raw.ExposureCompensation
        ? formatExposureComp(raw.ExposureCompensation)
        : "",
      whiteBalance: raw.WhiteBalance ?? "",
      dateTime: raw.DateTimeOriginal
        ? formatDateTime(raw.DateTimeOriginal)
        : "",
      location,
      latitude,
      longitude,
    };
  } catch {
    // Graceful fallback — return empty data, never throw to UI
    return {};
  }
}

function formatCoordinate(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(6) : "";
}

async function reverseGeocodeLocation(latitude: string, longitude: string): Promise<string> {
  if (typeof fetch !== "function") return "";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: latitude,
      lon: longitude,
      zoom: "10",
      addressdetails: "1",
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Accept-Language": typeof navigator !== "undefined" ? navigator.language : "en",
      },
    });

    if (!response.ok) return "";

    const data = await response.json() as {
      name?: string;
      address?: Record<string, string | undefined>;
    };
    const address = data.address ?? {};

    return (
      address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      address.city_district ??
      address.county ??
      address.state ??
      data.name ??
      ""
    );
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

/** Format shutter speed: 0.002 → "1/500s" */
function formatShutterSpeed(value: number): string {
  // TODO: Implement full shutter speed formatting
  if (value < 1) {
    return `1/${Math.round(1 / value)}s`;
  }
  return `${value}s`;
}

/** Format exposure compensation: 0.3 → "+0.3 EV" */
function formatExposureComp(value: number): string {
  // TODO: Implement rounding and sign handling
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} EV`;
}

/** Format date from EXIF Date object to "May 3, 2026 · 14:32" */
function formatDateTime(date: Date): string {
  // TODO: Localise using Intl.DateTimeFormat
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
