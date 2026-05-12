import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "FrameShot - Free EXIF Frame Generator",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Create beautiful EXIF frames and camera settings overlays for photos. Free, private, no sign-up, and processed entirely in your browser.",
  keywords: [
    "EXIF frame generator",
    "EXIF watermark tool",
    "EXIF frame",
    "add camera info to photo online",
    "photo EXIF overlay",
    "camera settings watermark",
    "camera settings overlay",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FrameShot - Free EXIF Frame Generator",
    description:
      "Automatically read EXIF metadata from your photo and render it as a beautiful, shareable frame. Free, no sign-up, and 100% private.",
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "FrameShot app preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FrameShot - EXIF Frame Generator",
    description:
      "Add beautiful EXIF frames to your photos. Free. No sign-up. Processed entirely in your browser.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token":"c7c1c4f67bd54213935f0a131fa69772"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
