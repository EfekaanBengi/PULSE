"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import VideoSlide from "./VideoSlide";
import VideoFeedSkeleton from "./VideoFeedSkeleton";
import { getVideos } from "@/lib/api";
import type { Video } from "@/types/database";

import "swiper/css";

export default function VideoFeed() {
  const searchParams = useSearchParams();
  const initialVideoId = searchParams.get("video");
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      setIsLoading(true);
      const data = await getVideos();

      // If a specific video is requested, move it to the front
      if (initialVideoId) {
        const targetIndex = data.findIndex(v => v.id === initialVideoId);
        if (targetIndex !== -1) {
          const targetVideo = data.splice(targetIndex, 1)[0];
          data.unshift(targetVideo);
        }
      }

      setVideos(data);
      setIsLoading(false);
    }

    fetchVideos();
  }, [initialVideoId]);

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  };

  if (isLoading) {
    return <VideoFeedSkeleton />;
  }

  if (videos.length === 0) {
    return (
      <div className="h-[100dvh] w-full bg-black flex items-center justify-center">
        <div className="text-center px-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-white text-lg font-semibold mb-2">
            No videos yet
          </h2>
          <p className="text-zinc-500 text-sm">
            Be the first to upload a video!
          </p>
        </div>
      </div>
    );
  }

  return (
    <Swiper
      direction="vertical"
      modules={[Mousewheel, Keyboard]}
      mousewheel={{ forceToAxis: true, sensitivity: 1, thresholdDelta: 50 }}
      keyboard={{ enabled: true }}
      slidesPerView={1}
      speed={500}
      threshold={10}
      className="h-[100dvh] w-full bg-black"
      onSlideChange={handleSlideChange}
      resistance={true}
      resistanceRatio={0.85}
    >
      {videos.map((video, index) => (
        <SwiperSlide key={video.id} className="h-full">
          <VideoSlide video={video} isActive={index === activeIndex} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
