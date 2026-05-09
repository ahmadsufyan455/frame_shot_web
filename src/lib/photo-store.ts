import { useSyncExternalStore } from "react";
import type { ExifData } from "./exif";

export const MAX_PHOTOS = 10;

export interface PhotoEntry {
  id: string;
  objectUrl: string;
  exifData: ExifData;
  filename: string;
  file?: Blob;
}

interface PhotoStoreState {
  photos: PhotoEntry[];
  activeIndex: number;
  isHydrated: boolean;
}

let state: PhotoStoreState = {
  photos: [],
  activeIndex: 0,
  isHydrated: false,
};

const listeners = new Set<() => void>();
const DB_NAME = "frameshot-photo-store";
const DB_VERSION = 1;
const PHOTO_STORE = "photos";
const ACTIVE_INDEX_KEY = "frameshot-active-index";
let hydrationStarted = false;
let dbPromise: Promise<IDBDatabase> | null = null;

interface StoredPhotoEntry {
  id: string;
  blob: Blob;
  exifData: ExifData;
  filename: string;
  order: number;
}

function emit() {
  listeners.forEach((l) => l());
}

function canUseStorage() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openPhotoDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function readStoredPhotos(): Promise<StoredPhotoEntry[]> {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE, "readonly");
    const request = transaction.objectStore(PHOTO_STORE).getAll();

    request.onsuccess = () => resolve(request.result as StoredPhotoEntry[]);
    request.onerror = () => reject(request.error);
  });
}

async function persistPhotos() {
  if (!canUseStorage()) return;

  const db = await openPhotoDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE, "readwrite");
    const store = transaction.objectStore(PHOTO_STORE);
    store.clear();

    state.photos.forEach((photo, order) => {
      if (!photo.file) return;
      store.put({
        id: photo.id,
        blob: photo.file,
        exifData: photo.exifData,
        filename: photo.filename,
        order,
      } satisfies StoredPhotoEntry);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  localStorage.setItem(ACTIVE_INDEX_KEY, String(state.activeIndex));
}

async function clearPersistedPhotos() {
  if (!canUseStorage()) return;

  const db = await openPhotoDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE, "readwrite");
    transaction.objectStore(PHOTO_STORE).clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  localStorage.removeItem(ACTIVE_INDEX_KEY);
}

function startHydration() {
  if (hydrationStarted || !canUseStorage()) {
    if (!state.isHydrated && !canUseStorage()) {
      state = { ...state, isHydrated: true };
    }
    return;
  }

  hydrationStarted = true;
  readStoredPhotos()
    .then((storedPhotos) => {
      state.photos.forEach((photo) => URL.revokeObjectURL(photo.objectUrl));

      const photos = storedPhotos
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .slice(0, MAX_PHOTOS)
        .map((photo) => ({
          id: photo.id,
          objectUrl: URL.createObjectURL(photo.blob),
          exifData: photo.exifData,
          filename: photo.filename,
          file: photo.blob,
        }));

      const savedIndex = Number(localStorage.getItem(ACTIVE_INDEX_KEY) ?? 0);
      const activeIndex = Number.isFinite(savedIndex)
        ? Math.min(Math.max(savedIndex, 0), Math.max(photos.length - 1, 0))
        : 0;

      state = { photos, activeIndex, isHydrated: true };
      emit();
    })
    .catch(() => {
      state = { ...state, isHydrated: true };
      emit();
    });
}

export async function addPhotos(entries: PhotoEntry[]) {
  const available = MAX_PHOTOS - state.photos.length;
  const toAdd = entries.slice(0, available).map((entry) => ({
    ...entry,
    id: entry.id || crypto.randomUUID(),
  }));
  if (toAdd.length === 0) return;
  state = {
    photos: [...state.photos, ...toAdd],
    activeIndex: state.photos.length,
    isHydrated: true,
  };
  emit();
  await persistPhotos();
}

export function removePhoto(index: number) {
  const photo = state.photos[index];
  if (!photo) return;
  URL.revokeObjectURL(photo.objectUrl);
  const photos = state.photos.filter((_, i) => i !== index);
  let activeIndex = state.activeIndex;
  if (activeIndex >= photos.length) activeIndex = Math.max(0, photos.length - 1);
  state = { ...state, photos, activeIndex };
  emit();
  persistPhotos().catch(() => {});
}

export function setActiveIndex(index: number) {
  if (index < 0 || index >= state.photos.length) return;
  state = { ...state, activeIndex: index };
  emit();
  persistPhotos().catch(() => {});
}

export function clearPhotos() {
  state.photos.forEach((p) => URL.revokeObjectURL(p.objectUrl));
  state = { photos: [], activeIndex: 0, isHydrated: true };
  emit();
  clearPersistedPhotos().catch(() => {});
}

export function getPhotoSnapshot(): PhotoStoreState {
  return state;
}

export function usePhotoStore() {
  startHydration();

  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getPhotoSnapshot,
    getPhotoSnapshot
  );
}
