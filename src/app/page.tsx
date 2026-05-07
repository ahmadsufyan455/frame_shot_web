import UploadZone from "@/components/UploadZone";
import { Camera } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-6">
      <div className="flex flex-col gap-16 items-center justify-center w-full max-w-[1123px]">
        
        <div className="flex flex-col items-center justify-center relative">
          <div className="bg-white drop-shadow-[0px_0px_20px_rgba(255,255,255,0.1)] flex items-center justify-center rounded-[24px] size-[80px] mb-6">
            <Camera className="size-[36px] text-black" strokeWidth={1.5} />
          </div>
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
