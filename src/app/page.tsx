import UploadZone from "@/components/UploadZone";

/**
 * Landing page — F-01: Photo Upload
 *
 * The upload zone is the first thing the user sees.
 * It must be the largest element on the page (per PRD 6.2).
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 px-4">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Frame<span className="text-indigo-400">Shot</span>
        </h1>
        <p className="mt-2 text-neutral-400 text-sm">
          Your shot. Your gear. Your story.
        </p>
      </header>

      {/* Upload Zone — core entry point */}
      <UploadZone />

      {/* Footer */}
      <footer className="mt-12 text-neutral-600 text-xs">
        © {new Date().getFullYear()} FrameShot — Free & Open. No sign-up
        required.
      </footer>
    </main>
  );
}
