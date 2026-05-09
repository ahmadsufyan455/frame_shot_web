/**
 * /frame — legacy route, superseded by /preview
 *
 * Kept as a redirect so old bookmarks / deep links don't 404.
 * All editor logic now lives in src/app/preview/page.tsx.
 */

import { redirect } from "next/navigation";

export default function FramePage() {
  redirect("/preview");
}
