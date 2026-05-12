import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { alternativePages } from "@/lib/seo";

export const metadata: Metadata = {
  title: "EXIF Frame Tool Alternatives",
  description:
    "Compare FrameShot with basic EXIF frame tools, manual Canva or Photoshop workflows, and other ways to add camera settings to photos.",
  alternates: {
    canonical: "/alternatives",
  },
  openGraph: {
    title: "EXIF Frame Tool Alternatives",
    description:
      "Compare workflows for creating EXIF frames, photo metadata overlays, and camera settings watermarks.",
    url: "/alternatives",
    type: "website",
  },
};

export default function AlternativesPage() {
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
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">Alternatives</p>
          <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.3px] sm:text-[56px]">
            EXIF frame tool alternatives
          </h1>
          <p className="max-w-[680px] text-base leading-8 text-neutral-400">
            Compare ways to add camera settings to photos, from purpose-built browser tools to manual design
            templates.
          </p>
        </header>
        <section className="grid gap-4 sm:grid-cols-2">
          {alternativePages.map((page) => (
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
