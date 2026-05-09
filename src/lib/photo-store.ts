import { useSyncExternalStore } from "react";
import type { ExifData } from "./exif";

export const MAX_PHOTOS = 10;

const THUMBNAIL_MAX_PX = 1400;
const THUMBNAIL_QUALITY = 0.82;
const PERSIST_TTL_MS = 24 * 60 * 60 * 1000;
const QUOTA_SAFETY_FACTOR = 1.5;

export interface PhotoEntry {
  id: string;
  objectUrl: string;
  exifData: ExifData;
  filename: string;
  file?: Blob;
  _thumbnailBlob?: Blob;
}

interface PhotoStoreState {
  photos: PhotoEntry[];
  activeIndex: number;
  isHydrated: boolean;
  storageWarning: string | null;
}

let state: PhotoStoreState = {
  photos: [],
  activeIndex: 0,
  isHydrated: false,
  storageWarning: null,
};

const listeners = new Set<() => void>();

const DB_NAME = "frameshot-photo-store";
const DB_VERSION = 2;
const PHOTO_STORE = "photos";
const ACTIVE_INDEX_KEY = "frameshot-active-index";

let hydrationStarted = false;
let dbPromise: Promise<IDBDatabase> | null = null;

interface StoredPhotoEntry {
  id: string;
  thumbnailBlob: Blob;
  fullBlob?: Blob;
  exifData: ExifData;
  filename: string;
  order: number;
  savedAt: number;
}

interface PersistResult {
  quotaExceeded: boolean;
  error: Error | null;
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

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (event.oldVersion < DB_VERSION && db.objectStoreNames.contains(PHOTO_STORE)) {
        db.deleteObjectStore(PHOTO_STORE);
      }
      db.createObjectStore(PHOTO_STORE, { keyPath: "id" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function generateThumbnail(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, THUMBNAIL_MAX_PX / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    return canvas.convertToBlob({ type: "image/jpeg", quality: THUMBNAIL_QUALITY });
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Thumbnail generation failed"))),
      "image/jpeg",
      THUMBNAIL_QUALITY
    );
  });
}

async function hasEnoughQuota(estimatedBytes: number): Promise<boolean> {
  if (!navigator?.storage?.estimate) return true;
  try {
    const { usage = 0, quota = Infinity } = await navigator.storage.estimate();
    return quota - usage > estimatedBytes * QUOTA_SAFETY_FACTOR;
  } catch {
    return true;
  }
}

async function readStoredPhotos(): Promise<StoredPhotoEntry[]> {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readonly");
    const req = tx.objectStore(PHOTO_STORE).getAll();
    req.onsuccess = () => resolve(req.result as StoredPhotoEntry[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getPhotoBlob(id: string): Promise<Blob | null> {
  if (!canUseStorage()) return null;
  try {
    const db = await openPhotoDb();
    return new Promise((resolve) => {
      const tx = db.transaction(PHOTO_STORE, "readonly");
      const req = tx.objectStore(PHOTO_STORE).get(id);
      req.onsuccess = () => resolve((req.result as StoredPhotoEntry | undefined)?.fullBlob ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function persistPhotos(): Promise<PersistResult> {
  if (!canUseStorage()) return { quotaExceeded: false, error: null };

  const estimatedBytes = state.photos.reduce(
    (sum, p) => sum + (p.file?.size ?? 0) + 60_000,
    0
  );
  const enoughQuota = await hasEnoughQuota(estimatedBytes);

  try {
    const db = await openPhotoDb();
    const savedAt = Date.now();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readwrite");
      const store = tx.objectStore(PHOTO_STORE);
      store.clear();

      state.photos.forEach((photo, order) => {
        if (!photo._thumbnailBlob) return;

        const entry: StoredPhotoEntry = {
          id: photo.id,
          thumbnailBlob: photo._thumbnailBlob,
          exifData: photo.exifData,
          filename: photo.filename,
          order,
          savedAt,
        };

        if (enoughQuota && photo.file) {
          entry.fullBlob = photo.file;
        }

        store.put(entry);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    localStorage.setItem(ACTIVE_INDEX_KEY, String(state.activeIndex));
    return { quotaExceeded: !enoughQuota, error: null };
  } catch (err) {
    return {
      quotaExceeded: false,
      error: err instanceof Error ? err : new Error("Unknown IDB error"),
    };
  }
}

async function clearPersistedPhotos() {
  if (!canUseStorage()) return;
  try {
    const db = await openPhotoDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readwrite");
      tx.objectStore(PHOTO_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    localStorage.removeItem(ACTIVE_INDEX_KEY);
  } catch {}
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
    .then(async (storedPhotos) => {
      state.photos.forEach((p) => URL.revokeObjectURL(p.objectUrl));

      const now = Date.now();
      const staleIds: string[] = [];

      const freshEntries = storedPhotos
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .slice(0, MAX_PHOTOS)
        .filter((p) => {
          const fresh = now - (p.savedAt ?? 0) < PERSIST_TTL_MS;
          if (!fresh) staleIds.push(p.id);
          return fresh;
        });

      if (staleIds.length > 0) {
        openPhotoDb()
          .then((db) => {
            const tx = db.transaction(PHOTO_STORE, "readwrite");
            const store = tx.objectStore(PHOTO_STORE);
            staleIds.forEach((id) => store.delete(id));
          })
          .catch(() => {});
      }

      const photos: PhotoEntry[] = freshEntries.map((stored) => ({
        id: stored.id,
        objectUrl: URL.createObjectURL(stored.thumbnailBlob),
        _thumbnailBlob: stored.thumbnailBlob,
        exifData: stored.exifData,
        filename: stored.filename,
      }));

      const savedIndex = Number(localStorage.getItem(ACTIVE_INDEX_KEY) ?? 0);
      const activeIndex = Number.isFinite(savedIndex)
        ? Math.min(Math.max(savedIndex, 0), Math.max(photos.length - 1, 0))
        : 0;

      state = { photos, activeIndex, isHydrated: true, storageWarning: null };
      emit();
    })
    .catch(() => {
      state = { ...state, isHydrated: true };
      emit();
    });
}

export async function addPhotos(entries: PhotoEntry[]) {
  const available = MAX_PHOTOS - state.photos.length;
  if (available <= 0) return;

  const enriched = await Promise.all(
    entries.slice(0, available).map(async (entry) => {
      const id = entry.id || crypto.randomUUID();
      let thumbnailBlob: Blob | undefined;
      let thumbnailUrl = entry.objectUrl;

      if (entry.file) {
        try {
          thumbnailBlob = await generateThumbnail(entry.file);
          thumbnailUrl = URL.createObjectURL(thumbnailBlob);
          URL.revokeObjectURL(entry.objectUrl);
        } catch {
          thumbnailBlob = undefined;
          thumbnailUrl = entry.objectUrl;
        }
      }

      return { ...entry, id, objectUrl: thumbnailUrl, _thumbnailBlob: thumbnailBlob };
    })
  );

  state = {
    ...state,
    photos: [...state.photos, ...enriched],
    activeIndex: state.photos.length,
    isHydrated: true,
  };
  emit();

  const result = await persistPhotos();

  const storageWarning = result.quotaExceeded
    ? "Storage is almost full — photos saved for this session only. Full-resolution export still works now."
    : result.error
    ? "Could not save photos for the next session. Export still works now."
    : null;

  if (storageWarning !== state.storageWarning) {
    state = { ...state, storageWarning };
    emit();
  }
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
  state = { photos: [], activeIndex: 0, isHydrated: true, storageWarning: null };
  emit();
  clearPersistedPhotos();
}

export function clearStorageWarning() {
  if (state.storageWarning === null) return;
  state = { ...state, storageWarning: null };
  emit();
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
