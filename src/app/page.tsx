import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import UploadZone from "@/components/UploadZone";
import { alternativePages, guidePages, softwareApplicationJsonLd, toolPages } from "@/lib/seo";
import appIcon from "./exif_frame_shot.png";

const homepageFaq = [
  {
    question: "What does FrameShot do?",
    answer:
      "FrameShot reads photo metadata and creates a clean EXIF frame with camera, lens, aperture, shutter speed, ISO, focal length, and date when those fields are available.",
  },
  {
    question: "Which formats are supported?",
    answer:
      "FrameShot accepts JPEG, PNG, and HEIC photo formats. RAW formats (CR3, ARW, NEF, RAF, DNG) are not supported as browsers cannot display them.",
  },
  {
    question: "Are photos uploaded to a server?",
    answer:
      "No. Photos are processed locally in your browser, and GPS metadata is ignored for privacy.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <JsonLd data={softwareApplicationJsonLd("/")} />

      <section className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-[760px] flex-col items-center justify-center gap-7 text-center">
          <div className="flex flex-col items-center gap-4">
            <Image
              src={appIcon}
              alt="FrameShot app icon"
              width={72}
              height={72}
              priority
              className="size-16 rounded-[16px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
            />
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-neutral-400">FrameShot</p>
              <h1 className="max-w-[680px] text-[34px] font-bold leading-[1.08] tracking-[-0.3px] text-white sm:text-[52px]">
                Add camera settings to your photos
              </h1>
              <p className="max-w-[520px] text-sm leading-6 text-neutral-400 sm:text-base sm:leading-7">
                Upload a photo, choose a clean EXIF frame, then download. Free, private, and processed in your browser.
              </p>
            </div>
          </div>

          <div className="w-full rounded-[8px] border border-neutral-800 bg-[#101010] p-3 shadow-2xl shadow-black/20">
            <UploadZone />
            <p className="px-2 pt-4 text-center text-xs leading-5 text-neutral-500">
              Photos stay on your device.{" "}
              <Link href="/privacy" className="text-neutral-300 underline underline-offset-4 transition-colors hover:text-white">
                Privacy notes
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-900 px-4 py-12 sm:px-6">
        <div className="mx-auto w-full max-w-[760px]">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-500">What FrameShot does</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Creates a clean EXIF frame from your photo metadata.</h2>
            </div>
            <p className="text-sm leading-7 text-neutral-400">
              FrameShot shows useful camera details such as camera body, lens, aperture, shutter speed, ISO,
              focal length, white balance, and capture date without uploading your photo.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-900 px-4 py-12 sm:px-6">
        <div className="mx-auto grid w-full max-w-[880px] gap-10 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-medium text-neutral-500">Explore</p>
              <h2 className="mt-2 text-xl font-semibold">Guides and related tools</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[...toolPages, ...guidePages, ...alternativePages].map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  {page.metaTitle}
                </Link>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-medium text-neutral-500">FAQ</p>
              <h2 className="mt-2 text-xl font-semibold">Quick answers</h2>
            </div>
            <div className="flex flex-col divide-y divide-neutral-900 border-y border-neutral-900">
              {homepageFaq.map((item) => (
                <article key={item.question} className="py-6">
                  <h3 className="text-sm font-semibold">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-400">{item.answer}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
