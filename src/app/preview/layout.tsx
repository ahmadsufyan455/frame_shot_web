import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FrameShot Editor",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
