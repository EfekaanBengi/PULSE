import { Suspense } from "react";
import VideoFeed from "@/components/VideoFeed";
import VideoFeedSkeleton from "@/components/VideoFeedSkeleton";

export default function Home() {
  return (
    <Suspense fallback={<VideoFeedSkeleton />}>
      <VideoFeed />
    </Suspense>
  );
}
