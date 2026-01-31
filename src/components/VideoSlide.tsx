"use client";

import { useRef, useEffect, useState } from "react";
import { Heart, Share2, MessageCircle } from "lucide-react";
import type { Video } from "@/types/database";

interface VideoSlideProps {
  video: Video;
  isActive: boolean;
}

export default function VideoSlide({ video, isActive }: VideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, user needs to interact
      });
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const handleVideoTap = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: video.description,
        url: window.location.href,
      });
    }
  };

  const truncatedWallet = video.creator_wallet
    ? `${video.creator_wallet.slice(0, 6)}...${video.creator_wallet.slice(-4)}`
    : "Anonymous";

  return (
    <div className="relative h-full w-full bg-black">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.video_url}
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted
        playsInline
        onClick={handleVideoTap}
      />

      {/* Pause Indicator */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center">
            <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
          </div>
        </div>
      )}

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Heart
              className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </div>
          <span className="text-white text-xs font-medium">Like</span>
        </button>

        {/* Comment Button */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">Comment</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">Share</span>
        </button>
      </div>

      {/* Bottom Info - positioned above bottom nav */}
      <div className="absolute left-4 right-20 bottom-24 flex flex-col gap-2">
        {/* Creator */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5F31E8] to-[#7C4DFF] flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {video.creator_wallet?.slice(2, 4).toUpperCase() || "??"}
            </span>
          </div>
          <span className="text-white font-semibold text-sm">
            {truncatedWallet}
          </span>
          {video.is_exclusive && (
            <span className="px-2 py-0.5 bg-[#5F31E8] rounded-full text-[10px] text-white font-medium">
              EXCLUSIVE
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-white text-sm leading-5 line-clamp-2">
          {video.description}
        </p>

        {/* Price if exclusive */}
        {video.is_exclusive && video.price > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[#7C4DFF] font-bold text-sm">
              {video.price} MON
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
