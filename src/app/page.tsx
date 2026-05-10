import Image from "next/image";
import UploadZone from "@/components/UploadZone";
import appIcon from "./exif_frame_shot.png";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-6">
      <div className="flex flex-col gap-16 items-center justify-center w-full max-w-[1123px]">
        
        <div className="flex flex-col items-center justify-center relative">
          <Image
            src={appIcon}
            alt="FrameShot"
            width={80}
            height={80}
            priority
            className="mb-6 size-[80px] rounded-[24px] drop-shadow-[0px_0px_20px_rgba(255,255,255,0.1)]"
          />
          <h1 className="font-bold text-[30px] leading-[36px] text-white tracking-[-0.35px] whitespace-nowrap mb-2">
            FrameShot
          </h1>
          <p className="font-normal text-[#a1a1a1] text-[14px] leading-[20px] tracking-[-0.15px] whitespace-nowrap">
            Your shot. Your gear. Your story.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <UploadZone />
        </div>

      </div>
    </main>
  );
}
