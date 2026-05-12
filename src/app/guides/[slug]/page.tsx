import { notFound } from "next/navigation";
import SeoPage from "@/components/SeoPage";
import { createPageMetadata, getGuidePage, guidePages } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return guidePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const page = getGuidePage((await params).slug);
  return page ? createPageMetadata(page) : {};
}

export default async function GuideSeoPage({ params }: PageProps) {
  const page = getGuidePage((await params).slug);
  if (!page) notFound();

  return <SeoPage page={page} />;
}
