import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Notes - FrameShot",
  description:
    "FrameShot processes photos locally in your browser. Photos are not uploaded to our servers, and GPS EXIF data is ignored.",
};

const sections = [
  {
    title: "Local photo processing",
    body: "FrameShot runs in your browser. When you add photos, the app reads the file locally, extracts the camera details needed for the frame, and renders the final image on your device.",
  },
  {
    title: "No photo uploads",
    body: "Your photos are not uploaded to FrameShot servers for editing, previewing, or exporting. The generated frame is created directly in your browser.",
  },
  {
    title: "GPS metadata is ignored",
    body: "FrameShot intentionally ignores GPS EXIF fields. The app only uses display metadata such as camera model, lens, focal length, aperture, shutter speed, ISO, exposure compensation, white balance, and capture time.",
  },
  {
    title: "Browser storage",
    body: "FrameShot may keep photos and edits in your browser storage so you can move between the upload and preview screens. You can remove this local data by clearing site data in your browser.",
  },
  {
    title: "Analytics",
    body: "If analytics are added later, they should be limited to product usage events such as uploads, selected styles, and exports. Photo files and EXIF contents should not be sent as analytics data.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-8 text-white sm:py-12">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-10">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 text-sm text-[#a1a1a1] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to FrameShot
        </Link>

        <header className="flex flex-col gap-4">
          <p className="text-sm font-medium text-neutral-500">Privacy Notes</p>
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.35px] text-white sm:text-[44px]">
            Your photos stay on your device.
          </h1>
          <p className="max-w-[640px] text-base leading-7 text-neutral-400">
            FrameShot is designed as a private, browser-based photo tool. The
            short version: your photos are processed locally, GPS data is
            ignored, and exports are generated on your device.
          </p>
        </header>

        <section className="flex flex-col gap-6">
          {sections.map((section) => (
            <article key={section.title} className="border-t border-[#262626] pt-6">
              <h2 className="text-base font-semibold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-400">{section.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
