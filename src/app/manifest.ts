import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FrameShot - EXIF Frame Generator",
    short_name: "FrameShot",
    description:
      "Add beautiful EXIF frames to your photos in seconds. Free, private, and processed in your browser.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    categories: ["photo", "utilities", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icons/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
