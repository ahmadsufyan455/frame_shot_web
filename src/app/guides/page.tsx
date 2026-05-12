import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { guidePages } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Photography EXIF Guides",
  description:
    "Practical guides for understanding EXIF data, adding camera settings to photos, and creating Instagram-ready frames for photographers.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    title: "Photography EXIF Guides",
    description:
      "Learn how to understand photo metadata, add camera settings to images, and create clean frames for photography posts.",
    url: "/guides",
    type: "website",
  },
};

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-5 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-10">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 text-sm text-[#a1a1a1] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to FrameShot
        </Link>
        <header className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">Guides</p>
          <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.3px] sm:text-[56px]">
            Photography EXIF guides
          </h1>
          <p className="max-w-[680px] text-base leading-8 text-neutral-400">
            Learn what EXIF data means, how to add camera settings to photos, and how to choose frames that
            look clean when shared online.
          </p>
        </header>
        <section className="grid gap-4 sm:grid-cols-2">
          {guidePages.map((page) => (
            <Link
              key={page.path}
              href={page.path}
              className="rounded-[8px] border border-neutral-800 bg-[#101010] p-5 transition-colors hover:border-neutral-600"
            >
              <h2 className="text-lg font-semibold">{page.title}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-400">{page.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
