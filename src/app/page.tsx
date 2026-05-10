import Image from "next/image";
import Link from "next/link";
import UploadZone from "@/components/UploadZone";
import appIcon from "./exif_frame_shot.png";

export default function HomePage() {
  return (
    <main className="h-dvh overflow-hidden bg-[#0a0a0a] px-4 py-3 sm:px-6 sm:py-6 lg:px-10 lg:py-10">
      <div className="mx-auto flex h-full w-full max-w-[1123px] flex-col items-center justify-center gap-5 sm:gap-8 lg:gap-10">
        <div className="flex shrink-0 flex-col items-center justify-center relative">
          <Image
            src={appIcon}
            alt="FrameShot"
            width={80}
            height={80}
            priority
            className="mb-3 size-14 rounded-[18px] drop-shadow-[0px_0px_20px_rgba(255,255,255,0.1)] sm:mb-6 sm:size-20 sm:rounded-[24px]"
          />
          <h1 className="font-bold text-[30px] leading-[36px] text-white tracking-[-0.35px] whitespace-nowrap mb-2">
            FrameShot
          </h1>
          <p className="font-normal text-[#a1a1a1] text-[14px] leading-[20px] tracking-[-0.15px] whitespace-nowrap">
            Your shot. Your gear. Your story.
          </p>
        </div>

        <div className="flex min-h-0 w-full shrink-0 justify-center">
          <UploadZone />
        </div>

        <p className="mx-auto max-w-[560px] shrink-0 text-center text-[12px] leading-5 text-neutral-500 sm:text-[13px] sm:leading-6">
          Your photos are processed locally in your browser and are not uploaded
          to our servers. GPS metadata is ignored.{" "}
          <Link href="/privacy" className="text-neutral-300 underline underline-offset-4 transition-colors hover:text-white">
            Read privacy notes
          </Link>
        </p>

      </div>
    </main>
  );
}
