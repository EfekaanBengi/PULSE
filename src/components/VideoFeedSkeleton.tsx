"use client";

export default function VideoFeedSkeleton() {
  return (
    <div className="h-[100dvh] w-full bg-black flex flex-col">
      {/* Video area skeleton */}
      <div className="flex-1 relative">
        {/* Pulsing background */}
        <div className="absolute inset-0 bg-zinc-900 animate-pulse" />

        {/* Right side action buttons skeleton */}
        <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-zinc-800 animate-pulse" />
              <div className="w-8 h-2 bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Bottom info skeleton */}
        <div className="absolute left-4 right-20 bottom-24 flex flex-col gap-3">
          {/* Creator skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
            <div className="w-24 h-4 bg-zinc-800 rounded animate-pulse" />
          </div>

          {/* Description skeleton */}
          <div className="flex flex-col gap-2">
            <div className="w-full h-3 bg-zinc-800 rounded animate-pulse" />
            <div className="w-2/3 h-3 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>

        {/* Center loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-zinc-700 border-t-[#5F31E8] rounded-full animate-spin" />
            <span className="text-zinc-500 text-sm">Loading videos...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
