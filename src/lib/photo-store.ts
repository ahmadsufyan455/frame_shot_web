import { useSyncExternalStore } from "react";
import type { ExifData } from "./exif";

export const MAX_PHOTOS = 10;

export interface PhotoEntry {
  objectUrl: string;
  exifData: ExifData;
  filename: string;
}

interface PhotoStoreState {
  photos: PhotoEntry[];
  activeIndex: number;
}

let state: PhotoStoreState = {
  photos: [],
  activeIndex: 0,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function addPhotos(entries: PhotoEntry[]) {
  const available = MAX_PHOTOS - state.photos.length;
  const toAdd = entries.slice(0, available);
  if (toAdd.length === 0) return;
  state = {
    photos: [...state.photos, ...toAdd],
    activeIndex: state.photos.length,
  };
  emit();
}

export function removePhoto(index: number) {
  const photo = state.photos[index];
  if (!photo) return;
  URL.revokeObjectURL(photo.objectUrl);
  const photos = state.photos.filter((_, i) => i !== index);
  let activeIndex = state.activeIndex;
  if (activeIndex >= photos.length) activeIndex = Math.max(0, photos.length - 1);
  state = { photos, activeIndex };
  emit();
}

export function setActiveIndex(index: number) {
  if (index < 0 || index >= state.photos.length) return;
  state = { ...state, activeIndex: index };
  emit();
}

export function clearPhotos() {
  state.photos.forEach((p) => URL.revokeObjectURL(p.objectUrl));
  state = { photos: [], activeIndex: 0 };
  emit();
}

export function getPhotoSnapshot(): PhotoStoreState {
  return state;
}

export function usePhotoStore() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getPhotoSnapshot,
    getPhotoSnapshot
  );
}
