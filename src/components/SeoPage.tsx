import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import {
  SEO_EXAMPLE_IMAGE,
  breadcrumbJsonLd,
  faqJsonLd,
  softwareApplicationJsonLd,
  type SeoPage as SeoPageContent,
} from "@/lib/seo";

type SeoPageProps = {
  page: SeoPageContent;
};

export default function SeoPage({ page }: SeoPageProps) {
  const jsonLd = [
    breadcrumbJsonLd(page),
    faqJsonLd(page.faq),
    ...(page.section === "tool" || page.section === "alternative" ? [softwareApplicationJsonLd(page.path)] : []),
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <JsonLd data={jsonLd} />

      <section className="px-5 py-8 sm:px-6 sm:py-12 lg:px-10">
        <div className="mx-auto grid w-full max-w-[1120px] gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 text-sm text-[#a1a1a1] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to FrameShot
            </Link>
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">{page.eyebrow}</p>
              <h1 className="max-w-[760px] text-[40px] font-bold leading-[1.05] tracking-[-0.3px] text-white sm:text-[56px]">
                {page.title}
              </h1>
              <p className="max-w-[680px] text-base leading-8 text-neutral-300 sm:text-lg">{page.intro}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
              >
                {page.cta}
              </Link>
              <Link
                href="/guides/what-is-exif-data"
                className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:border-neutral-500 hover:bg-neutral-900"
              >
                Learn about EXIF
              </Link>
            </div>
          </div>

          <figure className="overflow-hidden rounded-[8px] border border-neutral-800 bg-neutral-950">
            <Image
              src={SEO_EXAMPLE_IMAGE}
              alt="Example FrameShot EXIF frame showing camera settings below a photo"
              width={1200}
              height={800}
              priority
              className="h-auto w-full"
            />
          </figure>
        </div>
      </section>

      <section className="border-y border-neutral-900 px-5 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid w-full max-w-[1120px] gap-5 md:grid-cols-3">
          {page.sections.map((section) => (
            <article key={section.title} className="rounded-[8px] border border-neutral-800 bg-[#101010] p-6">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-neutral-400">{section.body}</p>
              {section.items ? (
                <ul className="mt-5 flex flex-col gap-2 text-sm text-neutral-300">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-neutral-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {page.section === "alternative" ? (
        <section className="px-5 py-12 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-[1120px] overflow-hidden rounded-[8px] border border-neutral-800">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-neutral-950 text-neutral-300">
                <tr>
                  <th className="p-4 font-semibold">Workflow</th>
                  <th className="p-4 font-semibold">Best for</th>
                  <th className="p-4 font-semibold">Tradeoff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-400">
                <tr>
                  <td className="p-4 text-white">FrameShot</td>
                  <td className="p-4">Fast EXIF frames with editable metadata</td>
                  <td className="p-4">Focused on frames, not full image editing</td>
                </tr>
                <tr>
                  <td className="p-4 text-white">Canva or Photoshop</td>
                  <td className="p-4">Custom brand templates and complex design</td>
                  <td className="p-4">Manual typing and slower repeated exports</td>
                </tr>
                <tr>
                  <td className="p-4 text-white">Basic EXIF frame tools</td>
                  <td className="p-4">Single-template quick exports</td>
                  <td className="p-4">Less control over style and missing fields</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="px-5 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto grid w-full max-w-[1120px] gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-2xl font-semibold text-white">Common questions</h2>
            <div className="mt-6 flex flex-col divide-y divide-neutral-900 border-y border-neutral-900">
              {page.faq.map((item) => (
                <article key={item.question} className="py-6">
                  <h3 className="text-base font-semibold text-white">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-400">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-[8px] border border-neutral-800 bg-[#101010] p-6">
            <h2 className="text-base font-semibold text-white">Related pages</h2>
            <div className="mt-4 flex flex-col gap-3">
              {page.related.map((href) => (
                <Link key={href} href={href} className="text-sm text-neutral-400 transition-colors hover:text-white">
                  {href.replaceAll("/", " ").trim()}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
