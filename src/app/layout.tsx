import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "FrameShot — Your shot. Your gear. Your story.",
  description:
    "Add beautiful EXIF frames to your photos in seconds. Upload a photo, pick a style, download the result. Free. No sign-up. Processed entirely in your browser.",
  keywords: [
    "EXIF watermark tool",
    "EXIF frame",
    "add camera info to photo online",
    "photo EXIF overlay",
    "camera settings watermark",
  ],
  openGraph: {
    title: "FrameShot — Your shot. Your gear. Your story.",
    description:
      "Automatically read EXIF metadata from your photo and render it as a beautiful, shareable frame. Free. No sign-up. 100% private.",
    type: "website",
    url: "https://frameshot.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "FrameShot — EXIF Frame Generator",
    description:
      "Add beautiful EXIF frames to your photos. Free. No sign-up. Processed entirely in your browser.",
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
      >
        {children}
        {/* TODO: Add Plausible analytics script here */}
      </body>
    </html>
  );
}
