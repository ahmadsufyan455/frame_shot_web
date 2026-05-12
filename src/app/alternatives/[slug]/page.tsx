import { notFound } from "next/navigation";
import SeoPage from "@/components/SeoPage";
import { alternativePages, createPageMetadata, getAlternativePage } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return alternativePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const page = getAlternativePage((await params).slug);
  return page ? createPageMetadata(page) : {};
}

export default async function AlternativeSeoPage({ params }: PageProps) {
  const page = getAlternativePage((await params).slug);
  if (!page) notFound();

  return <SeoPage page={page} />;
}
