import { useSyncExternalStore } from "react";
import type { ExifData } from "./exif";

interface PhotoState {
  objectUrl: string | null;
  exifData: ExifData;
  filename: string;
}

let state: PhotoState = {
  objectUrl: null,
  exifData: {},
  filename: "",
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setPhoto(objectUrl: string, exifData: ExifData, filename: string) {
  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
  }
  state = { objectUrl, exifData, filename };
  emit();
}

export function clearPhoto() {
  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
  }
  state = { objectUrl: null, exifData: {}, filename: "" };
  emit();
}

export function getPhotoSnapshot(): PhotoState {
  return state;
}

export function usePhotoStore(): PhotoState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getPhotoSnapshot,
    getPhotoSnapshot
  );
}
