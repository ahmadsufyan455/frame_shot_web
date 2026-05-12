import { notFound } from "next/navigation";
import SeoPage from "@/components/SeoPage";
import { createPageMetadata, getToolPage, toolPages } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return toolPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const page = getToolPage((await params).slug);
  return page ? createPageMetadata(page) : {};
}

export default async function ToolSeoPage({ params }: PageProps) {
  const page = getToolPage((await params).slug);
  if (!page) notFound();

  return <SeoPage page={page} />;
}
