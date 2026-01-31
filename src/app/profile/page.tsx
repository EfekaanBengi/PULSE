"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Play, Lock, LogOut, Copy, Check, TrendingUp } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { getVideosByCreator } from "@/lib/api";
import type { Video } from "@/types/database";

export default function ProfilePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock earnings data
  const mockEarnings = 150;
  const mockViews = 12500;

  useEffect(() => {
    if (address) {
      loadVideos();
    }
  }, [address]);

  const loadVideos = async () => {
    if (!address) return;
    setIsLoading(true);
    const data = await getVideosByCreator(address);
    setVideos(data);
    setIsLoading(false);
  };

  const handleCopyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedWallet = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 pb-20">
        <div className="w-20 h-20 rounded-full bg-[#5F31E8]/20 flex items-center justify-center mb-6">
          <Wallet className="w-10 h-10 text-[#7C4DFF]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Connect Wallet</h1>
        <p className="text-white/60 text-center mb-8 max-w-xs">
          Connect your wallet to view your profile and uploaded videos
        </p>
        <button
          onClick={() => openConnectModal?.()}
          className="px-8 py-4 bg-gradient-to-r from-[#5F31E8] to-[#7C4DFF] rounded-xl text-white font-semibold text-lg"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Profile Header */}
      <div className="relative pt-8 pb-6 px-4">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#5F31E8]/30 to-transparent" />

        <div className="relative flex flex-col items-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#5F31E8] to-[#7C4DFF] flex items-center justify-center mb-4 ring-4 ring-black">
            <span className="text-white text-2xl font-bold">
              {address?.slice(2, 4).toUpperCase()}
            </span>
          </div>

          {/* Wallet Address */}
          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4 hover:bg-white/20 transition-colors"
          >
            <span className="text-white font-medium">{truncatedWallet}</span>
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-white/60" />
            )}
          </button>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-white font-bold text-xl">{videos.length}</p>
              <p className="text-white/60 text-sm">Videos</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-white font-bold text-xl">{mockViews.toLocaleString()}</p>
              <p className="text-white/60 text-sm">Views</p>
            </div>
          </div>

          {/* Earnings Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5F31E8] to-[#7C4DFF] rounded-full">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-white font-bold">{mockEarnings} MON</span>
            <span className="text-white/80 text-sm">Earned</span>
          </div>

          {/* Disconnect Button */}
          <button
            onClick={() => disconnect()}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Disconnect</span>
          </button>
        </div>
      </div>

      {/* Videos Section */}
      <div className="px-4">
        <h2 className="text-white font-semibold text-lg mb-4">Your Videos</h2>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[9/16] bg-white/10 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 text-center mb-4">No videos uploaded yet</p>
            <button
              onClick={() => router.push("/upload")}
              className="px-6 py-3 bg-[#5F31E8] hover:bg-[#7C4DFF] rounded-xl text-white font-medium transition-colors"
            >
              Upload Your First Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {videos.map((video) => (
              <div
                key={video.id}
                className="relative aspect-[9/16] bg-white/10 rounded-lg overflow-hidden group cursor-pointer"
                onClick={() => router.push(`/?video=${video.id}`)}
              >
                <video
                  src={video.video_url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
                {/* Exclusive Badge */}
                {video.is_exclusive && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#5F31E8] flex items-center justify-center">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                )}
                {/* Price Tag */}
                {video.is_exclusive && video.price > 0 && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-[#7C4DFF] font-medium">
                    {video.price} MON
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats Cards */}
      {videos.length > 0 && (
        <div className="px-4 mt-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-[#7C4DFF]" />
                <span className="text-white/60 text-sm">Exclusive</span>
              </div>
              <p className="text-white font-bold text-xl">
                {videos.filter((v) => v.is_exclusive).length}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-4 h-4 text-[#7C4DFF]" />
                <span className="text-white/60 text-sm">Free</span>
              </div>
              <p className="text-white font-bold text-xl">
                {videos.filter((v) => !v.is_exclusive).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
